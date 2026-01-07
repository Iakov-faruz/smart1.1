import React, { useState, useEffect } from 'react';
import axios from 'axios'; // או apiClient אם הגדרת אחד כזה
import '../styles/Checkout.css';

const Checkout = ({ cartItems, totalPrice, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // מילוי פרטים אוטומטי אם המשתמש מחובר
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("הסל שלך ריק");
      return;
    }

    setIsSubmitting(true);

    try {
      // שליפת ה-ID של המשתמש המחובר
      const savedUser = localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      
      // חשוב: לוודא שהשדה ב-SQL הוא UserID או id
      const customerId = user ? (user.UserID || user.id) : null;

      const orderData = {
        customerId: customerId,
        customerInfo: formData, // מכיל כתובת, עיר וטלפון
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: totalPrice
      };

      // שליחה ל-Backend (וודא שה-URL תואם לשרת שלך)
      const response = await axios.post('http://localhost:5000/api/create_order', orderData);
      
      alert(`תודה ${formData.fullName}, ההזמנה מספר ${response.data.orderId} בוצעה בהצלחה!`);
      
      // ניקוי הסל וחזרה לדף הבית
      localStorage.removeItem('smart_shop_cart');
      window.location.href = '/'; 

    } catch (error) {
      console.error("שגיאה בביצוע הזמנה:", error);
      alert("ההזמנה נכשלה. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container" dir="rtl">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBack}>← חזרה לסל</button>
        <h2>צ'ק-אאוט ותשלום</h2>
      </div>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>פרטי משלוח</h3>
          <input 
            type="text" 
            name="fullName" 
            placeholder="שם מלא" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="אימייל" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <input type="text" name="phone" placeholder="טלפון" value={formData.phone} onChange={handleChange} required />
          <input type="text" name="city" placeholder="עיר" value={formData.city} onChange={handleChange} required />
          <input type="text" name="address" placeholder="כתובת מלאה" value={formData.address} onChange={handleChange} required />
          
          <button type="submit" className="confirm-order-btn" disabled={isSubmitting}>
            {isSubmitting ? 'מעבד הזמנה...' : 'אשר הזמנה ותשלום'}
          </button>
        </form>

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
             <span>🔒 תשלום מאובטח</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;