import React, { useState, useEffect } from 'react';
import { updateProductById } from '../api/update_product_by_id'; 
import '../styles/EditProductModal.css';

const EditProductModal = ({ isOpen, onClose, product, onRefresh }) => {
    // הגדרת מצב עבור שדות הטופס הניתנים לעריכה
    const [formData, setFormData] = useState({
        name: '',
        original_price: '',
        stock_qty: '',
        expiry_date: ''
    });

    // בכל פעם שנבחר מוצר חדש לעריכה, נטען את פרטיו לטופס
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.ProductName || product.name || '',
                original_price: product.original_price || '',
                stock_qty: '', // מאפסים כדי שהמנהל יזין כמה הוא מוסיף עכשיו
                expiry_date: '' // מאפסים כדי להזין תאריך אצווה חדשה
            });
        }
    }, [product]);

    // אם המודאל סגור או שאין מוצר נבחר - אל תרנדר כלום
    if (!isOpen || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // שליחת הנתונים לשרת
            // אנחנו שולחים את ה-SKU כי הוא המפתח לזיהוי אצווה (תאריך) קיימת או חדשה
            await updateProductById(product.ProductID || product.id, {
                ...formData,
                sku: product.sku // השרת ישתמש בזה וב-ID כדי למצוא את הקטגוריה המקורית
            });
            
            onRefresh(); // רענון רשימת המוצרים במסך הראשי
            onClose();   // סגירת המודאל
        } catch (err) {
            alert("שגיאה בעדכון: " + err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* סגירה בלחיצה על הרקע הכהה */}
            <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* מניעת סגירה בלחיצה בתוך תוכן המודאל */}
                
                <div className="modal-header">
                    <h2>ניהול מלאי ואצוות: {formData.name}</h2>
                    {/* כפתור האיקס לסגירה */}
                    <button className="close-x-btn" onClick={onClose} aria-label="סגור">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="edit-form">
                    <p className="modal-subtitle">
                        הזן את הכמות והתאריך עבור המלאי החדש. אם התאריך כבר קיים, המלאי יתווסף אליו.
                    </p>

                    <div className="form-grid">
                        <div className="input-group">
                            <label>שם המוצר</label>
                            <input 
                                type="text"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="שם המוצר"
                                required 
                            />
                        </div>
                        
                        <div className="input-group">
                            <label>מחיר ליחידה (₪)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData.original_price} 
                                onChange={(e) => setFormData({...formData, original_price: e.target.value})} 
                                placeholder="0.00"
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>כמות להוספה למלאי</label>
                            <input 
                                type="number" 
                                value={formData.stock_qty} 
                                onChange={(e) => setFormData({...formData, stock_qty: e.target.value})} 
                                placeholder="למשל: 20"
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>תאריך תפוגה (של האצווה)</label>
                            <input 
                                type="date" 
                                value={formData.expiry_date} 
                                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-save">עדכן מלאי במערכת</button>
                        <button type="button" className="btn-cancel" onClick={onClose}>ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;