import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { CartDrawer } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { Auth } from './components/Auth';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            onAuthClick={() => setShowAuth(true)}
            onCartClick={() => setShowCart(true)}
            onSearch={setSearchQuery}
          />

          <ProductList
            searchQuery={searchQuery}
            onAuthRequired={() => setShowAuth(true)}
          />

          <CartDrawer
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            onCheckout={handleCheckout}
          />

          <Checkout
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
          />

          {showAuth && <Auth onClose={() => setShowAuth(false)} />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
