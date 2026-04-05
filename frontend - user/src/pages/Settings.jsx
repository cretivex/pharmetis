import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Edit2,
  Trash2,
  Plus,
  Check,
  LogOut,
  Key,
  Mail,
  Phone,
  Calendar,
  Globe,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { settingsService } from '../services/settings.service.js';

function Settings() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl && ['profile', 'company', 'addresses', 'security', 'notifications', 'billing'].includes(tabFromUrl) ? tabFromUrl : 'profile');

  useEffect(() => {
    if (tabFromUrl && ['profile', 'company', 'addresses', 'security', 'notifications', 'billing'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    email: '',
    fullName: '',
    phone: '',
    avatar: '',
    emailVerified: false,
    role: '',
    createdAt: ''
  });

  // Company state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    gstTaxId: '',
    drugLicenseNo: '',
    businessType: '',
    website: '',
    documents: []
  });

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    email: '',
    emailVerified: false,
    otpLoginEnabled: true,
    accountCreatedAt: '',
    activeSessions: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Notifications state
  const [settings, setSettings] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    notifications: {
      email: true,
      rfqResponses: true,
      orderUpdates: true,
      marketing: false
    }
  });

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile
      const profileData = await settingsService.getProfile();
      setProfile({
        email: profileData.email || '',
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || profileData.profile_image || '',
        profile_image: profileData.profile_image || profileData.avatar || '',
        emailVerified: profileData.emailVerified || false,
        role: profileData.role || '',
        createdAt: profileData.createdAt || ''
      });

      // Load company info
      const companyData = await settingsService.getCompanyInfo();
      setCompanyInfo({
        companyName: companyData.companyName || '',
        gstTaxId: companyData.gstTaxId || '',
        drugLicenseNo: companyData.drugLicenseNo || '',
        businessType: companyData.businessType || '',
        website: companyData.website || '',
        documents: companyData.documents || []
      });

      // Load addresses
      const addressesData = await settingsService.getAddresses();
      setAddresses(addressesData || []);

      // Load security settings
      const securityData = await settingsService.getSecuritySettings();
      setSecuritySettings(securityData || {
        email: profileData.email || '',
        emailVerified: profileData.emailVerified || false,
        otpLoginEnabled: true,
        accountCreatedAt: profileData.createdAt || '',
        activeSessions: []
      });

      // Load settings
      const settingsData = await settingsService.getSettings();
      setSettings({
        language: settingsData.language || 'en',
        currency: settingsData.currency || 'USD',
        timezone: settingsData.timezone || 'UTC',
        notifications: settingsData.notifications || {
          email: true,
          rfqResponses: true,
          orderUpdates: true,
          marketing: false
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  // Profile handlers
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // If avatar is a base64 data URL and it's very long, check size
      if (profile.avatar && profile.avatar.startsWith('data:image/')) {
        const base64Length = profile.avatar.length;
        // Base64 is about 33% larger than binary, so 10MB base64 ≈ 7.5MB image
        if (base64Length > 10 * 1024 * 1024) {
          setError('Image is too large. Please use a smaller image (max 5MB).');
          setSaving(false);
          return;
        }
      }
      
      const normalizeImageUrl = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return null;
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        return null;
      };

      // Send only fields accepted by backend validation.
      const normalizedAvatar = normalizeImageUrl(profile.profile_image || profile.avatar);
      const profilePayload = {
        email: (profile.email || '').trim() || undefined,
        fullName: (profile.fullName || '').trim() || null,
        phone: (profile.phone || '').trim() || null,
        avatar: normalizedAvatar,
        profile_image: normalizedAvatar
      };

      await settingsService.updateProfile(profilePayload);
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err.response?.status === 413) {
        setError('Image is too large. Please use a smaller image or compress it before uploading.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      try {
        const uploadedUrl = await settingsService.uploadFile('buyers', file);
        if (!uploadedUrl) throw new Error('Image upload failed');
        setProfile({ ...profile, avatar: uploadedUrl, profile_image: uploadedUrl });
        setError(null);
      } catch (uploadError) {
        setError(uploadError.response?.data?.message || uploadError.message || 'Failed to upload image');
      }
    }
  };

  // Company handlers – build payload that matches backend validation (website = URI, documents = { name, url }[])
  const handleSaveCompany = async () => {
    try {
      setSaving(true);
      setError(null);
      let website = (companyInfo.website || '').trim();
      if (website && !/^https?:\/\//i.test(website) && !/^blob:/i.test(website)) {
        website = `https://${website}`;
      }
      const documents = (companyInfo.documents || [])
        .filter((d) => d && typeof d.name === 'string' && typeof d.url === 'string' && d.url.length > 0)
        .map((d) => ({ name: d.name, url: d.url, ...(d.type ? { type: d.type } : {}) }));
      const payload = {
        companyName: companyInfo.companyName || null,
        gstTaxId: companyInfo.gstTaxId || null,
        drugLicenseNo: companyInfo.drugLicenseNo || null,
        businessType: companyInfo.businessType || null,
        website: website || null,
        documents: documents.length ? documents : undefined
      };
      await settingsService.updateCompanyInfo(payload);
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg || 'Failed to save company info');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const uploadedDocuments = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          url: await settingsService.uploadFile('documents', file),
          type: file.type
        }))
      );
      setCompanyInfo({
        ...companyInfo,
        documents: [...(companyInfo.documents || []), ...uploadedDocuments]
      });
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || 'Failed to upload documents');
    }
  };

  const removeDocument = (index) => {
    const newDocuments = companyInfo.documents.filter((_, i) => i !== index);
    setCompanyInfo({ ...companyInfo, documents: newDocuments });
  };

  // Address handlers
  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address.id);
      setAddressForm({
        label: address.label || '',
        fullName: address.fullName || '',
        companyName: address.companyName || '',
        phone: address.phone || '',
        email: address.email || '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        isDefault: address.isDefault || false
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: '',
        fullName: '',
        companyName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
      });
    }
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      setSaving(true);
      setError(null);
      if (editingAddress) {
        await settingsService.updateAddress(editingAddress, addressForm);
      } else {
        await settingsService.createAddress(addressForm);
      }
      await loadAllData();
      setAddressModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      setSaving(true);
      await settingsService.deleteAddress(id);
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      setSaving(true);
      await settingsService.setDefaultAddress(id);
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to set default address');
    } finally {
      setSaving(false);
    }
  };

  // Security handlers
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await settingsService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOTP = async () => {
    try {
      setSaving(true);
      const newValue = !securitySettings.otpLoginEnabled;
      await settingsService.updateOTPLoginPreference(newValue);
      setSecuritySettings({ ...securitySettings, otpLoginEnabled: newValue });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update OTP preference');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to logout from all devices?')) return;
    try {
      setSaving(true);
      await settingsService.logoutAllDevices();
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to logout all devices');
    } finally {
      setSaving(false);
    }
  };

  // Notifications handlers
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.updateSettings(settings);
      await loadAllData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-200"></div>
            <p className="mt-4 text-slate-600 text-sm">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-10 py-20">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-20">
          {/* Sidebar - minimal nav, no heavy panels */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-500 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-600' : 'opacity-60'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content - no wrapping card */}
          <main className="min-w-0">
                {/* Profile */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h2>
                    <p className="mt-1.5 text-sm text-slate-600">Update your personal information</p>
                    <div className="mt-6 mb-10 h-px bg-border" />

                    <div className="max-w-xl space-y-8">
                      {/* Avatar - clean, no heavy box */}
                      <div className="flex items-center gap-5">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-1 ring-primary/10" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center ring-1 ring-primary/10">
                            <User className="w-9 h-9 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-neutral-600 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Change photo
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          </label>
                          <p className="text-xs text-slate-600 mt-1.5">JPG, JPEG, PNG or WEBP. Max 5MB</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-slate-900">Full Name</label>
                        <input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          placeholder="John Doe"
                          className="h-11 max-w-md rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-900">Email</label>
                        <div className="relative max-w-md">
                          <input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="john@company.com"
                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          />
                          {profile.emailVerified && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
                              <Check className="w-4 h-4" /> Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-900">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="h-11 max-w-md rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {profile.role || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(profile.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-end pt-8">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex h-11 items-center gap-2 rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? (
                            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                          ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company */}
                {activeTab === 'company' && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Company</h2>
                    <p className="mt-1.5 text-sm text-slate-600">Your business details for orders and compliance</p>
                    <div className="mt-6 mb-10 h-px bg-border" />

                    <div className="max-w-xl space-y-8">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-slate-900">Company Name</label>
                        <input
                          id="companyName"
                          value={companyInfo.companyName}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                          placeholder="Your Company Name"
                          className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="gstTaxId" className="text-sm font-medium text-slate-900">GST / Tax ID</label>
                          <input
                            id="gstTaxId"
                            value={companyInfo.gstTaxId}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, gstTaxId: e.target.value })}
                            placeholder="GST123456789"
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="drugLicenseNo" className="text-sm font-medium text-slate-900">Drug License Number</label>
                          <input
                            id="drugLicenseNo"
                            value={companyInfo.drugLicenseNo}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, drugLicenseNo: e.target.value })}
                            placeholder="DL-12345"
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="businessType" className="text-sm font-medium text-slate-900">Business Type</label>
                          <select
                            id="businessType"
                            value={companyInfo.businessType}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, businessType: e.target.value })}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          >
                            <option value="">Select Type</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Retailer">Retailer</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="website" className="text-sm font-medium text-slate-900">Website</label>
                          <input
                            id="website"
                            type="url"
                            value={companyInfo.website}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                            placeholder="https://example.com"
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-900">Company Documents</span>
                        <label className="flex flex-col items-center justify-center w-full border border-dashed border-slate-200 rounded-xl p-6 text-sm text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                          <FileText className="w-5 h-5 mb-2 text-slate-600" />
                          <span>Upload Documents</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleDocumentUpload}
                          />
                        </label>
                        {companyInfo.documents && companyInfo.documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {companyInfo.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-100/30 rounded-lg text-sm">
                                <div className="flex items-center gap-2 text-slate-900">
                                  <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                                  <span>{doc.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                  aria-label="Remove document"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-12 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveCompany}
                          disabled={saving}
                          className="h-11 px-6 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Company Info
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Addresses */}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Addresses</h2>
                        <p className="mt-1.5 text-sm text-slate-600">Shipping and billing addresses</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddressModal()}
                        className="h-11 px-4 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 flex items-center gap-2 shrink-0"
                      >
                        <Plus className="w-4 h-4 opacity-70" />
                        Add Address
                      </button>
                    </div>
                    <div className="mt-6 mb-12 h-px bg-border" />
                    <div className="space-y-6">
                      {addresses.length === 0 ? (
                        <div className="py-16 text-center">
                          <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-70" />
                          <p className="text-sm text-slate-600">No addresses yet</p>
                          <button
                            type="button"
                            onClick={() => openAddressModal()}
                            className="mt-4 h-11 px-4 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add your first address
                          </button>
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} className="py-5 px-0 border-b border-blue-200 last:border-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {address.label && (
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                      {address.label}
                                    </span>
                                  )}
                                  {address.isDefault && (
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-slate-900">{address.fullName}</p>
                                {address.companyName && (
                                  <p className="text-sm text-slate-600">{address.companyName}</p>
                                )}
                                <p className="text-sm text-slate-600 mt-1">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                <p className="text-sm text-slate-600">{address.country}</p>
                                {address.phone && (
                                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {address.phone}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {!address.isDefault && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultAddress(address.id)}
                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                    title="Set as default"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openAddressModal(address)}
                                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Security</h2>
                    <p className="mt-1.5 text-sm text-slate-600">Password and session management</p>
                    <div className="mt-6 mb-10 h-px bg-border" />

                    <div className="space-y-10">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <label htmlFor="currentPassword" className="text-sm font-medium text-slate-900">Current Password</label>
                            <input
                              id="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              placeholder="••••••••"
                              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label htmlFor="newPassword" className="text-sm font-medium text-slate-900">New Password</label>
                            <input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              placeholder="••••••••"
                              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">Confirm New Password</label>
                            <input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={saving}
                              className="h-11 px-6 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                            >
                              <Key className="w-4 h-4" />
                              {saving ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-blue-200">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-slate-900">OTP Login</h3>
                            <p className="text-sm text-slate-600 mt-0.5">One-time password for sign-in</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={securitySettings.otpLoginEnabled} onChange={handleToggleOTP} />
                            <div className="w-11 h-6 bg-slate-100 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-slate-900">Active Sessions</h3>
                          <button
                            type="button"
                            onClick={handleLogoutAll}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4 opacity-70" />
                            Logout All
                          </button>
                        </div>
                        {securitySettings.activeSessions && securitySettings.activeSessions.length > 0 ? (
                          <div className="space-y-3">
                            {securitySettings.activeSessions.map((session) => (
                              <div key={session.id} className="flex items-center justify-between py-4 border-b border-blue-200 last:border-0">
                                <div>
                                  <p className="font-medium text-slate-900 text-sm">{session.device}</p>
                                  <p className="text-sm text-slate-600">{session.location}</p>
                                  <p className="text-xs text-slate-600 mt-0.5">Last active: {formatDate(session.createdAt)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => settingsService.revokeSession(session.id).then(() => loadAllData())}
                                  className="p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <LogOut className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600 py-4">No active sessions</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Notifications</h2>
                    <p className="mt-1.5 text-sm text-slate-600">Choose what you get notified about</p>
                    <div className="mt-6 mb-10 h-px bg-border" />

                    <div className="space-y-10">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-4">Email</h3>
                        <div className="space-y-1">
                          {[
                            { key: 'email', label: 'Account updates', desc: 'Important changes to your account' },
                            { key: 'rfqResponses', label: 'RFQ responses', desc: 'When suppliers respond to your RFQs' },
                            { key: 'orderUpdates', label: 'Order updates', desc: 'Order status and shipping' },
                            { key: 'marketing', label: 'Marketing', desc: 'New features and promotions' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-4 border-b border-blue-200 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                                <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.notifications[item.key] || false} onChange={() => handleNotificationToggle(item.key)} />
                                <div className="w-11 h-6 bg-slate-100 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end pt-10">
                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          disabled={saving}
                          className="h-11 px-6 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing */}
                {activeTab === 'billing' && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Billing & Payment</h2>
                    <p className="mt-1.5 text-sm text-slate-600">Plan and payment methods</p>
                    <div className="mt-6 mb-10 h-px bg-border" />

                    <div className="space-y-10">
                      <div className="flex items-center justify-between py-5 border-b border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Current Plan</p>
                          <p className="text-sm text-slate-600 mt-0.5">Free Plan</p>
                        </div>
                        <button type="button" className="h-11 px-4 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 shrink-0">
                          Upgrade
                        </button>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-4">Payment Methods</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-4 border-b border-blue-200">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-slate-600 opacity-70" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                                <p className="text-xs text-slate-600 mt-0.5">Expires 12/25</p>
                              </div>
                            </div>
                            <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                        <button type="button" className="mt-4 h-11 px-4 rounded-lg text-sm font-medium bg-primary text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 inline-flex items-center gap-2">
                          <Plus className="w-4 h-4 opacity-90" />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </main>
          </div>
        </div>

      {/* Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Label (Optional)</Label>
            <Input
              id="label"
              value={addressForm.label}
              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
              className="mt-2"
              placeholder="Home, Office, Warehouse"
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={addressForm.fullName}
              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
              className="mt-2"
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              value={addressForm.companyName}
              onChange={(e) => setAddressForm({ ...addressForm, companyName: e.target.value })}
              className="mt-2"
              placeholder="Company Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="mt-2"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={addressForm.email}
                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                className="mt-2"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={addressForm.addressLine1}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              className="mt-2"
              placeholder="Street address"
            />
          </div>
          <div>
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={addressForm.addressLine2}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
              className="mt-2"
              placeholder="Apartment, suite, etc."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="mt-2"
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="mt-2"
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="mt-2"
                placeholder="12345"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              className="mt-2"
              placeholder="Country"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="isDefault" className="!mb-0">Set as default address</Label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveAddress} disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Address'}
            </Button>
            <Button onClick={() => setAddressModalOpen(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
