import React from 'react';
import '../styles/StatusPopup.css'; // צור קובץ עיצוב מתאים

const StatusPopup = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="status-overlay">
      <div className={`status-modal ${type}`}>
        <div className="status-icon">
          {type === 'success' ? '✅' : '❌'}
        </div>
        <h3>{type === 'success' ? 'מעולה!' : 'אופס...'}</h3>
        <p>{message}</p>
        <button className="status-btn" onClick={onClose}>סגור</button>
      </div>
    </div>
  );
};

export default StatusPopup;