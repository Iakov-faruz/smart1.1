import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Checkout from './components/Checkout'; // ייבוא הקומפוננטה החדשה
import { getAllCategoriesWithProducts } from './api/get_all_categories_with_products';
import './App.css';

function App() {
  const [allData, setAllData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  
  // --- מצב חדש לניהול המעבר לצ'ק-אאוט ---
  const [isCheckout, setIsCheckout] = useState(false);

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

  const addToCart = (product) => {
    const pId = product.ProductID || product.id;
    const pName = product.ProductName || product.name;
    const pPrice = product.original_price || product.price;

    if (!pId) {
      alert("שגיאה: למוצר זה אין מזהה (ID)");
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === pId);
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

  // חישוב מחיר סופי להעברה לצ'ק-אאוט
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div>טוען את החנות...</div>;

  return (
    <div className="app-container">
      {/* תנאי: אם אנחנו בצ'ק-אאוט, הצג רק אותו. אם לא, הצג את החנות */}
      {isCheckout ? (
        <Checkout 
          cartItems={cartItems} 
          totalPrice={totalPrice} 
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
            onGoToCheckout={() => setIsCheckout(true)} // פונקציה למעבר לתשלום
          />
          <MainContent products={filteredProducts} onAddToCart={addToCart} />
        </>
      )}
    </div>
  );
}

export default App;