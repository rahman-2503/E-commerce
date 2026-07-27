import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

export default function Layout() {
  const { user, isLoading } = useAuthStore();

  if (!isLoading && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
