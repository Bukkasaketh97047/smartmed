import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import SymptomChecker from "./pages/SymptomChecker";
import HealthCompanion from "./pages/HealthCompanion";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import Dashboard from "./pages/Dashboard";
import MedicineReminders from "./pages/MedicineReminders";
import AugustCompanion from "./pages/AugustCompanion";
import MedicalRecords from "./pages/MedicalRecords";
import AdminDashboard from "./pages/AdminDashboard";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import DrugInteraction from "./pages/DrugInteraction";
import EmergencyMode from "./pages/EmergencyMode";
import PharmacyFinder from "./pages/PharmacyFinder";
import RiskAssessment from "./pages/RiskAssessment";
import AdherenceAnalytics from "./pages/AdherenceAnalytics";
import PriceCompare from "./pages/PriceCompare";
import Subscriptions from "./pages/Subscriptions";
import Tracking from "./pages/Tracking";
import Wallet from "./pages/Wallet";
import Notifications from "./pages/Notifications";
import AIPharmacyScanner from "./pages/AIPharmacyScanner";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";
import { useLocation } from "react-router-dom";

function RouteLogger() {
  const location = useLocation();
  console.log("Current Pathname:", location.pathname);
  console.log("Current Search:", location.search);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <RouteLogger />
            <Routes>
              {/* Social Login Redirect Handler (Must be high priority) */}
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

              <Route path="/" element={<SignIn />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/symptom-checker"
                element={
                  <ProtectedRoute>
                    <SymptomChecker />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/august"
                element={
                  <ProtectedRoute>
                    <AugustCompanion />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reminders"
                element={
                  <ProtectedRoute>
                    <MedicineReminders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/records"
                element={
                  <ProtectedRoute>
                    <MedicalRecords />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interaction-checker"
                element={
                  <ProtectedRoute>
                    <DrugInteraction />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/emergency"
                element={
                  <ProtectedRoute>
                    <EmergencyMode />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/finder"
                element={
                  <ProtectedRoute>
                    <PharmacyFinder />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/disease-risk"
                element={
                  <ProtectedRoute>
                    <RiskAssessment />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/adherence"
                element={
                  <ProtectedRoute>
                    <AdherenceAnalytics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/upload-prescription"
                element={
                  <ProtectedRoute>
                    <PrescriptionUpload />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <PriceCompare />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tracking"
                element={
                  <ProtectedRoute>
                    <Tracking />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-scanner"
                element={
                  <ProtectedRoute>
                    <AIPharmacyScanner />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all for debugging or 404 */}
              <Route path="*" element={<div className="p-10 text-center"><h2>404 - Path: {window.location.pathname}</h2></div>} />
            </Routes>
            {/* August AI Integration Floating Button */}
            <a
              href="https://wa.me/918738030604"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-float"
              title="Chat with August AI on WhatsApp"
            >
              <div className="whatsapp-icon">💬</div>
              <div className="whatsapp-badge">August</div>
            </a>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
