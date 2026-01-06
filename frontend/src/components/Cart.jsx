import React from 'react';
import CartItem from './CartItem';
import '../styles/Cart.css';

const Cart = ({ cartItems, setCartItems, onStartCheckout }) => {
  const increaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    /* הוספת cart-main-wrapper כדי לאפשר גובה מלא וגלילה פנימית */
    <div className="cart-main-wrapper" dir="rtl">
      <div className="cart-container">
        <h2>סל הקניות שלי ({cartItems.length})</h2>
        
        {cartItems.length === 0 ? (
          <p className="empty-msg">הסל שלך ריק...</p>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="total-row">
                <span>סה"כ לתשלום:</span>
                <span className="total-price">₪{totalPrice.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={onStartCheckout}>
                המשך לתשלום
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;