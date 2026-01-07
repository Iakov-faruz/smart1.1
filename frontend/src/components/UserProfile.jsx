import React from 'react';
import '../styles/UserProfile.css';

const UserProfile = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="user-profile-overlay" onClick={onClose}>
            <div className="user-profile-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-profile" onClick={onClose} aria-label="Close profile">&times;</button>
                
                <div className="profile-header">
                    <div className="profile-avatar">👤</div>
                    <h2>פרופיל משתמש</h2>
                    <p className="profile-subtitle">הפרטים האישיים שלך במערכת</p>
                </div>

                <div className="profile-body">
                    <div className="info-item">
                        <label>שם משתמש:</label>
                        <span>{user.username}</span>
                    </div>

                    <div className="info-item">
                        <label>אימייל:</label>
                        <span>{user.email || 'לא הוזן'}</span>
                    </div>

                    {/* שדות חדשים שהתווספו מה-DB */}
                    <div className="info-item">
                        <label>טלפון:</label>
                        <span>{user.phone || 'לא הוזן'}</span>
                    </div>

                    <div className="info-item">
                        <label>עיר:</label>
                        <span>{user.city || 'לא הוזן'}</span>
                    </div>

                    <div className="info-item">
                        <label>כתובת מלאה:</label>
                        <span>{user.address || 'לא הוזן'}</span>
                    </div>

                    <div className="info-item loyalty">
                        <label>נקודות נאמנות:</label>
                        <span className="points-badge">⭐ {user.loyalty_points || 0}</span>
                    </div>
                </div>

                <div className="profile-footer">
                    <button className="close-btn" onClick={onClose}>סגור חלון</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;