import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrders from './pages/TrackOrders';
import CollectionsPage from './pages/CollectionsPage';
import ShopPage from './pages/ShopPage';
import StoryPage from './pages/StoryPage';
import LookbookPage from './pages/LookbookPage';

function AppShell() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    subtotal,
    removeFromCart,
    updateQty,
  } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-orders" element={<TrackOrders />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        items={cart}
        subtotal={subtotal}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  );
}
