import React, { useState } from 'react';
import { loginAdmin } from '../api/auth_adminsitrator.js'; 
import '../styles/AuthModal.css';

const AdminLogin = ({ isOpen, onClose, onAdminChange }) => {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAdmin(credentials.username, credentials.email, credentials.password);
      
      // שמירה ב-LocalStorage
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      
      // עדכון ה-State באפליקציה (זה מה שמשנה את התצוגה בפועל)
      onAdminChange(data.admin);
      
      alert(`שלום ${data.admin.first_name}, גישת מנהל אושרה!`);
      onClose();
      
      // שינוי הכתובת ב-URL ללא רענון דף
      window.history.pushState({}, '', '/admin-dashboard'); 
      
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || 'פרטי זיהוי מנהל שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal admin-theme" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="סגור">&times;</button>
        
        <div className="auth-header">
          <div className="admin-icon" style={{fontSize: '2rem', marginBottom: '10px'}}>🔐</div>
          <h2>כניסת מנהל מערכת</h2>
          <p>נא להזין פרטי זיהוי מלאים</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="text" name="username" placeholder="שם משתמש אדמין" 
              value={credentials.username} onChange={handleChange} required 
            />
          </div>
          <div className="input-group">
            <input 
              type="email" name="email" placeholder="כתובת אימייל" 
              value={credentials.email} onChange={handleChange} required 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" name="password" placeholder="סיסמה" 
              value={credentials.password} onChange={handleChange} required 
            />
          </div>

          {error && <p className="error-msg" style={{color: '#e74c3c', textAlign: 'center'}}>{error}</p>}

          <button type="submit" className="auth-submit-btn admin" disabled={loading}>
            {loading ? 'מאמת נתונים...' : 'התחבר למערכת הניהול'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;