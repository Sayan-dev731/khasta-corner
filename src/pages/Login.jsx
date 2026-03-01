import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../context/useAuth'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', phone: '', password: '' })
  const [loginMethod, setLoginMethod] = useState('email') // 'email' or 'phone'
  const [submitting, setSubmitting] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const pageRef = useRef(null)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo('.auth-hero-text span',
        { y: 50, opacity: 0, rotateX: -15 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.12, duration: 0.7 }
      )
      .fromTo('.auth-card',
        { y: 50, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        '-=0.3'
      )
      .fromTo('.auth-card-header, .auth-method-toggle, .auth-form .form-group, .auth-submit-btn, .auth-footer',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.5 },
        '-=0.4'
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const credentials = { password: form.password }
      if (loginMethod === 'email') {
        credentials.email = form.email
      } else {
        credentials.phone = form.phone
      }
      await login(credentials)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={pageRef} className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="auth-container">
        <div className="auth-hero-text">
          <span>Welcome</span>
          <span>Back</span>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h3>Sign In</h3>
            <p>Enter your credentials to continue</p>
          </div>

          <div className="auth-method-toggle">
            <button
              className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
              type="button"
            >
              Email
            </button>
            <button
              className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => setLoginMethod('phone')}
              type="button"
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {loginMethod === 'email' ? (
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9103777757"
                  required
                  autoComplete="tel"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <span className="btn-loader" />
              ) : (
                <>
                  Sign In
                  <svg className="btn-arrow" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don&apos;t have an account? <Link to="/register" className="auth-link">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
