import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { sendOTPEmail } from '../../services/email.service.js';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { generateUniqueSlug } from './slug-helper.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create supplier registration with OTP
export const createSupplierWithOTPService = async (data) => {
  try {
    const {
      email,
      password,
      companyName,
      country,
      city,
      address,
      phone,
      website,
      description,
      therapeutics,
      manufacturer,
      yearsInBusiness,
      contactEmail,
      contactPhone,
      contactName,
      contactDesignation,
      gstNumber,
      licenseNumber,
      licenseType,
      licenseExpiry,
      postalCode
    } = data;

    // STEP 1: Normalize email (ALWAYS lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Debug logging (temporary)
    logger.info(`[createSupplierWithOTPService] Checking email: ${normalizedEmail}`);

    // STEP 2: Check for existing user (excluding soft-deleted)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null
      },
      include: {
        supplier: true // Include supplier to check verification status
      }
    });

    // Debug logging (temporary)
    logger.info(`[createSupplierWithOTPService] Existing user found:`, existingUser ? {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      hasSupplier: !!existingUser.supplier,
      supplierVerified: existingUser.supplier?.isVerified,
      supplierDeleted: !!existingUser.supplier?.deletedAt
    } : 'null');

    // If user exists, check supplier verification status
    if (existingUser) {
      // If user has a supplier profile
      if (existingUser.supplier) {
        // If supplier is verified → block registration
        if (existingUser.supplier.isVerified) {
          throw new ApiError(409, 'An account with this email already exists. Please login instead.');
        }
        
        // If supplier exists but NOT verified → resend OTP instead of blocking
        // Generate new OTP
        const newOtpCode = generateOTP();
        const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Update supplier with new OTP
        await prisma.supplier.update({
          where: { id: existingUser.supplier.id },
          data: {
            otpCode: newOtpCode,
            otpExpires: newOtpExpires
          }
        });
        
        // Send OTP email (wrapped in try/catch)
        try {
          await sendOTPEmail(normalizedEmail, newOtpCode, true);
          logger.info(`OTP resent to ${normalizedEmail} for unverified supplier`);
        } catch (emailError) {
          logger.error(`Failed to resend OTP email to ${normalizedEmail}:`, emailError);
          // Don't throw - OTP is updated, user can request resend
        }
        
        // Return success with resend message
        return {
          supplier: existingUser.supplier,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role
          },
          message: 'Account already exists but not verified. OTP resent to your email.'
        };
      }
      
      // If user exists but NO supplier profile → allow registration (create supplier)
      // This handles edge case where user was created but supplier wasn't
      logger.info(`User exists but no supplier profile. Creating supplier for: ${normalizedEmail}`);
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    // STEP 2: Generate unique slug from company name
    const slug = await generateUniqueSlug(companyName);

    // Create or update user with VENDOR role
    // If existingUser exists but no supplier, use that user instead of creating new one
    let user;
    if (existingUser && !existingUser.supplier) {
      // Update existing user's password and role if needed
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword, // Update password
          role: 'VENDOR' // Ensure role is VENDOR
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });
    } else {
      // Create new user (email is already normalized - lowercase, trimmed)
      user = await prisma.user.create({
        data: {
          email: normalizedEmail, // Already normalized
          password: hashedPassword,
          role: 'VENDOR'
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });
    }

    // Create supplier with OTP (not verified yet)
    const supplier = await prisma.supplier.create({
      data: {
        userId: user.id,
        companyName,
        slug,
        country,
        city: city || null,
        address: address || null,
        phone: phone || contactPhone || null,
        website: website || null,
        description: description || null,
        therapeutics: therapeutics || null,
        manufacturer: manufacturer || null,
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        otpCode,
        otpExpires,
        isVerified: false, // Will be set to true after OTP verification
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Send OTP email (wrapped in try/catch to prevent server crash)
    try {
      await sendOTPEmail(normalizedEmail, otpCode, true); // true = registration
      logger.info(`OTP sent to ${normalizedEmail} for supplier registration`);
    } catch (emailError) {
      // Log error but don't crash - supplier is already created
      logger.error(`Failed to send OTP email to ${normalizedEmail}:`, emailError);
      // Don't throw - registration can still succeed, user can request resend
    }

    logger.info(`Supplier registration initiated: ${normalizedEmail} - Company: ${companyName}`);

    return {
      supplier,
      user,
      message: 'Registration successful. OTP sent to your email for verification.'
    };
  } catch (error) {
    logger.error('Create supplier with OTP service error:', error);
    
    // STEP 5: Handle Prisma duplicate key error (code P2002)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'email';
      if (field === 'email') {
        throw new ApiError(409, 'An account with this email already exists. Please login instead.');
      }
      throw new ApiError(409, `${field} already exists`);
    }
    
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For other errors, re-throw as-is
    throw error;
  }
};

// Verify OTP and activate supplier
export const verifySupplierOTPService = async (email, otpCode) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null
      },
      include: {
        supplier: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found with this email');
    }

    if (!user.supplier) {
      throw new ApiError(404, 'Supplier profile not found');
    }

    const supplier = user.supplier;

    // Check if OTP matches
    if (!supplier.otpCode || supplier.otpCode !== otpCode) {
      throw new ApiError(400, 'Invalid OTP code. Please check and try again.');
    }

    // Check if OTP is expired
    if (!supplier.otpExpires || supplier.otpExpires < new Date()) {
      throw new ApiError(400, 'OTP has expired. Please request a new OTP.');
    }

    // Verify supplier and clear OTP
    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpires: null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Generate tokens for immediate login
    const { generateTokens } = await import('../auth/auth.service.js');
    const { accessToken, refreshToken } = await generateTokens(user.id);

    logger.info(`Supplier verified: ${normalizedEmail} - Company: ${supplier.companyName}`);

    return {
      supplier: updatedSupplier,
      user,
      accessToken,
      refreshToken,
      message: 'Account verified successfully. You can now login.'
    };
  } catch (error) {
    logger.error('Verify supplier OTP service error:', error);
    throw error;
  }
};

// Resend OTP
export const resendSupplierOTPService = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and supplier
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null
      },
      include: {
        supplier: true
      }
    });

    if (!user || !user.supplier) {
      throw new ApiError(404, 'Registration not found. Please register first.');
    }

    const supplier = user.supplier;

    // Check if already verified
    if (supplier.isVerified) {
      throw new ApiError(400, 'Account is already verified. Please login instead.');
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update supplier with new OTP
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        otpCode,
        otpExpires
      }
    });

    // Send OTP email (wrapped in try/catch)
    try {
      await sendOTPEmail(normalizedEmail, otpCode, true);
      logger.info(`OTP resent to ${normalizedEmail}`);
    } catch (emailError) {
      logger.error(`Failed to resend OTP email to ${normalizedEmail}:`, emailError);
      throw new ApiError(500, 'Failed to send OTP email. Please try again later.');
    }

    return {
      message: 'OTP resent successfully. Please check your email.',
      expiresAt: otpExpires.toISOString()
    };
  } catch (error) {
    logger.error('Resend supplier OTP service error:', error);
    throw error;
  }
};
