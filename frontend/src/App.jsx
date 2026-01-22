// import React, { useState, useEffect } from 'react';
// import { ToastContainer, toast, Slide } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import Header from './components/Header';
// import MainContent from './components/MainContent';
// import Checkout from './components/Checkout';
// import ExpiryDiscounts from './components/ExpiryDiscounts';
// import EditProductModal from './components/EditProductModal';
// import { getAllCategoriesWithProducts } from './api/get_all_categories_with_products';
// import './App.css';

// function App() {
//   const [allData, setAllData] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [isCheckout, setIsCheckout] = useState(false);

//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [productToEdit, setProductToEdit] = useState(null);

//   const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
//   const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem('admin_user')) || null);
//   const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('smart_shop_cart')) || []);

//   useEffect(() => {
//     localStorage.setItem('smart_shop_cart', JSON.stringify(cartItems));
//   }, [cartItems]);

//   const applyFiltering = (categoryName, productsList) => {
//     if (!productsList) return;
//     let result = [];
//     if (categoryName === 'all') {
//       result = productsList;
//     } else if (categoryName === 'short-expiry') {
//       result = productsList.filter(p => Number(p.discountPercent) > 0);
//     } else {
//       result = productsList.filter(p => p.CategoryName === categoryName && Number(p.discountPercent) === 0);
//     }
//     setFilteredProducts(result);
//   };

//   const refreshData = async () => {
//     try {
//       const data = await getAllCategoriesWithProducts();
//       setAllData(data || []);
//       applyFiltering(selectedCategory, data || []);
//     } catch (err) {
//       toast.error("שגיאה בחיבור לשרת");
//     }
//   };

//   useEffect(() => {
//     refreshData().finally(() => setLoading(false));
//   }, []);

//   const handleCategorySelect = (categoryName) => {
//     setSelectedCategory(categoryName);
//     applyFiltering(categoryName, allData);
//   };

//   // חזרה לפונקציה המקורית שלך בדיוק
//   const addToCart = (product, quantity = 1) => {
//     const pId = product.ProductID || product.id;
//     const currentPrice = product.finalPrice || product.original_price;
//     setCartItems(prev => {
//       const existing = prev.find(item => item.id === pId);
//       if (existing) return prev.map(item => item.id === pId ? { ...item, quantity: item.quantity + quantity } : item);
//       return [...prev, { id: pId, name: product.ProductName || product.name, price: currentPrice, quantity }];
//     });
//     toast.success("נוסף לסל");
//   };

//   if (loading) return <div>טוען...</div>;

//   return (
//     <div className="app-container">
//       {isCheckout ? (
//         <Checkout 
//           cartItems={cartItems} 
//           totalPrice={cartItems.reduce((s, i) => s + (i.price * i.quantity), 0)} 
//           user={user} 
//           onBack={() => setIsCheckout(false)} 
//         />
//       ) : (
//         <>
//           <Header 
//             categories={allData} 
//             onSelectCategory={handleCategorySelect} 
//             selectedCategory={selectedCategory} 
//             cartItems={cartItems} 
//             setCartItems={setCartItems} 
//             onGoToCheckout={() => setIsCheckout(true)} 
//             user={user} 
//             onUserChange={setUser} 
//             admin={admin} 
//             onAdminChange={setAdmin} 
//             onRefresh={refreshData} 
//           />
//           <ExpiryDiscounts products={allData} /> 
          
//           <MainContent 
//             products={filteredProducts} 
//             onAddToCart={addToCart} 
//             admin={admin} 
//             onProductDeleted={refreshData} 
//             onEditProduct={(p) => { setProductToEdit(p); setIsEditModalOpen(true); }}
//             cartItems={cartItems} // זה הדבר היחיד שהוספנו כדי שהמספר יופיע
//           />
//         </>
//       )}

//       {admin && (
//         <EditProductModal 
//           isOpen={isEditModalOpen} 
//           product={productToEdit} 
//           onClose={() => setIsEditModalOpen(false)} 
//           onRefresh={refreshData} 
//         />
//       )}

