import React, { useState } from 'react';
import '../styles/Checkout.css';

const Checkout = ({ cartItems, totalPrice, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`תודה ${formData.fullName}, ההזמנה על סך ₪${totalPrice.toFixed(2)} התקבלה!`);
    // כאן תוסיף קריאה ל-API לשליחת ההזמנה לשרת
  };

  return (
    <div className="checkout-container" dir="rtl">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBack}>← חזרה לסל</button>
        <h2>צ'ק-אאוט ותשלום</h2>
      </div>

      <div className="checkout-content">
        {/* טופס פרטים */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>פרטי משלוח</h3>
          <input type="text" name="fullName" placeholder="שם מלא" onChange={handleChange} required />
          <input type="email" name="email" placeholder="אימייל" onChange={handleChange} required />
          <input type="text" name="phone" placeholder="טלפון" onChange={handleChange} required />
          <input type="text" name="city" placeholder="עיר" onChange={handleChange} required />
          <input type="text" name="address" placeholder="כתובת מלאה (רחוב ומספר בית)" onChange={handleChange} required />
          
          <button type="submit" className="confirm-order-btn">אשר הזמנה ותשלום</button>
        </form>

        {/* סיכום הזמנה בצד */}
        <div className="order-summary">
          <h3>סיכום הזמנה</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} (x{item.quantity})</span>
                <span>₪{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="summary-total">
            <span>סה"כ לתשלום:</span>
            <span className="final-price">₪{totalPrice.toFixed(2)}</span>
          </div>
          <div className="secure-badge">
            <span>🔒 תשלום מאובטח בטכנולוגיית SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;