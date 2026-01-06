import React from 'react';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <div>
          <h4>{item.name}</h4>
          <p>₪{item.price}</p>
        </div>
      </div>
      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button onClick={() => onDecrease(item.id)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => onIncrease(item.id)}>+</button>
        </div>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>🗑️</button>
      </div>
    </div>
  );
};

export default CartItem;