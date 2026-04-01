import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Mail, Moon, Sun, Trash2, Save } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    rfqUpdates: true,
    orderUpdates: true,
    paymentAlerts: true,
  })

  const handleSave = () => {
    // TODO: Save settings to backend
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Email Alerts</p>
              <p className="text-sm text-slate-600">Receive email notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">RFQ Updates</p>
              <p className="text-sm text-slate-600">Get notified about RFQ responses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rfqUpdates}
                onChange={(e) => setNotifications({ ...notifications, rfqUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Order Updates</p>
              <p className="text-sm text-slate-600">Track order status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.orderUpdates}
                onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Payment Alerts</p>
              <p className="text-sm text-slate-600">Payment status notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.paymentAlerts}
                onChange={(e) => setNotifications({ ...notifications, paymentAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Dark Mode</p>
            <p className="text-sm text-slate-600">Toggle dark/light theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600" />
            ) : (
              <Sun className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
