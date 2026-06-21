import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = { name: '', price: '', categoryId: '', imageUrl: '' };

export default function AdminPage() {
  const { authHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [menuItems,  setMenuItems]  = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null); // non-null means edit mode
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [feedback,  setFeedback]  = useState(null);
  const fileInputRef = useRef(null);
  const formRef      = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/menu').then((r) => r.json()),
    ]).then(([cats, items]) => {
      setCategories(cats);
      setMenuItems(items);
      if (cats.length > 0)
        setForm((f) => ({ ...f, categoryId: String(cats[0].id) }));
    });
  }, []);

  function handleField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, imageUrl: '' }));
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name:       item.name,
      price:      String(item.price),
      categoryId: String(item.categoryId),
      imageUrl:   item.imageUrl ?? '',
    });
    setImageFile(null);
    setImagePreview(item.imageUrl ?? null);
    setFeedback(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0] ? String(categories[0].id) : '' });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFeedback(null);
  }

  async function uploadToCloudinary() {
    if (!imageFile) return form.imageUrl || null;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setFeedback({ type: 'error', msg: 'Cloudinary is not configured.' });
      return null;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );

      if (!res.ok) throw new Error('Cloudinary upload failed');
      return (await res.json()).secure_url;
    } catch (err) {
      setFeedback({ type: 'error', msg: `Image upload failed: ${err.message}` });
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!form.name.trim() || !form.price || !form.categoryId) {
      setFeedback({ type: 'error', msg: 'Name, price and category are required.' });
      return;
    }

    const imageUrl = await uploadToCloudinary();
    if (imageFile && !imageUrl) return;

    setSaving(true);
    try {
      if (editingId !== null) {
        //  PATCH existing item 
        const res = await fetch(`/api/menu/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            id:         editingId,
            name:       form.name.trim(),
            price:      parseFloat(form.price),
            categoryId: parseInt(form.categoryId),
            imageUrl:   imageUrl || null,
          }),
        });
        if (!res.ok) throw new Error('Failed to update item');
        const updated = await res.json();
        setMenuItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
        setFeedback({ type: 'success', msg: `"${updated.name}" updated.` });
        handleCancelEdit();
      } else {
        // POST new item 
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            name:       form.name.trim(),
            price:      parseFloat(form.price),
            categoryId: parseInt(form.categoryId),
            imageUrl:   imageUrl || null,
          }),
        });
        if (!res.ok) throw new Error('Failed to save item');
        const created = await res.json();
        setMenuItems((prev) => [...prev, created]);
        setForm((f) => ({ ...f, name: '', price: '', imageUrl: '' }));
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFeedback({ type: 'success', msg: `"${created.name}" added to the menu.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }
// DELETE an item
  async function handleDelete(id, name) {
    if (!window.confirm(`Remove "${name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: authHeader() });
      if (!res.ok) throw new Error('Delete failed');
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) handleCancelEdit();
      setFeedback({ type: 'success', msg: `"${name}" removed.` });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  }

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-brand-name">Le Château</span>
          <span className="admin-brand-sub">Manager Panel</span>
        </div>
        <div className="admin-header-right">
          <a href="/" className="admin-back">← Back to menu</a>
          <button
            className="admin-logout-btn"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Log out
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── Add / Edit form ── */}
        <section className="admin-section" ref={formRef}>
          <h2 className="admin-section-title">
            {editingId !== null ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>

          {feedback && (
            <div className={`admin-feedback admin-feedback--${feedback.type}`}>
              {feedback.msg}
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleField}
                placeholder="e.g. Croissant"
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">Price (€)</label>
              <input
                className="form-input"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleField}
                placeholder="e.g. 3.50"
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                name="categoryId"
                value={form.categoryId}
                onChange={handleField}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">Image</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview-wrap">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setForm((f) => ({ ...f, imageUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label className="file-drop-label">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="file-input-hidden"
                      onChange={handleFileChange}
                    />
                    <span className="file-drop-icon">↑</span>
                    <span>Click to upload image</span>
                    <span className="file-drop-hint">JPG, PNG, WEBP — uploaded to Cloudinary CDN</span>
                  </label>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="admin-submit-btn"
                disabled={uploading || saving}
              >
                {uploading ? 'Uploading image…' : saving ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Add to Menu'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Current menu list ── */}
        <section className="admin-section">
          <h2 className="admin-section-title">Current Menu ({menuItems.length} items)</h2>

          {menuItems.length === 0 ? (
            <p className="admin-empty">No items yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className={editingId === item.id ? 'row--editing' : ''}>
                    <td>
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="table-thumb" />
                        : <div className="table-thumb-placeholder" />
                      }
                    </td>
                    <td className="table-name">{item.name}</td>
                    <td className="table-category">{categoryName(item.categoryId)}</td>
                    <td className="table-price">€{item.price?.toFixed(2)}</td>
                    <td className="table-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
