import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

// Layouts
import PublicLayout from "@/components/layout/Publiclayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import MyOrdersPage from "./pages/Myorderspage";
import Trackorderpage from "./pages/Trackorderpage";
import SearchPage from "./pages/Searchpage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/admin/Index";
import OrdersPage from "./pages/admin/OrdersPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ProductsPage from "./pages/admin/ProductsPage";
import AddProductPage from "./pages/admin/AddProductPage";
import ProductDetailPage from "./pages/admin/ProductDetailPage";
import CustomersPage from "./pages/admin/CustomersPage";
import StaffsPage from "./pages/admin/StaffsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AdminManagePage from "./pages/admin/AdminManagePage";


const queryClient = new QueryClient();

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

                {/* PUBLIC — Header + TrustBadges + Footer injected by PublicLayout */}
                <Route element={<PublicLayout />}>
                  <Route path="/"                element={<Index />} />
                  <Route path="/products"        element={<Products />} />
                  <Route path="/products/:slug"    element={<ProductDetails />} />
                  <Route path="/cart"            element={<Cart />} />
                  <Route path="/checkout"        element={
                    <ProtectedRoute>
                      <Checkout />
                      </ProtectedRoute>
                  } />
                  <Route path="/orders"          element={<MyOrdersPage />} />
                  <Route path="/track-order/:id" element={<Trackorderpage />} />
                  <Route path="/wishlist"        element={<Wishlist />} />
                  <Route path="/categories"      element={<Categories />} />
                  <Route path="/about"           element={<About />} />
                  <Route path="/contact"         element={<Contact />} />
                </Route>

                 <Route path="/search" element={<SearchPage />} />
                 

                {/* AUTH — standalone, no shared layout */}
                <Route path="/signup"           element={<SignUpPage />} />
                <Route path="/login"            element={<LoginPage />} />
                <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

                {/* ADMIN */}

      {/* 🔒 Admin-only routes — all nested under AdminRoute guard */}
      <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index                  element={<Dashboard />} />
                  <Route path="orders"          element={<OrdersPage />} />
                  <Route path="payments"        element={<PaymentsPage />} />
                  <Route path="products"        element={<ProductsPage />} />
                  <Route path="products/add"    element={<AddProductPage />} />
                  <Route path="products/:slug"    element={<ProductDetailPage />} />
                  <Route path="customers"       element={<CustomersPage />} />
                  <Route path="manage-admins" element={<AdminManagePage />} />
                  <Route path="staffs"          element={<StaffsPage />} />
                  <Route path="settings"        element={<SettingsPage />} />
                  
                </Route>
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