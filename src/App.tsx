import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HealthBanner from "./health/HealthBanner";
import JoinPinModal from "./components/JoinPinModal";
import ProtectedRoute from "./components/ProtectedRoute";

// Core pages
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Ordering & menu pages
import Menu from "./pages/Menu";
import CustomerMenu from "./pages/CustomerMenu";
import BookTable from "./pages/BookTable";
import Reserve from "./pages/Reserve";
import TakeAway from "./pages/TakeAway";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderTracking from "./pages/OrderTracking";
import ScanEntry from "./pages/ScanEntry";

// Management dashboards
import MenuManagement from "./pages/MenuManagement";
import MenuAdmin from "./pages/MenuAdmin";
import OrderManagement from "./pages/OrderManagement";
import TableManagement from "./pages/TableManagement";
import Tables from "./pages/Tables";
import StaffManagement from "./pages/StaffManagement";
import Staff from "./pages/Staff";
import ApplicationCustomization from "./pages/ApplicationCustomization";
import Branding from "./pages/Branding";
import PaymentManagement from "./pages/PaymentManagement";
import AdminPayments from "./pages/AdminPayments";  // merged
import KitchenDashboard from "./pages/KitchenDashboard";
import KDS from "./pages/KDS";

// Other content
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Contact from "./pages/Contact";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [firstPin, setFirstPin] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) {
      setToken(t);
      fetch("/api/table-session/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t }),
      }).then(async (r) => {
        if (r.status === 201) {
          const { pin } = await r.json();
          setFirstPin(pin);
        } else if (r.status === 409) {
          setShowPin(true);
        } else {
          const j = await r.json().catch(() => ({}));
          alert(`QR invalid: ${j.error ?? r.statusText}`);
        }
      });
    }
  }, []);

  async function handleJoin(pin: string) {
    if (!token) throw new Error("missing token");
    const r = await fetch("/api/table-session/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pin }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.error ?? "bad_pin");
    }
    setShowPin(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HealthBanner />

      {/* Session lock PIN banner */}
      {firstPin && (
        <div style={{ padding: 8, background: "#e7f7ee", color: "#0a6b3d" }}>
          Session locked. Share PIN with others: <b>{firstPin}</b>
        </div>
      )}

      <JoinPinModal open={showPin} onSubmit={handleJoin} onClose={() => setShowPin(false)} />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/customer-menu" element={<CustomerMenu />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/take-away" element={<TakeAway />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/scan" element={<ScanEntry />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/order-tracking" element={<OrderTracking />} />

        {/* QR routes */}
        <Route path="/qr/:tenantCode/:tableNumber" element={<ScanEntry />} />
        <Route path="/menu/:tenantCode" element={<Menu />} />
        <Route path="/cart/:cartId" element={<Cart />} />
        <Route path="/checkout/:intentId" element={<Checkout />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />

        {/* Protected dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredDashboard="REPORTS">
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredDashboard="LIVE_ORDERS">
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu-admin"
          element={
            <ProtectedRoute>
              <MenuAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute requiredDashboard="MENU">
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <Tables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/table-management"
          element={
            <ProtectedRoute requiredDashboard="TABLES">
              <TableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-management"
          element={
            <ProtectedRoute requiredDashboard="STAFF">
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application-customization"
          element={
            <ProtectedRoute requiredDashboard="CUSTOMIZATION">
              <ApplicationCustomization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branding"
          element={
            <ProtectedRoute>
              <Branding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen-dashboard"
          element={
            <ProtectedRoute requiredDashboard="KITCHEN">
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kds"
          element={
            <ProtectedRoute>
              <KDS />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;