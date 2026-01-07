import React, { useState, useEffect } from 'react';
import { addProducts } from '../api/add_products';
import { getCategoriesOnly } from '../api/get_categories';
import '../styles/AddProductModal.css';

const AddProductModal = ({ isOpen, onClose, onRefresh }) => {
  const [dbCategories, setDbCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([
    { name: '', original_price: '', stock_qty: '', category_id: '', expiry_date: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        const data = await getCategoriesOnly();
        setDbCategories(data);
      };
      fetchCats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRowChange = (index, field, value) => {
    const updated = [...newProducts];
    updated[index][field] = value;
    setNewProducts(updated);
  };

  const addRow = () => {
    setNewProducts([...newProducts, { name: '', original_price: '', stock_qty: '', category_id: '', expiry_date: '' }]);
  };

  // פונקציית מחיקה עם הגנה על השורה האחרונה
  const removeRow = (index) => {
    if (newProducts.length > 1) {
      setNewProducts(newProducts.filter((_, i) => i !== index));
    } else {
      alert("חובה להשאיר לפחות שורת מוצר אחת.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addProducts(newProducts);
      alert('המוצרים נוספו בהצלחה!');
      setNewProducts([{ name: '', original_price: '', stock_qty: '', category_id: '', expiry_date: '' }]); // איפוס
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>📦 הוספת מוצרים חדשים</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="table-container">
            <table className="admin-add-table">
              <thead>
                <tr>
                  <th>שם מוצר</th>
                  <th>מחיר</th>
                  <th>מלאי</th>
                  <th>קטגוריה</th>
                  <th>תאריך תוקף</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {newProducts.map((prod, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="text" 
                        placeholder="שם המוצר..." 
                        value={prod.name} 
                        onChange={e => handleRowChange(index, 'name', e.target.value)} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={prod.original_price} 
                        onChange={e => handleRowChange(index, 'original_price', e.target.value)} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        placeholder="כמות" 
                        value={prod.stock_qty} 
                        onChange={e => handleRowChange(index, 'stock_qty', e.target.value)} 
                        required 
                      />
                    </td>
                    <td>
                      <select 
                        value={prod.category_id} 
                        onChange={e => handleRowChange(index, 'category_id', e.target.value)}
                        required
                      >
                        <option value="">בחר קטגוריה...</option>
                        {dbCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={prod.expiry_date} 
                        onChange={e => handleRowChange(index, 'expiry_date', e.target.value)} 
                      />
                    </td>
                    <td>
                      {/* הכפתור יוצג רק אם יש יותר משורה אחת, או שיהיה disabled */}
                      <button 
                        type="button" 
                        className="btn-remove-row" 
                        onClick={() => removeRow(index)}
                        style={{ display: newProducts.length > 1 ? 'block' : 'none' }}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-actions">
            <button type="button" className="btn-add-row" onClick={addRow}>
              + שורה נוספת
            </button>
            <div className="main-btns">
              <button type="button" className="btn-cancel" onClick={onClose}>ביטול</button>
              <button type="submit" className="btn-save" disabled={isSaving}>
                {isSaving ? 'שומר נתונים...' : 'שמור בבסיס הנתונים'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;