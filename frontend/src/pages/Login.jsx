import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { sendOtp, verifyOtpLogin, googleLogin } from '../APIs/Auth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const Login = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const googleButtonRef = useRef(null)
  const { user, login, loading: authLoading } = useAuth()
  const { showNotification } = useNotification()

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError('Google client id is missing.')
      return
    }

    const init = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false,
          })
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              size: 'large',
              text: 'continue_with',
              width: 320,
            })
            setGoogleReady(true)
            setGoogleError('')
          }
        } catch (e) {
          console.warn('Google Sign-In init:', e)
          setGoogleError('Google sign-in could not load.')
        }
        return true
      }
      return false
    }
    if (init()) return
    let timeout
    const id = setInterval(() => {
      if (init()) {
        clearInterval(id)
        clearTimeout(timeout)
      }
    }, 100)
    timeout = setTimeout(() => {
      setGoogleError('Google sign-in is still loading or blocked by the browser.')
    }, 7000)

    return () => {
      clearInterval(id)
      clearTimeout(timeout)
    }
  }, [])

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return
    setLoading(true)
    try {
      const userData = await googleLogin(response.credential)
      login(userData)
      showNotification('Login successful.', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed. Please try again.'
      showNotification(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSendingOtp(true)
    try {
      await sendOtp(email.trim())
      setStep('otp')
      setOtp('')
      showNotification('OTP sent to your email.', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.'
      showNotification(msg, 'error')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!email.trim() || !otp.trim()) return
    setLoading(true)
    try {
      const res = await verifyOtpLogin(email.trim(), otp.trim())
      login(res.data)
      showNotification('Login successful.', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.'
      showNotification(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const backToEmail = () => {
    setStep('email')
    setOtp('')
  }

  if (authLoading) {
    return <div>Checking auth...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blue Ledger</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Login</h2>
        </div>

        {step === 'email' ? (
          <>
            {/* Google login - always visible */}
            <div className="flex flex-col items-center w-full mb-6">
              {GOOGLE_CLIENT_ID ? (
                <>
                  <div ref={googleButtonRef} className="min-h-[44px] w-full flex justify-center [&>div]:!mx-auto" />
                  {!googleReady && (
                    <button
                      type="button"
                      onClick={() => showNotification(googleError || 'Google sign-in is loading. Please wait a moment.', 'warning')}
                      className="w-full max-w-[320px] h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => showNotification('Add VITE_GOOGLE_CLIENT_ID to your .env file to enable Google login.', 'warning')}
                  className="w-full max-w-[320px] h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendingOtp ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-center tracking-widest text-lg"
                placeholder="Enter OTP"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={backToEmail}
                className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
