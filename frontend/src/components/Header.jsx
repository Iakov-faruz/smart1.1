import React, { useState } from 'react';
import CategoryButtons from './CategoryButtons';
import Cart from './Cart';
import '../styles/Header.css';

const Header = ({ 
  categories, 
  onSelectCategory, 
  selectedCategory, 
  cartItems, 
  setCartItems, 
  onGoToCheckout 
}) => {
  const [showCart, setShowCart] = useState(false);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="app-header">
        <button className="cart-toggle-btn" onClick={() => setShowCart(true)}>
          <span className="cart-icon">🛒</span>
          {totalItemsCount > 0 && <span className="cart-count">{totalItemsCount}</span>}
        </button>

        <div className="auth-nav">
          <button className="auth-btn">התחבר</button>
          <button className="auth-btn register">הרשמה</button>
        </div>

        <CategoryButtons 
          categories={categories} 
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
        />

        <div className="logo">
          <h1>Smart Shop</h1>
        </div>
      </header>

      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close-cart" onClick={() => setShowCart(false)}>&times;</button>
            <Cart 
              cartItems={cartItems} 
              setCartItems={setCartItems} 
              onStartCheckout={() => {
                setShowCart(false); // סוגר את הסל לפני שעוברים לדף תשלום
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