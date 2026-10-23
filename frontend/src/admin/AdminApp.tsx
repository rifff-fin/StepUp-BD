import { useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router';
import {
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiMail,
  FiPackage,
  FiShoppingBag,
  FiTag,
} from 'react-icons/fi';
import { LogoMark } from '../components/layout/Logo';
import { adminApi, useAdminAuth } from './adminApi';
import { AdminLogin } from './AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CouponsPage } from './pages/CouponsPage';
import { SubscribersPage } from './pages/SubscribersPage';
import './admin.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
  { to: '/admin/subscribers', label: 'Subscribers', icon: FiMail },
];

/** The admin panel (/admin): login, then a sidebar app for the catalog and orders. */
export default function AdminApp() {
  const token = useAdminAuth((s) => s.token);
  const email = useAdminAuth((s) => s.email);

  useEffect(() => {
    document.title = 'Admin · StepUp BD';
  }, []);

  // Restore the admin's email for a token kept from earlier in this tab
  useEffect(() => {
    if (!token || email) return;
    adminApi
      .me()
      .then((me) => useAdminAuth.setState({ email: me.email }))
      .catch(() => {});
  }, [token, email]);

  if (!token) return <AdminLogin />;

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <LogoMark size={34} />
          <div>
            <b>StepUp BD</b>
            <span>Admin</span>
          </div>
        </div>
        <nav aria-label="Admin">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <FiExternalLink aria-hidden="true" /> View store
          </a>
          <button type="button" onClick={() => useAdminAuth.getState().logout()}>
            <FiLogOut aria-hidden="true" /> Log out
          </button>
          {email && <p className="admin-email">{email}</p>}
        </div>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/coupons" element={<CouponsPage />} />
          <Route path="/admin/subscribers" element={<SubscribersPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
