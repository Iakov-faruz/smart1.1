import React from 'react';
import { toast } from 'react-toastify';
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
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // פונקציית ריקון סל עם עיצוב מותאם
  const handleClearCart = () => {
    toast.dismiss(); 

    toast(
      <div className="modern-confirm-toast">
        <p>לרוקן את כל המוצרים מהסל?</p>
        <div className="confirm-actions">
          <button 
            className="btn-confirm-red" 
            onClick={() => {
              setCartItems([]);
              toast.dismiss();
              toast.info("הסל רוקן בהצלחה");
            }}
          >
            כן, רוקן הכל
          </button>
          <button className="btn-confirm-green" onClick={() => toast.dismiss()}>
            ביטול
          </button>
        </div>
      </div>,
      {
        position: "top-center", 
        autoClose: 7000, 
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        icon: false,
      }
    );
  };

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
              
              <button className="checkout-btn" onClick={onStartCheckout}>
                המשך לתשלום
              </button>

              <button className="clear-cart-btn" onClick={handleClearCart}>
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