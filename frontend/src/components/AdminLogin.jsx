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

    // לוג 1: בדיקת הנתונים שנשלחים מהקומפוננטה
    console.log("--- Front-end: ניסיון התחברות אדמין ---");
    console.log("נתונים שנשלחים ל-API:", credentials);

    try {
      // קריאה לפונקציית ה-API
      const data = await loginAdmin(credentials.username, credentials.email, credentials.password);
      
      // לוג 2: בדיקת התגובה שהתקבלה בהצלחה מהשרת
      console.log("--- Front-end: תגובה מוצלחת מהשרת ---");
      console.log("מידע שהתקבל:", data);
      
      onAdminChange(data.admin);
      
      alert(`שלום ${data.admin.first_name}, גישת מנהל אושרה!`);
      onClose();
      
      // העברה לדף הניהול
      window.location.href = '/admin-dashboard'; 
    } catch (err) {
      // לוג 3: פירוט השגיאה במקרה של כישלון
      console.error("--- Front-end: שגיאה בתהליך ההתחברות ---");
      console.error("פירוט השגיאה:", err.message);
      
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
              type="text" 
              name="username" // מוודא שזה תואם למפתח ב-credentials
              placeholder="שם משתמש אדמין" 
              value={credentials.username}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="email" 
              name="email"
              placeholder="כתובת אימייל" 
              value={credentials.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              name="password"
              placeholder="סיסמה" 
              value={credentials.password}
              onChange={handleChange}
              required 
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