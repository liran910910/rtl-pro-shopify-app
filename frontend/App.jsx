import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import heTranslations from "@shopify/polaris/locales/en.json";

import AppFrame from "./components/AppFrame.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RTLSettings from "./pages/RTLSettings.jsx";
import TranslationSettings from "./pages/TranslationSettings.jsx";
import NotificationSettings from "./pages/NotificationSettings.jsx";
import FontSettings from "./pages/FontSettings.jsx";
import AccessibilitySettings from "./pages/AccessibilitySettings.jsx";
import CustomCSSEditor from "./pages/CustomCSSEditor.jsx";
import PaymentIcons from "./pages/PaymentIcons.jsx";
import PostcodeSettings from "./pages/PostcodeSettings.jsx";
import BillingPage from "./pages/BillingPage.jsx";

function App() {
  return (
    <AppProvider i18n={heTranslations}>
      <BrowserRouter>
        <AppFrame>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rtl" element={<RTLSettings />} />
            <Route path="/translations" element={<TranslationSettings />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/fonts" element={<FontSettings />} />
            <Route path="/accessibility" element={<AccessibilitySettings />} />
            <Route path="/custom-css" element={<CustomCSSEditor />} />
            <Route path="/payment-icons" element={<PaymentIcons />} />
            <Route path="/postcode" element={<PostcodeSettings />} />
            <Route path="/billing" element={<BillingPage />} />
          </Routes>
        </AppFrame>
      </BrowserRouter>
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
