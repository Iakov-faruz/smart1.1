import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // ייבוא ספריית האקסל
import CategoryButtons from './CategoryButtons';
import Cart from './Cart';
import SignIn from './SignIn';
import SignUp from './SignUp';
import UserProfile from './UserProfile';
import AdminLogin from './AdminLogin'; 
import AddProductModal from './AddProductModal';
import '../styles/Header.css';

const Header = ({ 
  categories, 
  onSelectCategory, 
  selectedCategory, 
  cartItems, 
  setCartItems, 
  onGoToCheckout,
  user,           
  onUserChange,
  admin,         
  onAdminChange,
  onRefresh     
}) => {
  const [showCart, setShowCart] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  // פונקציית ייצוא לאקסל
  const exportToExcel = () => {
    try {
      if (!categories || categories.length === 0) {
        alert("אין נתונים לייצוא");
        return;
      }

      // הכנת המידע בפורמט נקי
      const dataToExport = categories.map(product => ({
        "ברקוד (SKU)": product.sku || 'N/A',
        "שם המוצר": product.ProductName || product.name,
        "קטגוריה": product.CategoryName,
        "מחיר מקורי": product.original_price,
        "מלאי": product.stock_qty,
        "תאריך תפוגה": product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('he-IL') : 'ללא',
        "הנחה %": product.discountPercent || 0,
        "מחיר סופי": product.finalPrice || product.original_price
      }));

      // יצירת הקובץ והורדה
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      
      const fileName = `Inventory_Report_${new Date().toLocaleDateString('he-IL').replace(/\./g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Excel Export Error:", err);
      alert("שגיאה בתהליך הייצוא");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    onUserChange(null); 
    alert("התנתקת מהמערכת.");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_user');
    onAdminChange(null);
    window.history.pushState({}, '', '/');
    alert("יצאת ממערכת הניהול.");
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setIsAdminLoginOpen(true);
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="app-header">
        <button className="cart-toggle-btn" onClick={() => setShowCart(true)}>
          <span className="cart-icon">🛒</span>
          {totalItemsCount > 0 && <span className="cart-count">{totalItemsCount}</span>}
        </button>

        <div className="auth-nav">
          {admin ? (
            <div className="admin-logged-in">
              {/* כפתור ייצוא לאקסל למנהל */}
              <button className="auth-btn export-btn" onClick={exportToExcel}>
                📥 ייצוא מלאי
              </button>

              <button className="auth-btn add-product-btn" onClick={() => setIsAddProductOpen(true)}>
                ➕ הוסף מוצר
              </button>
              
              <button className="auth-btn admin-panel-btn" onClick={() => window.history.pushState({}, '', '/admin-dashboard')}>
                🛠 לוח בקרה
              </button>
              
              <button className="logout-btn" onClick={handleAdminLogout}>יציאה</button>
            </div>
          ) : user ? (
            <div className="user-logged-in">
              <button className="user-welcome-btn" onClick={() => setIsProfileOpen(true)}>
                 👤 שלום, {user.username}
              </button>
              <button className="logout-btn" onClick={handleLogout}>התנתק</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="auth-btn" onClick={() => setIsLoginOpen(true)}>התחבר</button>
              <button className="auth-btn register" onClick={() => setIsSignupOpen(true)}>הרשמה</button>
            </div>
          )}
        </div>

        <CategoryButtons 
          categories={categories} 
          onSelectCategory={onSelectCategory} 
          selectedCategory={selectedCategory}
        />

        <div className="logo">
          <h1 onClick={handleLogoClick} style={{ cursor: 'pointer', userSelect: 'none' }}>Smart Shop</h1>
        </div>
      </header>

      {/* מודאלים */}
      <SignIn isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onUserChange={onUserChange} onSwitch={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} />
      <SignUp isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSwitch={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} />
      <UserProfile user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AdminLogin isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onAdminChange={onAdminChange} />
      
      <AddProductModal 
        isOpen={isAddProductOpen} 
        onClose={() => setIsAddProductOpen(false)} 
        categories={categories} 
        onRefresh={onRefresh} 
      />

      {/* Drawer של הסל */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close-cart" onClick={() => setShowCart(false)}>&times;</button>
            <Cart cartItems={cartItems} setCartItems={setCartItems} onStartCheckout={() => { setShowCart(false); onGoToCheckout(); }} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;