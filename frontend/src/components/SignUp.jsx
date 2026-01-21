import React, { useState } from 'react';
import AuthModal from './AuthModal';
import StatusPopup from './StatusPopup';
import { createCustomer } from '../api/create_customer.js';

const SignUp = ({ isOpen, onClose, onSwitch }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const validate = (data) => {
    const errors = {};
    const [username, email, password, phone, city, address] = data;

    if (!/^[a-zA-Z0-9א-ת\s]+$/.test(username)) {
      errors[0] = "שם משתמש: אותיות ומספרים בלבד";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors[1] = "נא להזין כתובת אימייל תקינה";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z]).{5,}$/.test(password)) {
      errors[2] = "סיסמה: לפחות 5 תווים, אות גדולה וקטנה";
    }
    if (!/^[0-9-]{9,11}$/.test(phone)) {
      errors[3] = "נא להזין מספר טלפון תקין";
    }
    if (!city || city.trim().length < 2) {
      errors[4] = "נא להזין שם עיר";
    }
    if (!address || address.trim().length < 3) {
      errors[5] = "נא להזין כתובת מלאה";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUpSubmit = async (formData) => {
    setFieldErrors({});
    if (!validate(formData)) return;

    try {
      await createCustomer({
        username: formData[0],
        email: formData[1],
        password: formData[2],
        phone: formData[3],
        city: formData[4],
        address: formData[5]
      });

      setPopup({
        show: true,
        message: 'החשבון נוצר בהצלחה!',
        type: 'success'
      });
    } catch (error) {
      setPopup({
        show: true,
        message: error.response?.data?.error || 'שגיאה ברישום',
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
        subtitle="הצטרפו לקהילה שלנו"
        submitText="צור חשבון"
        themeClass="signup-theme"
        fields={[
          { type: 'text', placeholder: 'שם משתמש', required: true, error: fieldErrors[0] },
          { type: 'email', placeholder: 'אימייל', required: true, error: fieldErrors[1] },
          { type: 'password', placeholder: 'סיסמה', required: true, error: fieldErrors[2] },
          { type: 'text', placeholder: 'טלפון', required: true, error: fieldErrors[3] },
          { type: 'text', placeholder: 'עיר', required: true, error: fieldErrors[4] },
          { type: 'text', placeholder: 'כתובת', required: true, error: fieldErrors[5] }
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