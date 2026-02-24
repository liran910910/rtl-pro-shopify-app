import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import heTranslations from "@shopify/polaris/locales/en.json";

import AppFrame from "./components/AppFrame.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ExitIframe from "./pages/ExitIframe.jsx";
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
        <Routes>
          <Route path="/exitiframe" element={<ExitIframe />} />
          <Route path="/" element={<AppFrame><Dashboard /></AppFrame>} />
          <Route path="/rtl" element={<AppFrame><RTLSettings /></AppFrame>} />
          <Route path="/translations" element={<AppFrame><TranslationSettings /></AppFrame>} />
          <Route path="/notifications" element={<AppFrame><NotificationSettings /></AppFrame>} />
          <Route path="/fonts" element={<AppFrame><FontSettings /></AppFrame>} />
          <Route path="/accessibility" element={<AppFrame><AccessibilitySettings /></AppFrame>} />
          <Route path="/custom-css" element={<AppFrame><CustomCSSEditor /></AppFrame>} />
          <Route path="/payment-icons" element={<AppFrame><PaymentIcons /></AppFrame>} />
          <Route path="/postcode" element={<AppFrame><PostcodeSettings /></AppFrame>} />
          <Route path="/billing" element={<AppFrame><BillingPage /></AppFrame>} />
          <Route path="*" element={<AppFrame><Dashboard /></AppFrame>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
