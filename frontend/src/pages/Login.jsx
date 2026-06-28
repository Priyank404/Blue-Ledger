import { useState, useEffect, useRef, useCallback } from 'react'
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

  const handleGoogleCredential = useCallback(async (response) => {
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
  }, [login, showNotification])

  useEffect(() => {
    if (authLoading || user) return
    if (!GOOGLE_CLIENT_ID) {
      setGoogleReady(false)
      setGoogleError('Google client id is missing.')
      return
    }

    let buttonContainer = null
    const init = () => {
      if (!googleButtonRef.current || !window.google?.accounts?.id) return false

      try {
        buttonContainer = googleButtonRef.current
        buttonContainer.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
        })
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          size: 'large',
          text: 'continue_with',
          width: 360,
        })
        setGoogleReady(true)
        setGoogleError('')
      } catch (error) {
        console.warn('Google Sign-In init:', error)
        setGoogleReady(false)
        setGoogleError('Google sign-in could not load.')
      }

      return true
    }

    if (init()) {
      return () => {
        if (buttonContainer) buttonContainer.innerHTML = ''
      }
    }

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
      if (buttonContainer) buttonContainer.innerHTML = ''
    }
  }, [authLoading, user, handleGoogleCredential])

  const handleSendOtp = async (event) => {
    event.preventDefault()
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

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
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

  if (authLoading) return <div className="terminal-shell flex min-h-screen items-center justify-center muted">Checking session...</div>
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="terminal-shell grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-[520px] overflow-hidden rounded border" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <section className="p-6 md:p-8">
            <div className="mb-8">
              <p className="eyebrow">BLUE-LEDGER</p>
              <h2 className="screen-title">Sign in</h2>
              <p className="screen-copy">Use Google or email OTP to open your workstation.</p>
            </div>

            {step === 'email' ? (
              <>
                <div className="mb-6">
                  {GOOGLE_CLIENT_ID ? (
                    <>
                      <div ref={googleButtonRef} className="min-h-11 w-full [&>div]:!mx-auto" />
                      {!googleReady && (
                        <button type="button" onClick={() => showNotification(googleError || 'Google sign-in is loading. Please wait a moment.', 'warning')} className="btn-ghost h-11 w-full">
                          Sign in with Google
                        </button>
                      )}
                    </>
                  ) : (
                    <button type="button" onClick={() => showNotification('Add VITE_GOOGLE_CLIENT_ID to your .env file to enable Google login.', 'warning')} className="btn-ghost h-11 w-full">
                      Sign in with Google
                    </button>
                  )}
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
                  <span className="eyebrow">Email OTP</span>
                  <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field h-11" placeholder="Enter your email" required autoComplete="email" />
                  </div>
                  <button type="submit" disabled={sendingOtp} className="btn-primary h-11 w-full">
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="label">Enter OTP</label>
                  <input id="otp" type="text" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="field h-11 text-center text-lg tracking-widest" placeholder="Enter OTP" maxLength={6} required autoComplete="one-time-code" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setStep('email'); setOtp('') }} className="btn-ghost h-11">Back</button>
                  <button type="submit" disabled={loading || otp.length < 6} className="btn-primary h-11">{loading ? 'Verifying...' : 'Verify'}</button>
                </div>
              </form>
            )}
          </section>
      </div>
    </div>
  )
}

export default Login