//       <ToastContainer position="top-center" autoClose={1500} transition={Slide} />
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import MainContent from './components/MainContent';
import Checkout from './components/Checkout';
import ExpiryDiscounts from './components/ExpiryDiscounts';
import EditProductModal from './components/EditProductModal';
import { getAllCategoriesWithProducts } from './api/get_all_categories_with_products';
import './App.css';

function App() {
  const [allData, setAllData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isCheckout, setIsCheckout] = useState(false);

  // --- מצבים לניהול מודאל עריכת מוצר ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // טעינת משתמשים ומנהלים מה-LocalStorage
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem('admin_user')) || null);
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('smart_shop_cart')) || []);

  // שמירת הסל בכל שינוי
  useEffect(() => {
    localStorage.setItem('smart_shop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const applyFiltering = (categoryName, productsList) => {
    if (!productsList) return;
    let result = [];
    if (categoryName === 'all') {
      result = productsList;
    } else if (categoryName === 'short-expiry') {
      result = productsList.filter(p => Number(p.discountPercent) > 0);
    } else {
      // מוצר בהנחה מופיע רק ב"תוקף קצר", מוצר רגיל מופיע בקטגוריה שלו
      result = productsList.filter(p => p.CategoryName === categoryName && Number(p.discountPercent) === 0);
    }
    setFilteredProducts(result);
  };

  const refreshData = async () => {
    try {
      const data = await getAllCategoriesWithProducts();
      setAllData(data || []);
      applyFiltering(selectedCategory, data || []);
    } catch (err) {
      toast.error("שגיאה בחיבור לשרת");
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    applyFiltering(categoryName, allData);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const addToCart = (product, quantity = 1) => {
    const pId = product.ProductID || product.id;
    const currentPrice = product.finalPrice || product.original_price;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === pId);
      if (existing) {
        return prev.map(item => item.id === pId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { id: pId, name: product.ProductName || product.name, price: currentPrice, quantity }];
    });
    toast.success("נוסף לסל");
  };

  // פונקציה לסיום הזמנה וחזרה נקייה למסך הראשי
  const handleFinishOrder = () => {
    setCartItems([]);
    localStorage.removeItem('smart_shop_cart');
    setIsCheckout(false);
    window.history.pushState({}, '', '/');
    toast.success("ההזמנה בוצעה בהצלחה!");
  };

  if (loading) return <div className="loading-screen">טוען נתונים...</div>;

  return (
    <div className="app-container">
      {isCheckout ? (
        <Checkout 
          cartItems={cartItems} 
          totalPrice={cartItems.reduce((s, i) => s + (i.price * i.quantity), 0)} 
          user={user} 
          onBack={() => setIsCheckout(false)}
          onSuccess={handleFinishOrder} 
        />
      ) : (
        <>
          <Header 
            categories={allData} 
            onSelectCategory={handleCategorySelect} 
            selectedCategory={selectedCategory} 
            cartItems={cartItems} 
            setCartItems={setCartItems} 
            onGoToCheckout={() => setIsCheckout(true)} 
            user={user} 
            onUserChange={setUser} 
            admin={admin} 
            onAdminChange={setAdmin} 
            onRefresh={refreshData} 
          />

          {/* הצגת שורת המבצעים רק אם המשתמש הוא לקוח רגיל */}
          {!admin && <ExpiryDiscounts products={allData} />} 
          
          <MainContent 
            products={filteredProducts} 
            onAddToCart={addToCart} 
            cartItems={cartItems} // העברת הסל לצורך הצגת כמות על הכרטיס
            admin={admin} 
            onProductDeleted={refreshData} 
            onEditProduct={handleOpenEdit} 
          />
        </>
      )}

      {/* מודאל עריכה למנהל */}
      {admin && (
        <EditProductModal 
          isOpen={isEditModalOpen} 
          product={productToEdit} 
          onClose={() => setIsEditModalOpen(false)} 
          onRefresh={refreshData} 
        />
      )}

      <ToastContainer position="top-center" autoClose={1500} transition={Slide} />
    </div>
  );
}

export default App;