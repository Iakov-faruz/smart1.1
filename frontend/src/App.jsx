import React, { useState, useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import MainContent from './components/MainContent';
import Checkout from './components/Checkout';
import { getAllCategoriesWithProducts } from './api/get_all_categories_with_products';
import './App.css';

function App() {
  const [allData, setAllData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isCheckout, setIsCheckout] = useState(false);

  // --- טעינת מצב ראשונית ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('admin_user');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('smart_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // --- שמירת סל אוטומטית ---
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('smart_shop_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('smart_shop_cart');
    }
  }, [cartItems]);

  // --- שליפת נתונים מהשרת ---
  const refreshData = async () => {
    try {
      const data = await getAllCategoriesWithProducts();
      const products = data || [];
      setAllData(products);
      
      // עדכון הרשימה המסוננת לפי הקטגוריה הנוכחית
      if (selectedCategory === 'all') {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(products.filter(item => item.CategoryName === selectedCategory));
      }
    } catch (err) {
      toast.error("שגיאה בחיבור לשרת", { toastId: "api-error" });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await refreshData();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- ניהול משתמשים ---
  const handleUserChange = (userData) => {
    setUser(userData);
    setCartItems([]); // איפוס סל במעבר משתמש
    
    toast.dismiss();
    if (!userData) {
      localStorage.removeItem('user');
      toast.info("התנתקת בהצלחה", { toastId: "logout" });
    } else {
      // הערה: ה-localStorage.setItem מתבצע ב-SignIn.jsx
      toast.success(`ברוך הבא, ${userData.username}!`, { icon: "👋", toastId: "login" });
    }
  };

  const handleAdminChange = (adminData) => {
    setAdmin(adminData);
    toast.dismiss();
    if (!adminData) {
      localStorage.removeItem('admin_user');
      toast.info("מצב ניהול כבוי", { toastId: "admin-off" });
    } else {
      toast.warning("נכנסת למצב ניהול", { icon: "🛠️", toastId: "admin-on" });
    }
  };

  // --- לוגיקת סל קניות ---
  const addToCart = (product, quantity = 1) => {
    const pId = product.ProductID || product.id;
    const pName = product.ProductName || product.name;
    const stockAvailable = product.stock_qty;

    if (!pId) return;

    toast.dismiss(); // מניעת ערימת הודעות

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === pId);
      const currentInCart = existingItem ? existingItem.quantity : 0;

      if (currentInCart + quantity > stockAvailable) {
        toast.error(`המלאי מוגבל: נותרו ${stockAvailable} יחידות`, {
          icon: "⚠️",
          toastId: "stock-limit"
        });
        return prevItems;
      }

      toast.success(`${pName} נוסף לסל`, {
        icon: "🛒",
        toastId: "cart-success"
      });

      if (existingItem) {
        return prevItems.map(item =>
          item.id === pId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [...prevItems, {
        id: pId,
        name: pName,
        price: product.original_price || product.price,
        quantity
      }];
    });
  };

  // --- פעולות נוספות ---
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'all') {
      setFilteredProducts(allData);
    } else {
      setFilteredProducts(allData.filter(item => item.CategoryName === categoryName));
    }
  };

  const handleProductDeleted = (productId) => {
    const filterFn = (list) => list.filter(item => (item.ProductID || item.id) !== productId);
    setAllData(prev => filterFn(prev));
    setFilteredProducts(prev => filterFn(prev));

    toast.dismiss();
    toast.info("המוצר הוסר בהצלחה", { icon: "🗑️", toastId: "product-deleted" });
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>טוען את החנות...</p>
    </div>
  );

  return (
    <div className="app-container">
      {isCheckout ? (
        <Checkout 
          cartItems={cartItems} 
          totalPrice={totalPrice} 
          user={user} 
          onBack={() => setIsCheckout(false)} 
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
            onUserChange={handleUserChange}
            admin={admin}
            onAdminChange={handleAdminChange}
            onRefresh={refreshData}
          />
          <MainContent 
            products={filteredProducts} 
            onAddToCart={addToCart} 
            admin={admin} 
            onProductDeleted={handleProductDeleted} 
          />
        </>
      )}

      <ToastContainer
        position="top-center"
        autoClose={1500}
        limit={1}
        clearWaitingQueue={true}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        theme="light"
        transition={Slide}
      />
    </div>
  );
}

export default App;