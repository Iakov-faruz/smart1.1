import React, { useState } from 'react';
import { deleteProduct } from '../api/delete_product'; 
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart, isAdmin, onDeleted, onEdit }) => {
  // ניהול כמות ללקוח רגיל
  const [quantity, setQuantity] = useState(1);
  
  const hasDiscount = Number(product.discountPercent) > 0;
  const currentStock = product.stock_qty || 0;
  const isOutOfStock = currentStock <= 0;

  // פונקציות לשינוי כמות (ללקוח בלבד)
  const increment = (e) => {
    e.stopPropagation();
    if (quantity < currentStock) setQuantity(prev => prev + 1);
  };

  const decrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAdminClick = (e) => {
    if (!e.target.closest('button')) {
      onEdit();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${product.ProductName || product.name}"?`)) {
      try {
        await deleteProduct(product.ProductID || product.id);
        if (onDeleted) onDeleted(product.ProductID || product.id);
      } catch (err) {
        alert("שגיאה במחיקה: " + err.message);
      }
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1); // איפוס אחרי הוספה
  };

  return (
    <div 
      className={`product-card ${isAdmin ? 'admin-editable' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
      onClick={isAdmin ? handleAdminClick : undefined}
    >
      <div className="product-info">
        {hasDiscount && (
          <div className="discount-badge-inline">
            {product.discountPercent}% הנחה
          </div>
        )}
        <h3>{product.ProductName || product.name}</h3> 
        
        <div className="price-display-area">
          {hasDiscount ? (
            <div className="price-wrapper">
              <span className="price-new">₪{product.finalPrice}</span>
              <span className="price-old">₪{product.original_price}</span>
            </div>
          ) : (
            <p className="price">₪{product.original_price}</p>
          )}
        </div>
      </div>
      
      <div className="product-actions-area">
        {isAdmin ? (
          // תצוגת מנהל - מלאי כטקסט
          <div className="admin-preview">
            <p>מלאי נוכחי: <strong>{currentStock}</strong></p>
            <small className="edit-hint">(לחץ לניהול מלאי)</small>
          </div>
        ) : (
          // תצוגת לקוח - כפתורי פלוס ומינוס עם העיצוב שלך
          !isOutOfStock && (
            <div className="user-qty-selector">
              <button type="button" onClick={decrement} className="qty-btn">-</button>
              <span className="qty-value">{quantity}</span>
              <button type="button" onClick={increment} className="qty-btn">+</button>
            </div>
          )
        )}

        {isAdmin ? (
          <button className="delete-action-btn" onClick={handleDelete}>
            🗑️ מחק מוצר
          </button>
        ) : (
          <button 
            className="add-to-cart" 
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'אזל מהמלאי' : 'הוסף לסל'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;