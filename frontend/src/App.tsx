import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SkipLink, WhatsAppButton } from './components/layout/Chrome';
import { FinCredit } from './components/layout/FinCredit';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { QuickView } from './components/product/QuickView';
import { Checkout } from './components/checkout/Checkout';
import { Toasts } from './components/ui/Toasts';
import { HomePage } from './pages/HomePage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useRevealObserver } from './hooks/useReveal';
import { initSmoothScroll, setScrollLocked } from './lib/lenis';
import { startReveal } from './lib/reveal';
import { selectOverlayOpen, useUi } from './store/uiStore';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export function App() {
  const overlayOpen = useUi(selectOverlayOpen);
  const { pathname } = useLocation();
  useRevealObserver();

  useEffect(() => initSmoothScroll(), []);
  useEffect(() => startReveal(), []);

  // Lock page scroll behind drawers and dialogs
  useEffect(() => {
    document.body.classList.toggle('locked', overlayOpen);
    setScrollLocked(overlayOpen);
  }, [overlayOpen]);

  // Close menus and panels when the route changes
  useEffect(() => {
    useUi.getState().closePanel();
  }, [pathname]);

  // The admin panel is its own app (own chunk, no store header/footer)
  if (pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="admin-boot" />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />

      <CartDrawer />
      <WishlistDrawer />
      <QuickView />
      <Checkout />
      <Toasts />
      <WhatsAppButton />
      <FinCredit />
    </>
  );
}
