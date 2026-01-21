import React, { useState } from 'react';
import { deleteProduct } from '../api/delete_product'; 
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart, isAdmin, onDeleted }) => {
  const [currentStock, setCurrentStock] = useState(product.stock_qty);
  const [qtyToAdd, setQtyToAdd] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const isOutOfStock = currentStock <= 0;

  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${product.ProductName || product.name}"?`)) {
      setIsUpdating(true);
      try {
        await deleteProduct(product.id || product.ProductID);
        setIsFadingOut(true);
        setTimeout(() => {
          if (onDeleted) onDeleted(product.id || product.ProductID);
        }, 500);
      } catch (err) {
        alert("שגיאה במחיקה: " + err.message);
        setIsUpdating(false);
      }
    }
  };

  const increaseQty = () => {
    if (qtyToAdd < currentStock) setQtyToAdd(prev => prev + 1);
  };

  const decreaseQty = () => {
    if (qtyToAdd > 1) setQtyToAdd(prev => prev - 1);
  };

  const handleAddToCartClick = () => {
    onAddToCart({...product, stock_qty: currentStock}, qtyToAdd);
    setQtyToAdd(1); 
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="product-info">
        <h3>{product.ProductName || product.name}</h3> 
        <p className="price">₪{product.original_price || product.price}</p>
      </div>
      
      <div className="product-actions-area">
        {/* אזור עליון: בורר כמות או הודעת אזל מהמלאי  */}
        <div className="stock-status-area" style={{ width: '100%' }}>
          {isAdmin ? (
            <div className="admin-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p className="admin-stock-label">מלאי: <strong>{currentStock}</strong></p>
              <div className="admin-stock-controls" style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="stock-btn" onClick={() => !isUpdating && setCurrentStock(s => s + 1)}>+</button>
                <button type="button" className="stock-btn" onClick={() => !isUpdating && currentStock > 0 && setCurrentStock(s => s - 1)}>-</button>
              </div>
            </div>
          ) : (
            isOutOfStock ? (
              <div className="out-of-stock-wrapper">
                <p className="out-of-stock-msg">אזל מהמלאי</p>
              </div>
            ) : (
              <div className="user-qty-selector-wrapper">
                <div className="user-qty-selector">
                  <button type="button" onClick={decreaseQty} disabled={qtyToAdd <= 1}>-</button>
                  <span className="qty-value">{qtyToAdd}</span>
                  <button type="button" onClick={increaseQty} disabled={qtyToAdd >= currentStock}>+</button>
                </div>
              </div>
            )
          )}
        </div>

        {/* אזור תחתון: כפתור פעולה (הוספה או לא זמין) [cite: 244-245] */}
        {isAdmin ? (
          <button className="delete-action-btn" onClick={handleDelete} disabled={isUpdating}>
            {isUpdating ? 'מוחק...' : '🗑️ מחק מוצר'}
          </button>
        ) : (
          <button 
            className="add-to-cart" 
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'לא זמין' : `הוסף לסל (${qtyToAdd})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;