import React, { useState } from 'react';
import AuthModal from './AuthModal';
import StatusPopup from './StatusPopup';
import { createCustomer } from '../api/create_customer.js';

const SignUp = ({ isOpen, onClose, onSwitch }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  // פונקציית בדיקה (Client-side Validation)
  const validate = (data) => {
    const errors = {};
    const [username, email, password] = data;

    // וולידציה לשם משתמש (עברית/אנגלית/מספרים)
    if (!/^[a-zA-Z0-9א-ת]+$/.test(username)) {
      errors[0] = "שם משתמש: אותיות ומספרים בלבד ללא תווים מיוחדים";
    }

    // וולידציה למייל
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors[1] = "נא להזין כתובת אימייל תקינה";
    }

    // וולידציה לסיסמה (5 תווים, גדולה וקטנה)
    if (!/^(?=.*[a-z])(?=.*[A-Z]).{5,}$/.test(password)) {
      errors[2] = "הסיסמה חייבת לכלול לפחות 5 תווים, אות גדולה ואות קטנה";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUpSubmit = async (formData) => {
    // 1. נקה שגיאות קודמות ובצע בדיקה
    setFieldErrors({});
    if (!validate(formData)) return;

    try {
      // 2. שליחה לשרת
      await createCustomer({
        username: formData[0],
        email: formData[1],
        password_hash: formData[2]
      });

      // 3. הצלחה - הצגת פופאפ ואיפוס שגיאות
      setPopup({
        show: true,
        message: 'החשבון נוצר בהצלחה! ברוכים הבאים.',
        type: 'success'
      });
    } catch (error) {
      // 4. טיפול בשגיאות שחזרו מהשרת (כמו "מייל תפוס")
      const serverError = error.response?.data?.error || 'שגיאה בתקשורת עם השרת';
      setPopup({
        show: true,
        message: serverError,
        type: 'error'
      });
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        onSwitch={onSwitch}
        onSubmit={handleSignUpSubmit}
        mode="signup"
        title="הרשמה"
        subtitle="הצטרפו לקהילת הלקוחות שלנו"
        submitText="צור חשבון"
        themeClass="signup-theme"
        fields={[
          { type: 'text', placeholder: 'שם משתמש', required: true, error: fieldErrors[0] },
          { type: 'email', placeholder: 'אימייל', required: true, error: fieldErrors[1] },
          { type: 'password', placeholder: 'סיסמה', required: true, error: fieldErrors[2] }
        ]}
      />

      <StatusPopup 
        isOpen={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={() => {
          setPopup({ ...popup, show: false });
          if (popup.type === 'success') onClose();
        }} 
      />
    </>
  );
};

export default SignUp;