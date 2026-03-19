import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from "@/contexts/WishlistContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import {AdminLayout} from "@/components/layout/AdminLayout";

import Dashboard from "./pages/admin/Index";
import OrdersPage from "./pages/admin/OrdersPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ProductsPage from "./pages/admin/ProductsPage";
import AddProductPage from "./pages/admin/AddProductPage";
import ProductDetailPage from "./pages/admin/ProductDetailPage";
import CustomersPage from "./pages/admin/CustomersPage";
import StaffsPage from "./pages/admin/StaffsPage";
import SettingsPage from "./pages/admin/SettingsPage";




const queryClient = new QueryClient();

// Main App component with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
     <AuthProvider>
    <CartProvider>
       <WishlistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
  {/* PUBLIC ROUTES */}
  <Route path="/" element={<Index />} />
  <Route path="/products" element={<Products />} />
  <Route path="/products/:id" element={<ProductDetails />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/wishlist" element={<Wishlist />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/categories" element={<Categories />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

  {/* ================= ADMIN ROUTES ================= */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="payments" element={<PaymentsPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="products/add" element={<AddProductPage />} />
    <Route path="products/:id" element={<ProductDetailPage />} />
    <Route path="customers" element={<CustomersPage />} />
    <Route path="staffs" element={<StaffsPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
        </BrowserRouter>
      </TooltipProvider>
      </WishlistProvider>
    </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
