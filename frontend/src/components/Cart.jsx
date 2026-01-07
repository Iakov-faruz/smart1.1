import React from 'react';
import CartItem from './CartItem';
import '../styles/Cart.css';

const Cart = ({ cartItems, setCartItems, onStartCheckout }) => {

  // פונקציה להגדלת כמות
  const increaseQuantity = (id) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // פונקציה להקטנת כמות
  const decreaseQuantity = (id) => {
    setCartItems(cartItems.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  // פונקציה להסרת פריט בודד
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // --- פונקציה חדשה: ריקון כל הסל ---
  const handleClearCart = () => {
    const confirmClear = window.confirm("האם אתה בטוח שברצונך לרוקן את כל הסל?");
    if (confirmClear) {
      setCartItems([]);
    }
  };

  // חישוב סכום כולל
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  return (
    <div className="cart-main-wrapper" dir="rtl">
      <div className="cart-container">
        <div className="cart-header">
           <h2>סל הקניות שלי ({cartItems.length})</h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-container">
            <p className="empty-msg">הסל שלך ריק...</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <CartItem
                  key={item.id || index}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="cart-footer">
              <div className="total-row">
                <span>סה"כ לתשלום</span>
                <span className="total-price">₪{totalPrice.toFixed(2)}</span>
              </div>
              
              <button
                className="checkout-btn"
                onClick={onStartCheckout}
              >
                המשך לתשלום
              </button>

              {/* כפתור ריקון סל חדש */}
              <button 
                className="clear-cart-btn"
                onClick={handleClearCart}
              >
                <span className="trash-icon">🗑️</span>
                רוקן את הסל
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;