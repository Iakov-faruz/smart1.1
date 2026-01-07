import React, { useState } from 'react';
import CategoryButtons from './CategoryButtons';
import Cart from './Cart';
import SignIn from './SignIn';
import SignUp from './SignUp';
import UserProfile from './UserProfile';
import '../styles/Header.css';

const Header = ({ 
  categories, 
  onSelectCategory, 
  selectedCategory, 
  cartItems, 
  setCartItems, 
  onGoToCheckout,
  user,           // מקבל מה-App לטובת רינדור דינמי
  onUserChange    // פונקציה לעדכון ה-State ב-App
}) => {
  const [showCart, setShowCart] = useState(false);
  
  // מצבים לניהול פתיחת המודאלים
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // פונקציית התנתקות - מנקה זיכרון ומעדכנת State ללא רענון דף
  const handleLogout = () => {
    localStorage.removeItem('user');
    onUserChange(null); 
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="app-header">
        {/* צד שמאל: סל קניות עם מונה פריטים */}
        <button className="cart-toggle-btn" onClick={() => setShowCart(true)}>
          <span className="cart-icon">🛒</span>
          {totalItemsCount > 0 && <span className="cart-count">{totalItemsCount}</span>}
        </button>

        {/* צד ימין: ניווט משתמש (התחברות/פרופיל) */}
        <div className="auth-nav">
          {user ? (
            <div className="user-logged-in">
              {/* שם משתמש בעיצוב טקסט גדול - לחיצה פותחת פרופיל */}
              <button className="user-welcome-btn" onClick={() => setIsProfileOpen(true)}>
                 👤 שלום, {user.username}
              </button>
              {/* כפתור התנתקות בעיצוב של כפתורי האימות */}
              <button className="logout-btn" onClick={handleLogout}>
                התנתק
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="auth-btn" onClick={() => setIsLoginOpen(true)}>התחבר</button>
              <button className="auth-btn register" onClick={() => setIsSignupOpen(true)}>הרשמה</button>
            </div>
          )}
        </div>

        {/* מרכז: כפתורי קטגוריות */}
        <CategoryButtons 
          categories={categories} 
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
        />

        {/* לוגו החנות */}
        <div className="logo">
          <h1>Smart Shop</h1>
        </div>
      </header>

      {/* רכיבי מודאל (צפים מעל הדף) */}
      <SignIn 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onUserChange={onUserChange}
        onSwitch={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} 
      />

      <SignUp 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
        onSwitch={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} 
      />

      <UserProfile 
        user={user} 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* מגירת עגלת קניות */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close-cart" onClick={() => setShowCart(false)}>&times;</button>
            <Cart 
              cartItems={cartItems} 
              setCartItems={setCartItems} 
              onStartCheckout={() => {
                setShowCart(false);
                onGoToCheckout();
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;