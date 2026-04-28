import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { NotificationProvider } from "@/contexts/Notificationcontext";

// Layouts
import PublicLayout from "@/components/layout/Publiclayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

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
import ResetPasswordPage from "./pages/ResetPasswordPage";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import MyOrdersPage from "./pages/Myorderspage";
import Trackorderpage from "./pages/Trackorderpage";
import SearchPage from "./pages/Searchpage";
import NotFound from "./pages/NotFound";

// ✅ NEW USER PAGES
import NotificationsPage from "@/pages/Notificationspage";
import UserSettingsPage from "@/pages/Settingspage";
import HelpCenterPage from "@/pages/Helpcenterpage";

// Admin pages
import Dashboard from "./pages/admin/Index";
import OrdersPage from "./pages/admin/OrdersPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ProductsPage from "./pages/admin/ProductsPage";
import AddProductPage from "./pages/admin/AddProductPage";
import ProductDetailPage from "./pages/admin/ProductDetailPage";
import CustomersPage from "./pages/admin/CustomersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AdminManagePage from "./pages/admin/AdminManagePage";
import StaffListPage from "./pages/admin/StaffListPage";
import StaffDetailsPage from "./pages/admin/StaffsDetailsPage";
import AddStaffPage from "./pages/admin/AddStaffPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <PermissionProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />

                <BrowserRouter>
                  <ScrollToTop />

                  <Routes>

                    {/* ================= PUBLIC ROUTES ================= */}
                    <Route element={<PublicLayout />}>

                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:slug" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />

                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="/orders" element={<MyOrdersPage />} />
                      <Route path="/track-order/:id" element={<Trackorderpage />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />

                      {/* ✅ NEW PAGES */}
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<UserSettingsPage />} />
                      <Route path="/help" element={<HelpCenterPage />} />

                    </Route>

                    {/* SEARCH */}
                    <Route path="/search" element={<SearchPage />} />

                    {/* ================= AUTH ================= */}
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                    {/* ================= ADMIN ================= */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="payments" element={<PaymentsPage />} />
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="products/add" element={<AddProductPage />} />
                        <Route path="products/:slug" element={<ProductDetailPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="manage-admins" element={<AdminManagePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="staffs" element={<StaffListPage />} />
                        <Route path="staffs/:id" element={<StaffDetailsPage />} />
                        <Route path="staffs/add" element={<AddStaffPage />} />
                        <Route path="activity" element={<AuditLogPage />} />
                      </Route>
                    </Route>

                    {/* ACCEPT INVITE */}
                    <Route
                      path="/accept-invite/:token"
                      element={<AcceptInvitePage />}
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />

                  </Routes>
                </BrowserRouter>

              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </PermissionProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;