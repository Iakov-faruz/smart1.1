import React, { useState, useEffect } from 'react';
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

  // פונקציה לרענון הנתונים מהשרת (שימוש כללי)
  const refreshData = async () => {
    try {
      const data = await getAllCategoriesWithProducts();
      setAllData(data || []);
      if (selectedCategory === 'all') {
        setFilteredProducts(data || []);
      } else {
        setFilteredProducts(data.filter(item => item.CategoryName === selectedCategory));
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // --- פונקציה חדשה: הסרת מוצר מהתצוגה מיד לאחר מחיקה לוגית ---
  const handleProductDeleted = (productId) => {
    const updateList = (prevList) => 
      prevList.filter(item => (item.ProductID || item.id) !== productId);

    setAllData(prev => updateList(prev));
    setFilteredProducts(prev => updateList(prev));
  };

  const handleUserChange = (userData) => {
    setUser(userData);
    setCartItems([]);
    localStorage.removeItem('smart_shop_cart');
    if (!userData) localStorage.removeItem('user');
  };

  const handleAdminChange = (adminData) => {
    setAdmin(adminData);
    if (!adminData) {
      localStorage.removeItem('admin_user');
    } else {
      localStorage.setItem('admin_user', JSON.stringify(adminData));
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('smart_shop_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('smart_shop_cart');
    }
  }, [cartItems]);

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

  const addToCart = (product) => {
    const pId = product.ProductID || product.id;
    const pName = product.ProductName || product.name;
    const pPrice = product.original_price || product.price;
    const stockAvailable = product.stock_qty;
    if (!pId) return;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === pId);
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (currentQty + 1 > stockAvailable) {
        alert(`לא ניתן להוסיף יותר מ-${stockAvailable} יחידות ממוצר זה`);
        return prevItems;
      }
      if (existingItem) {
        return prevItems.map(item =>
          item.id === pId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { id: pId, name: pName, price: pPrice, quantity: 1 }];
    });
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'all') {
      setFilteredProducts(allData);
    } else {
      setFilteredProducts(allData.filter(item => item.CategoryName === categoryName));
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="loading">טוען חנות...</div>;

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
            onProductDeleted={handleProductDeleted} // מעבירים את הפונקציה ל-MainContent
          />
        </>
      )}
    </div>
  );
}

export default App;