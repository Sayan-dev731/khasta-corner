import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../context/useAuth'
import { changePassword, updateAccountDetails, updateProfileImage, deleteAccount } from '../api/userApi'
import toast from 'react-hot-toast'
import './Profile.css'

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const pageRef = useRef(null)

  // Edit profile form
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' })
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Password form
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPw, setChangingPw] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  // Profile image
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (user) {
      setEditForm({ fullName: user.fullName, email: user.email, phone: user.phone })
    }
  }, [user])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profile-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.profile-section',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'power3.out', delay: 0.4 }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateAccountDetails(editForm)
      await refreshUser()
      toast.success('Profile updated!')
      setEditMode(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPw(true)
    try {
      await changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowPwForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally {
      setChangingPw(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('profileImage', file)
      await updateProfileImage(fd)
      await refreshUser()
      toast.success('Profile image updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      await deleteAccount()
      await logout()
      toast.success('Account deleted')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  if (!user) return null

  return (
    <div ref={pageRef} className="profile-page">
      <div className="profile-container container">
        <div className="profile-header-section">
          <span className="text-label text-accent">My Account</span>
          <h2 className="profile-title">Profile</h2>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img src={user.profileImage} alt={user.fullName} />
              <label className="avatar-upload-overlay" htmlFor="avatarUpload">
                {uploadingImage ? (
                  <span className="btn-loader btn-loader-sm" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
                <input type="file" id="avatarUpload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="profile-avatar-info">
              <h3>{user.fullName}</h3>
              <span className={`role-badge ${user.role === 'Admin' ? 'role-admin' : 'role-user'}`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Profile Details / Edit Form */}
          <div className="profile-section">
            <div className="section-header">
              <h4>Account Details</h4>
              {!editMode && (
                <button className="btn-text" onClick={() => setEditMode(true)}>Edit</button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="editFullName">Full Name</label>
                  <input type="text" id="editFullName" name="fullName" value={editForm.fullName} onChange={handleEditChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editEmail">Email</label>
                    <input type="email" id="editEmail" name="email" value={editForm.email} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPhone">Phone</label>
                    <input type="tel" id="editPhone" name="phone" value={editForm.phone} onChange={handleEditChange} required />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <span className="btn-loader" /> : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditMode(false); setEditForm({ fullName: user.fullName, email: user.email, phone: user.phone }) }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{user.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified</span>
                  <span className="detail-value">{user.isVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <div className="section-header">
              <h4>Security</h4>
              {!showPwForm && (
                <button className="btn-text" onClick={() => setShowPwForm(true)}>Change Password</button>
              )}
            </div>

            {showPwForm && (
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="oldPassword">Current Password</label>
                  <input type="password" id="oldPassword" name="oldPassword" value={pwForm.oldPassword} onChange={handlePwChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input type="password" id="newPassword" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} required minLength={6} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={changingPw}>
                    {changingPw ? <span className="btn-loader" /> : 'Update Password'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowPwForm(false); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }) }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="profile-section profile-danger-zone">
            <div className="section-header">
              <h4>Danger Zone</h4>
            </div>
            <div className="danger-actions">
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log Out
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
