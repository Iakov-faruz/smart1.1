import React from 'react';
// ייבוא קובץ ה-CSS (וודא שהנתיב תואם לתיקיית styles שלך)
import '../styles/CategoryButtons.css'; 

const CategoryButtons = ({ categories = [], onSelectCategory, selectedCategory }) => {
  // חילוץ שמות ייחודיים עם הגנה (Optional Chaining) כדי למנוע שגיאות undefined 
  const uniqueNames = [...new Set(categories?.map(c => c.CategoryName) || [])];

  return (
    /* ה-class "category-nav" הוא המפתח ליישור ב-CSS [cite: 13] */
    <nav className="category-nav">
      <button 
        key="all"
        className={selectedCategory === 'all' ? 'active' : ''} 
        onClick={() => onSelectCategory('all')}
      >
        הכל
      </button>
      {uniqueNames.map((name) => (
        <button 
          key={name} 
          className={selectedCategory === name ? 'active' : ''}
          onClick={() => onSelectCategory(name)}
        >
          {name}
        </button>
      ))}
    </nav>
  );
};

export default CategoryButtons;