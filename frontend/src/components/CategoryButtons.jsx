// import React from 'react';
// // ייבוא קובץ ה-CSS (וודא שהנתיב תואם לתיקיית styles שלך)
// import '../styles/CategoryButtons.css'; 

// const CategoryButtons = ({ categories = [], onSelectCategory, selectedCategory }) => {
//   // חילוץ שמות ייחודיים עם הגנה (Optional Chaining) כדי למנוע שגיאות undefined 
//   const uniqueNames = [...new Set(categories?.map(c => c.CategoryName) || [])];

//   return (
//     /* ה-class "category-nav" הוא המפתח ליישור ב-CSS [cite: 13] */
//     <nav className="category-nav">
//       <button 
//         key="all"
//         className={selectedCategory === 'all' ? 'active' : ''} 
//         onClick={() => onSelectCategory('all')}
//       >
//         הכל
//       </button>
//       {uniqueNames.map((name) => (
//         <button 
//           key={name} 
//           className={selectedCategory === name ? 'active' : ''}
//           onClick={() => onSelectCategory(name)}
//         >
//           {name}
//         </button>
//       ))}
//     </nav>
//   );
// };

// export default CategoryButtons;
import React from 'react';
import '../styles/CategoryButtons.css';

const CategoryButtons = ({ categories = [], onSelectCategory, selectedCategory }) => {
  // חילוץ שמות ייחודיים
  const uniqueNames = [...new Set(categories?.map(c => c.CategoryName) || [])];

  return (
    <nav className="category-nav">


      {/* כפתור מבצעי תוקף קצר - נוסף כאן כדי שיהיה חלק מהשורה */}
      <button
        key="short-expiry"
        className={`expiry-btn-nav ${selectedCategory === 'short-expiry' ? 'active' : ''}`}
        onClick={() => onSelectCategory('short-expiry')}
      >
        ✨ תוקף קצר
      </button>
      {/* כפתור "הכל" המסורתי */}
      <button
        key="all"
        className={selectedCategory === 'all' ? 'active' : ''}
        onClick={() => onSelectCategory('all')}
      >
        הכל
      </button>
      {/* שאר הקטגוריות מהדאטה-בייס */}
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