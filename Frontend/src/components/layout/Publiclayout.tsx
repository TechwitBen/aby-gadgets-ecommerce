import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";

/**
 * PublicLayout
 * Wraps every public-facing page with the shared Header, TrustBadges, and Footer.
 * Usage in your router:
 *
 *   <Route element={<PublicLayout />}>
 *     <Route path="/"        element={<Home />} />
 *     <Route path="/products" element={<Products />} />
 *     <Route path="/categories" element={<Categories />} />
 *     ...etc
 *   </Route>
 *
 * Pages that use PublicLayout should NOT import Header/TrustBadges/Footer themselves.
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky top header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <Header />
      </div>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Shared bottom sections */}
      <TrustBadges />
      <Footer />
    </div>
  );
};

export default PublicLayout;