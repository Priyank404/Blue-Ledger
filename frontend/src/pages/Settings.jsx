import { useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"

const Settings = () => {
  // Account state
  const [email, setEmail] = useState("user@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  // Preferences state (handled separately)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  const handleSaveChanges = () => {
    // 1️⃣ Require current password for any account change
    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    // 2️⃣ New password validation
    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirm password do not match")
      return
    }

    // 3️⃣ At least one field must be updated
    if (!email && !newPassword) {
      setError("Please update email or password")
      return
    }

    setError("")

    // 4️⃣ Account payload (ONLY what backend needs)
    const accountPayload = {
      currentPassword,
    }

    if (email) accountPayload.email = email
    if (newPassword) accountPayload.newPassword = newPassword

    console.log("Account Payload:", accountPayload)

    // 5️⃣ Preferences payload (separate API later)
    const preferencesPayload = {
      emailNotifications,
      smsNotifications,
    }

    console.log("Preferences Payload:", preferencesPayload)

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

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Preferences (separate concern) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Preferences
          </h2>

          <div className="space-y-4">
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

        <button
          onClick={handleSaveChanges}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  )
}

export default Settings
