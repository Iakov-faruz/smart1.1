import React, { useState } from 'react';
import { updateProductStock } from '../api/update_product_qty'; 
import { deleteProduct } from '../api/delete_product'; 
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart, isAdmin, onDeleted }) => {
  const [currentStock, setCurrentStock] = useState(product.stock_qty);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // סטייט לאנימציה

  const isOutOfStock = currentStock <= 0;

  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${product.ProductName || product.name}"?`)) {
      setIsUpdating(true);
      try {
        await deleteProduct(product.id || product.ProductID);
        
        // שלב האנימציה:
        setIsFadingOut(true); // מפעיל את ה-CSS של ההיעלמות
        
        // מחכים שהאנימציה תסתיים (500ms) לפני שמוחקים מה-State הכללי
        setTimeout(() => {
          if (onDeleted) {
            onDeleted(product.id || product.ProductID);
          }
        }, 500);

      } catch (err) {
        alert("שגיאה במחיקה: " + err.message);
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="product-info">
        <h3>{product.ProductName || product.name}</h3> 
        <p className="price">₪{product.original_price || product.price}</p>
        
        <div className="stock-status-area">
          {isAdmin ? (
            <div className="admin-view">
              <p className="admin-stock-label">מלאי: <strong>{currentStock}</strong></p>
              <div className="admin-stock-controls">
                <button onClick={() => !isUpdating && setCurrentStock(s => s + 1)}>+</button>
                <button onClick={() => !isUpdating && currentStock > 0 && setCurrentStock(s => s - 1)}>-</button>
              </div>
            </div>
          ) : (
            isOutOfStock && <p className="out-of-stock-msg">אזל מהמלאי</p>
          )}
        </div>
      </div>
      
      {isAdmin ? (
        <button className="delete-action-btn" onClick={handleDelete} disabled={isUpdating}>
          {isUpdating ? 'מוחק...' : '🗑️ מחק מוצר'}
        </button>
      ) : (
        <button 
          className="add-to-cart" 
          onClick={() => onAddToCart({...product, stock_qty: currentStock})}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'לא זמין' : 'הוסף לסל'}
        </button>
      )}
    </div>
  );
};

export default ProductCard;