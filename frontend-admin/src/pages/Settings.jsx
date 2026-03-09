import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Server,
  Shield,
  Bell,
  FileText,
  Key,
  Mail,
  Lock,
  Globe,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Activity,
  Database,
  Loader2,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/ToastProvider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { getSystemSettings, updateSystemSettings } from '@/services/system-settings.service'

const tabSections = [
  {
    id: 'system',
    label: 'System',
    icon: Server,
    description: 'System identity and core configuration',
  },
  {
    id: 'rfq',
    label: 'RFQ',
    icon: FileText,
    description: 'RFQ workflow and automation settings',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Authentication and access control',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Alert rules and communication settings',
  },
]

export default function Settings() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('system')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({})
  const [overview, setOverview] = useState({
    environment: 'Production',
    apiVersion: 'v2.4.1',
    lastUpdated: new Date().toISOString(),
    activeSessions: 0,
    systemStatus: 'operational',
    lastModifiedBy: null,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSystemSettings()
      setSettings(data.settings || {})
      setOverview(data.overview || overview)
    } catch (err) {
      setError(err.message || 'Failed to load system settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSuccess(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      const data = await updateSystemSettings(settings)
      setSettings(data.settings || {})
      setOverview(data.overview || overview)
      setHasChanges(false)
      setSuccess(true)
      toast.success('Settings saved successfully')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save system settings')
      toast.error(err.message || 'Failed to save system settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadSettings()
    setHasChanges(false)
    setSuccess(false)
  }

  const getSetting = (key, defaultValue) => {
    return settings[key] !== undefined ? settings[key] : defaultValue
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Loading system settings...</div>
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <Section>
          <SectionTitle>System Configuration</SectionTitle>
          <SectionSubtitle>Manage system settings and operational parameters</SectionSubtitle>
        </Section>

        {/* System Overview Panel */}
        <Panel>
          <PanelHeader>
            <PanelTitle>System Overview</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Environment</div>
                <div className="flex items-center gap-2">
                  <Badge variant={overview.environment === 'Production' ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0">
                    {overview.environment}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">API Version</div>
                <div className="text-sm font-semibold">{overview.apiVersion}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Last Updated</div>
                <div className="text-sm font-semibold">{getDaysAgo(overview.lastUpdated)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Active Sessions</div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-sm font-semibold">{overview.activeSessions}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">System Status</div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400 capitalize">{overview.systemStatus}</span>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>

        {/* Configuration Tabs */}
        <Panel>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <PanelHeader className="border-b border-slate-800">
              <TabsList className="bg-transparent h-auto p-0 gap-0">
                {tabSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {section.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </PanelHeader>

            {/* System Tab */}
            <TabsContent value="system" className="mt-0">
              <PanelContent className="space-y-4">
                {/* System Identity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">System Identity</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName" className="text-xs">System Name</Label>
                      <Input
                        id="systemName"
                        value={getSetting('system.name', 'Pharmetis Command Center')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="systemUrl" className="text-xs">System URL</Label>
                      <Input
                        id="systemUrl"
                        value={getSetting('system.url', 'https://admin.pharmetis.com')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-xs">Timezone</Label>
                      <Input
                        id="timezone"
                        value={getSetting('system.timezone', 'UTC')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.timezone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locale" className="text-xs">Locale</Label>
                      <Input
                        id="locale"
                        value={getSetting('system.locale', 'en-US')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.locale', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Database Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Database</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbHost" className="text-xs">Database Host</Label>
                      <Input
                        id="dbHost"
                        value={getSetting('system.dbHost', 'postgresql://host:5432')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.dbHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbName" className="text-xs">Database Name</Label>
                      <Input
                        id="dbName"
                        value={getSetting('system.dbName', 'pharmetis')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('system.dbName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </PanelContent>
            </TabsContent>

            {/* RFQ Tab */}
            <TabsContent value="rfq" className="mt-0">
              <PanelContent className="space-y-4">
                {/* RFQ Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">RFQ Configuration</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultExpiry" className="text-xs">Default Expiry Days</Label>
                      <Input
                        id="defaultExpiry"
                        type="number"
                        value={getSetting('rfq.defaultExpiry', 30)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.defaultExpiry', parseInt(e.target.value) || 30)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="autoAssignSuppliers" className="text-xs">Auto-Assign Suppliers</Label>
                      <Input
                        id="autoAssignSuppliers"
                        type="number"
                        value={getSetting('rfq.autoAssignSuppliers', 5)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.autoAssignSuppliers', parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minQuoteTime" className="text-xs">Min Quote Response Time (hours)</Label>
                      <Input
                        id="minQuoteTime"
                        type="number"
                        value={getSetting('rfq.minQuoteTime', 24)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.minQuoteTime', parseInt(e.target.value) || 24)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxQuoteTime" className="text-xs">Max Quote Response Time (hours)</Label>
                      <Input
                        id="maxQuoteTime"
                        type="number"
                        value={getSetting('rfq.maxQuoteTime', 72)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.maxQuoteTime', parseInt(e.target.value) || 72)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Workflow Settings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Workflow</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultStatus" className="text-xs">Default RFQ Status</Label>
                      <Input
                        id="defaultStatus"
                        value={getSetting('rfq.defaultStatus', 'SENT')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.defaultStatus', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="autoCloseDays" className="text-xs">Auto-Close After (days)</Label>
                      <Input
                        id="autoCloseDays"
                        type="number"
                        value={getSetting('rfq.autoCloseDays', 90)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('rfq.autoCloseDays', parseInt(e.target.value) || 90)}
                      />
                    </div>
                  </div>
                </div>
              </PanelContent>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <PanelContent className="space-y-4">
                {/* Authentication */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Authentication</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-xs">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={getSetting('security.sessionTimeout', 60)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.sessionTimeout', parseInt(e.target.value) || 60)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts" className="text-xs">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={getSetting('security.maxLoginAttempts', 5)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.maxLoginAttempts', parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength" className="text-xs">Password Min Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={getSetting('security.passwordMinLength', 8)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.passwordMinLength', parseInt(e.target.value) || 8)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry" className="text-xs">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={getSetting('security.passwordExpiry', 90)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.passwordExpiry', parseInt(e.target.value) || 90)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Access Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Access Control</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit" className="text-xs">API Rate Limit (req/min)</Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={getSetting('security.apiRateLimit', 100)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.apiRateLimit', parseInt(e.target.value) || 100)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist" className="text-xs">IP Whitelist (comma-separated)</Label>
                      <Input
                        id="ipWhitelist"
                        value={getSetting('security.ipWhitelist', '')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('security.ipWhitelist', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </PanelContent>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <PanelContent className="space-y-4">
                {/* Notification Rules */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notification Rules</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rfqExpiryAlert" className="text-xs">RFQ Expiry Alert (days before)</Label>
                      <Input
                        id="rfqExpiryAlert"
                        type="number"
                        value={getSetting('notifications.rfqExpiryAlert', 7)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.rfqExpiryAlert', parseInt(e.target.value) || 7)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quoteReceivedAlert" className="text-xs">Quote Received Alert</Label>
                      <Input
                        id="quoteReceivedAlert"
                        value={getSetting('notifications.quoteReceivedAlert', 'enabled')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.quoteReceivedAlert', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierInactiveAlert" className="text-xs">Supplier Inactive Alert (days)</Label>
                      <Input
                        id="supplierInactiveAlert"
                        type="number"
                        value={getSetting('notifications.supplierInactiveAlert', 30)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.supplierInactiveAlert', parseInt(e.target.value) || 30)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="systemMaintenanceAlert" className="text-xs">System Maintenance Alert</Label>
                      <Input
                        id="systemMaintenanceAlert"
                        value={getSetting('notifications.systemMaintenanceAlert', 'enabled')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.systemMaintenanceAlert', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Email Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost" className="text-xs">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={getSetting('notifications.smtpHost', 'smtp.pharmetis.com')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort" className="text-xs">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={getSetting('notifications.smtpPort', 587)}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.smtpPort', parseInt(e.target.value) || 587)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail" className="text-xs">From Email</Label>
                      <Input
                        id="fromEmail"
                        value={getSetting('notifications.fromEmail', 'noreply@pharmetis.com')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.fromEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName" className="text-xs">From Name</Label>
                      <Input
                        id="fromName"
                        value={getSetting('notifications.fromName', 'Pharmetis System')}
                        className="h-9 bg-slate-800/50 border-slate-700"
                        onChange={(e) => handleInputChange('notifications.fromName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </PanelContent>
            </TabsContent>
          </Tabs>
        </Panel>

        {/* Audit Info */}
        <Panel className="bg-slate-800/30">
          <PanelContent className="py-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {overview.lastModifiedBy && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Last modified by:</span>
                    <span className="font-medium">{overview.lastModifiedBy}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Last modified:</span>
                  <span className="font-medium">{formatDate(overview.lastUpdated)}</span>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </div>

      {/* Sticky Bottom Save Bar */}
      {(hasChanges || success) && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-[280px] right-0 z-50 bg-slate-900/95 border-t-2 border-slate-800 shadow-2xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                {success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Settings saved successfully</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-xs bg-gradient-to-r from-indigo-500 to-cyan-500"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
