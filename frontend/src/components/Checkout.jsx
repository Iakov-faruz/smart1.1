import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/Checkout.css';

const Checkout = ({ cartItems, totalPrice, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setFormData({
          fullName: user.username || '',
          email: user.email || '',
          phone: user.phone || '',    
          city: user.city || '',      
          address: user.address || '' 
        });
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9-]{9,11}$/;

    if (!formData.fullName.trim()) tempErrors.fullName = "נא להזין שם מלא";
    if (!emailRegex.test(formData.email)) tempErrors.email = "כתובת אימייל לא תקינה";
    if (!phoneRegex.test(formData.phone)) tempErrors.phone = "מספר טלפון לא תקין (9-11 ספרות)";
    if (!formData.city.trim()) tempErrors.city = "נא להזין עיר";
    if (formData.address.trim().length < 5) tempErrors.address = "נא להזין כתובת מלאה";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("הסל שלך ריק");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const savedUser = localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const customerId = user ? (user.id || user.UserID) : null;

      const orderData = {
        customerId: customerId,
        customerInfo: formData, 
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name, 
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: totalPrice
      };

      const response = await axios.post('http://localhost:5000/api/create_order', orderData);
      
      alert(`תודה ${formData.fullName}, ההזמנה מספר ${response.data.orderId} בוצעה בהצלחה! הקבלה נשלחה למייל.`);
      
      localStorage.removeItem('smart_shop_cart');
      window.location.href = '/'; 

    } catch (error) {
      const errorMsg = error.response?.data?.error || "ההזמנה נכשלה. אנא נסה שוב מאוחר יותר.";
      alert(errorMsg);
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
          
          <div className="input-group">
            <input 
              type="text" name="fullName" placeholder="שם מלא" 
              value={formData.fullName} onChange={handleChange} 
              className={errors.fullName ? 'input-error' : ''} 
            />
            {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
          </div>

          <div className="input-group">
            <input 
              type="email" name="email" placeholder="אימייל לקבלת קבלה" 
              value={formData.email} onChange={handleChange} 
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error-msg">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input 
              type="text" name="phone" placeholder="טלפון" 
              value={formData.phone} onChange={handleChange} 
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
          </div>

          <div className="input-group">
            <input 
              type="text" name="city" placeholder="עיר" 
              value={formData.city} onChange={handleChange} 
              className={errors.city ? 'input-error' : ''}
            />
            {errors.city && <span className="field-error-msg">{errors.city}</span>}
          </div>

          <div className="input-group">
            <input 
              type="text" name="address" placeholder="כתובת מלאה" 
              value={formData.address} onChange={handleChange} 
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && <span className="field-error-msg">{errors.address}</span>}
          </div>
          
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
             <span>🔒 קבלה תישלח למייל בסיום</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;