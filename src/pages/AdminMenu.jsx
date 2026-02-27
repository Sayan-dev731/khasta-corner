import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { addMenuItem, getMenuItem, editMenuItem, editMenuItemImage, deleteMenuItemApi } from '../api/menuApi'
import { useAuth } from '../context/useAuth'
import toast from 'react-hot-toast'
import './AdminMenu.css'

export default function AdminMenu() {
  const { isAdmin } = useAuth()
  const pageRef = useRef(null)

  // Add form
  const [addForm, setAddForm] = useState({
    name: '', description: '', price: '', category: '', isAvailable: 'true',
  })
  const [addImage, setAddImage] = useState(null)
  const [addPreview, setAddPreview] = useState(null)
  const [adding, setAdding] = useState(false)

  // Lookup / Edit
  const [lookupId, setLookupId] = useState('')
  const [menuItem, setMenuItem] = useState(null)
  const [fetching, setFetching] = useState(false)

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '', description: '', price: '', category: '', isAvailable: 'true',
  })
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit image
  const [newImage, setNewImage] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)
  const [updatingImage, setUpdatingImage] = useState(false)

  // Delete
  const [deleting, setDeleting] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState('add')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.admin-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  // ----- ADD MENU ITEM -----
  const handleAddChange = (e) => {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAddImage(file)
      setAddPreview(URL.createObjectURL(file))
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!addImage) {
      toast.error('Food image is required')
      return
    }
    setAdding(true)
    try {
      const fd = new FormData()
      fd.append('name', addForm.name)
      fd.append('description', addForm.description)
      fd.append('price', addForm.price)
      fd.append('category', addForm.category)
      fd.append('isAvailable', addForm.isAvailable)
      fd.append('imageFood', addImage)
      await addMenuItem(fd)
      toast.success('Menu item added!')
      setAddForm({ name: '', description: '', price: '', category: '', isAvailable: 'true' })
      setAddImage(null)
      setAddPreview(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  // ----- FETCH MENU ITEM -----
  const handleFetch = async (e) => {
    e.preventDefault()
    if (!lookupId.trim()) {
      toast.error('Enter a menu item ID')
      return
    }
    setFetching(true)
    setMenuItem(null)
    setEditMode(false)
    try {
      const res = await getMenuItem(lookupId.trim())
      setMenuItem(res.data)
      setEditForm({
        name: res.data.name,
        description: res.data.description,
        price: res.data.price,
        category: res.data.category,
        isAvailable: String(res.data.isAvailable),
      })
      toast.success('Menu item fetched!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Item not found')
    } finally {
      setFetching(false)
    }
  }

  // ----- EDIT MENU ITEM -----
  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await editMenuItem(menuItem._id, editForm)
      setMenuItem(res.data)
      toast.success('Menu item updated!')
      setEditMode(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  // ----- EDIT IMAGE -----
  const handleNewImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImage(file)
      setNewImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageUpdate = async () => {
    if (!newImage) {
      toast.error('Select a new image first')
      return
    }
    setUpdatingImage(true)
    try {
      const fd = new FormData()
      fd.append('imageFood', newImage)
      const res = await editMenuItemImage(menuItem._id, fd)
      setMenuItem(res.data)
      toast.success('Image updated!')
      setNewImage(null)
      setNewImagePreview(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image update failed')
    } finally {
      setUpdatingImage(false)
    }
  }

  // ----- DELETE -----
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${menuItem.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteMenuItemApi(menuItem._id)
      toast.success('Menu item deleted!')
      setMenuItem(null)
      setLookupId('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-no-access">
            <h3>Access Denied</h3>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="admin-page">
      <div className="admin-container container">
        <div className="admin-header">
          <span className="text-label text-accent">Admin Panel</span>
          <h2>Menu Management</h2>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Item
          </button>
          <button
            className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Item
          </button>
        </div>

        {/* ADD TAB */}
        {activeTab === 'add' && (
          <div className="admin-card">
            <h3>Add New Menu Item</h3>
            <form onSubmit={handleAddSubmit} className="admin-form">
              <div className="form-group form-group-image">
                <label>Food Image</label>
                <div className="image-upload-area" onClick={() => document.getElementById('addFoodImage').click()}>
                  {addPreview ? (
                    <img src={addPreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="image-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Click to upload</span>
                    </div>
                  )}
                  <input type="file" id="addFoodImage" accept="image/*" onChange={handleAddImage} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="addName">Name</label>
                  <input type="text" id="addName" name="name" value={addForm.name} onChange={handleAddChange} placeholder="Khasta Kachori" required />
                </div>
                <div className="form-group">
                  <label htmlFor="addCategory">Category</label>
                  <input type="text" id="addCategory" name="category" value={addForm.category} onChange={handleAddChange} placeholder="Khasta Special" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="addDescription">Description</label>
                <textarea id="addDescription" name="description" value={addForm.description} onChange={handleAddChange} placeholder="Crispy, flaky pastry stuffed with spiced lentils" required rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="addPrice">Price (₹)</label>
                  <input type="number" id="addPrice" name="price" value={addForm.price} onChange={handleAddChange} placeholder="40" required min={0} />
                </div>
                <div className="form-group">
                  <label htmlFor="addAvailable">Available</label>
                  <select id="addAvailable" name="isAvailable" value={addForm.isAvailable} onChange={handleAddChange}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={adding}>
                {adding ? <span className="btn-loader" /> : 'Add Menu Item'}
              </button>
            </form>
          </div>
        )}

        {/* MANAGE TAB */}
        {activeTab === 'manage' && (
          <div className="admin-card">
            <h3>Find & Manage Menu Item</h3>

            {/* Lookup */}
            <form onSubmit={handleFetch} className="admin-lookup-form">
              <div className="form-group">
                <label htmlFor="lookupId">Menu Item ID</label>
                <input
                  type="text"
                  id="lookupId"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Enter MongoDB _id"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={fetching}>
                {fetching ? <span className="btn-loader" /> : 'Fetch'}
              </button>
            </form>

            {/* Fetched Item Display */}
            {menuItem && (
              <div className="admin-item-display">
                <div className="admin-item-preview">
                  <div className="admin-item-image">
                    <img src={menuItem.imageFood} alt={menuItem.name} />
                  </div>
                  <div className="admin-item-info">
                    <h4>{menuItem.name}</h4>
                    <p>{menuItem.description}</p>
                    <div className="admin-item-meta">
                      <span className="price-badge">₹{menuItem.price}</span>
                      <span className="category-tag">{menuItem.category}</span>
                      <span className={`status-tag ${menuItem.isAvailable ? 'available' : 'unavailable'}`}>
                        {menuItem.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="admin-item-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditMode(!editMode)}>
                    {editMode ? 'Cancel Edit' : 'Edit Details'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? <span className="btn-loader" /> : 'Delete Item'}
                  </button>
                </div>

                {/* Edit Form */}
                {editMode && (
                  <form onSubmit={handleEditSubmit} className="admin-form admin-edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="editName">Name</label>
                        <input type="text" id="editName" name="name" value={editForm.name} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="editCategory">Category</label>
                        <input type="text" id="editCategory" name="category" value={editForm.category} onChange={handleEditChange} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="editDescription">Description</label>
                      <textarea id="editDescription" name="description" value={editForm.description} onChange={handleEditChange} required rows={3} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="editPrice">Price (₹)</label>
                        <input type="number" id="editPrice" name="price" value={editForm.price} onChange={handleEditChange} required min={0} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="editAvailable">Available</label>
                        <select id="editAvailable" name="isAvailable" value={editForm.isAvailable} onChange={handleEditChange}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? <span className="btn-loader" /> : 'Save Changes'}
                    </button>
                  </form>
                )}

                {/* Image Update */}
                <div className="admin-image-update">
                  <h4>Update Image</h4>
                  <div className="admin-image-row">
                    <div className="image-upload-area image-upload-sm" onClick={() => document.getElementById('editFoodImage').click()}>
                      {newImagePreview ? (
                        <img src={newImagePreview} alt="New preview" className="image-preview" />
                      ) : (
                        <div className="image-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Select new image</span>
                        </div>
                      )}
                      <input type="file" id="editFoodImage" accept="image/*" onChange={handleNewImage} style={{ display: 'none' }} />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleImageUpdate} disabled={updatingImage || !newImage}>
                      {updatingImage ? <span className="btn-loader" /> : 'Update Image'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
