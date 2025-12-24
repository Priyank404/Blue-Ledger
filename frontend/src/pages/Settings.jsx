import { useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"

const Settings = () => {
  // Account state
  const [email, setEmail] = useState("user@example.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  // Save handler (React function)
  const handleSaveChanges = () => {
    // Password validation
    if (password && password !== confirmPassword) {
      setError("Password and Confirm Password do not match")
      return
    }

    setError("")

    // Final payload (send to backend later)
    const updatedSettings = {
      email,
      password: password || null,
      preferences: {
        emailNotifications,
        smsNotifications
      }
    }

    console.log("Updated Settings:", updatedSettings)
    alert("Settings saved successfully")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Settings
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Preferences
          </h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-600">
                  Receive email updates about your portfolio
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 text-primary-600"
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  SMS Notifications
                </p>
                <p className="text-sm text-gray-600">
                  Receive SMS alerts for important updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="h-5 w-5 text-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
