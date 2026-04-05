import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

async function getSupplierForVendorUser(userId) {
  return prisma.supplier.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true, companyName: true },
  });
}

export async function listThreadsService(userId, role) {
  if (role === 'BUYER' || role === 'ADMIN') {
    return prisma.messageThread.findMany({
      where: { buyerId: userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        supplier: { select: { id: true, companyName: true, slug: true } },
        rfq: { select: { id: true, title: true, rfqNumber: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, email: true, fullName: true } } },
        },
      },
    });
  }

  if (role === 'VENDOR') {
    const supplier = await getSupplierForVendorUser(userId);
    if (!supplier) return [];
    return prisma.messageThread.findMany({
      where: { supplierId: supplier.id },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        buyer: { select: { id: true, email: true, fullName: true, companyName: true } },
        rfq: { select: { id: true, title: true, rfqNumber: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, email: true, fullName: true } } },
        },
      },
    });
  }

  return [];
}

export async function getOrCreateThreadService(userId, role, { supplierId, buyerId, rfqId }) {
  if (role === 'BUYER' || role === 'ADMIN') {
    if (!supplierId) throw new ApiError(400, 'supplierId is required');
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, deletedAt: null },
    });
    if (!supplier) throw new ApiError(404, 'Supplier not found');

    const existing = await prisma.messageThread.findUnique({
      where: {
        buyerId_supplierId: { buyerId: userId, supplierId },
      },
    });
    if (existing) {
      if (rfqId && !existing.rfqId) {
        return prisma.messageThread.update({
          where: { id: existing.id },
          data: { rfqId },
          include: {
            supplier: { select: { id: true, companyName: true, slug: true } },
            buyer: { select: { id: true, email: true, fullName: true } },
          },
        });
      }
      return prisma.messageThread.findUnique({
        where: { id: existing.id },
        include: {
          supplier: { select: { id: true, companyName: true, slug: true } },
          buyer: { select: { id: true, email: true, fullName: true } },
        },
      });
    }

    return prisma.messageThread.create({
      data: {
        buyerId: userId,
        supplierId,
        rfqId: rfqId || null,
        subject: null,
      },
      include: {
        supplier: { select: { id: true, companyName: true, slug: true } },
        buyer: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  if (role === 'VENDOR') {
    if (!buyerId) throw new ApiError(400, 'buyerId is required');
    const supplier = await getSupplierForVendorUser(userId);
    if (!supplier) throw new ApiError(403, 'Supplier profile not found');

    const existing = await prisma.messageThread.findUnique({
      where: {
        buyerId_supplierId: { buyerId, supplierId: supplier.id },
      },
    });
    if (existing) {
      return prisma.messageThread.findUnique({
        where: { id: existing.id },
        include: {
          supplier: { select: { id: true, companyName: true, slug: true } },
          buyer: { select: { id: true, email: true, fullName: true, companyName: true } },
        },
      });
    }

    return prisma.messageThread.create({
      data: {
        buyerId,
        supplierId: supplier.id,
        rfqId: rfqId || null,
      },
      include: {
        supplier: { select: { id: true, companyName: true, slug: true } },
        buyer: { select: { id: true, email: true, fullName: true, companyName: true } },
      },
    });
  }

  throw new ApiError(403, 'Invalid role');
}

export async function listMessagesService(userId, role, threadId) {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { supplier: { select: { userId: true } } },
  });
  if (!thread) throw new ApiError(404, 'Thread not found');

  const allowed =
    thread.buyerId === userId ||
    (role === 'VENDOR' && thread.supplier?.userId === userId);
  if (!allowed) throw new ApiError(403, 'Access denied');

  return prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, email: true, fullName: true, role: true } },
    },
  });
}

export async function sendMessageService(userId, role, threadId, body) {
  const text = typeof body === 'string' ? body : body?.body;
  if (!text || !String(text).trim()) throw new ApiError(400, 'Message body is required');

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { supplier: { select: { userId: true, id: true } } },
  });
  if (!thread) throw new ApiError(404, 'Thread not found');

  let allowed = thread.buyerId === userId;
  if (role === 'VENDOR' && thread.supplier?.userId === userId) allowed = true;
  if (!allowed) throw new ApiError(403, 'Access denied');

  const msg = await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        body: String(text).trim(),
      },
      include: {
        sender: { select: { id: true, email: true, fullName: true, role: true } },
      },
    }),
    prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return msg[0];
}
