import React, { useState, useEffect } from 'react';
import '../styles/AuthModal.css';

const AuthModal = ({ isOpen, onClose, title, subtitle, submitText, themeClass, fields, mode, onSwitch, onSubmit }) => {
  // ניהול ערכי הטופס
  const [formValues, setFormValues] = useState({});

  // איפוס ערכים כשהמודאל נפתח או כשהמצב (Login/Signup) משתנה
  useEffect(() => {
    setFormValues({});
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    setFormValues({ ...formValues, [index]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // יצירת מערך נתונים לפי סדר השדות שהתקבלו ב-Props
    const dataArray = fields.map((_, index) => formValues[index] || "");
    if (onSubmit) {
      onSubmit(dataArray);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close modal">&times;</button>
        
        <div className="auth-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <div key={index} className="input-group">
              <input
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                value={formValues[index] || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                className={field.error ? 'input-error' : ''}
              />
              {/* הצגת הודעת שגיאה ספציפית מתחת לשדה אם קיימת */}
              {field.error && (
                <span className="field-error-msg">
                  {field.error}
                </span>
              )}
            </div>
          ))}
          
          <button type="submit" className={`auth-submit-btn ${themeClass}`}>
            {submitText}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {mode === 'login' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
          </span>
          <button 
            type="button" 
            className="switch-link" 
            onClick={(e) => {
              e.stopPropagation();
              onSwitch();
            }}
          >
            {mode === 'login' ? 'הרשמה' : 'התחברות'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;