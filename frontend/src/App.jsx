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

  // ניהול מצב משתמש
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // טעינת סל מה-LocalStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('smart_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // --- תיקון: ריקון הסל בעת שינוי משתמש (התחברות או התנתקות) ---
  const handleUserChange = (userData) => {
    setUser(userData);
    
    // כאשר המשתמש משתנה, אנו מרוקנים את הסל גם ב-State וגם ב-LocalStorage
    setCartItems([]);
    localStorage.removeItem('smart_shop_cart');
  };

  // שמירה ל-LocalStorage בכל שינוי בסל
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('smart_shop_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('smart_shop_cart');
    }
  }, [cartItems]);

  // טעינת מוצרים מהשרת
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAllCategoriesWithProducts();
        setAllData(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // הוספה לסל עם בדיקת מלאי
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
          />
          <MainContent products={filteredProducts} onAddToCart={addToCart} />
        </>
      )}
    </div>
  );
}

export default App;