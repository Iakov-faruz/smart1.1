// import React, { useState } from 'react';
// import AuthModal from './AuthModal';
// import StatusPopup from './StatusPopup'; // יבוא ה-Popup
// import { loginUser } from '../api/auth';

// const SignIn = ({ isOpen, onClose, onSwitch }) => {
//   // ניהול מצב ה-Popup
//   const [popup, setPopup] = useState({
//     show: false,
//     message: '',
//     type: 'success'
//   });

//   const handleClosePopup = () => {
//     setPopup({ ...popup, show: false });
//     if (popup.type === 'success') {
//       onClose(); // אם ההתחברות הצליחה, נסגור גם את המודאל הראשי
//     }
//   };

//   const handleSignInSubmit = async (formData) => {
//     const username = formData[0];
//     const password = formData[1];

//     try {
//       const data = await loginUser(username, password);
      
//       // שמירה ב-LocalStorage
//       localStorage.setItem('user', JSON.stringify(data.user));

//       // הצגת Popup הצלחה
//       setPopup({
//         show: true,
//         message: `ברוך הבא ${data.user.username}! התחברת בהצלחה. יש לך ${data.user.loyalty_points} נקודות.`,
//         type: 'success'
//       });

//     } catch (error) {
//       // הצגת Popup שגיאה (הודעה מהשרת)
//       setPopup({
//         show: true,
//         message: error || 'שם משתמש או סיסמה שגויים',
//         type: 'error'
//       });
//     }
//   };

//   return (
//     <>
//       <AuthModal
//         isOpen={isOpen}
//         onClose={onClose}
//         onSwitch={onSwitch}
//         onSubmit={handleSignInSubmit}
//         mode="login"
//         title="התחברות"
//         subtitle="שמחים לראות אותך שוב"
//         submitText="התחבר"
//         themeClass="login-theme"
//         fields={[
//           { type: 'text', placeholder: 'שם משתמש', required: true },
//           { type: 'password', placeholder: 'סיסמה', required: true }
//         ]}
//       />

//       {/* ה-Popup של הסטטוס */}
//       <StatusPopup 
//         isOpen={popup.show} 
//         message={popup.message} 
//         type={popup.type} 
//         onClose={handleClosePopup} 
//       />
//     </>
//   );
// };

// export default SignIn;
import React, { useState } from 'react';
import AuthModal from './AuthModal';
import StatusPopup from './StatusPopup'; 
import { loginUser } from '../api/auth';

const SignIn = ({ isOpen, onClose, onSwitch, onUserChange }) => { // הוספנו את onUserChange
  // ניהול מצב ה-Popup
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleClosePopup = () => {
    setPopup({ ...popup, show: false });
    if (popup.type === 'success') {
      onClose(); // סגירת המודאל רק בהצלחה
    }
  };

  const handleSignInSubmit = async (formData) => {
    const username = formData[0];
    const password = formData[1];

    try {
      const data = await loginUser(username, password);
      
      // 1. שמירה ב-LocalStorage לגישה עתידית
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2. עדכון ה-State הראשי ב-App.jsx - זה מה שגורם לרינדור מחדש מיידי!
      if (onUserChange) {
        onUserChange(data.user);
      }

      // 3. הצגת Popup הצלחה
      setPopup({
        show: true,
        message: `ברוך הבא ${data.user.username}! התחברת בהצלחה. יש לך ${data.user.loyalty_points || 0} נקודות.`,
        type: 'success'
      });

    } catch (error) {
      // הצגת Popup שגיאה
      setPopup({
        show: true,
        message: error || 'שם משתמש או סיסמה שגויים',
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
        onSubmit={handleSignInSubmit}
        mode="login"
        title="התחברות"
        subtitle="שמחים לראות אותך שוב"
        submitText="התחבר"
        themeClass="login-theme"
        fields={[
          { type: 'text', placeholder: 'שם משתמש', required: true },
          { type: 'password', placeholder: 'סיסמה', required: true }
        ]}
      />

      <StatusPopup 
        isOpen={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={handleClosePopup} 
      />
    </>
  );
};

export default SignIn;