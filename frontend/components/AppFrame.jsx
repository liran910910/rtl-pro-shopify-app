import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Frame, Navigation } from "@shopify/polaris";
import {
  HomeIcon,
  TextAlignRightIcon,
  LanguageTranslateIcon,
  NotificationIcon,
  TextFontIcon,
  PersonIcon,
  CodeIcon,
  CreditCardIcon,
  LocationIcon,
  BillIcon,
} from "@shopify/polaris-icons";

export default function AppFrame({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        title="RTL Pro"
        items={[
          {
            label: "דשבורד",
            icon: HomeIcon,
            onClick: () => navigate("/"),
            selected: location.pathname === "/",
          },
          {
            label: "הגדרות RTL",
            icon: TextAlignRightIcon,
            onClick: () => navigate("/rtl"),
            selected: location.pathname === "/rtl",
          },
          {
            label: "תרגומים",
            icon: LanguageTranslateIcon,
            onClick: () => navigate("/translations"),
            selected: location.pathname === "/translations",
          },
          {
            label: "התראות",
            icon: NotificationIcon,
            onClick: () => navigate("/notifications"),
            selected: location.pathname === "/notifications",
          },
          {
            label: "פונטים",
            icon: TextFontIcon,
            onClick: () => navigate("/fonts"),
            selected: location.pathname === "/fonts",
          },
          {
            label: "נגישות",
            icon: PersonIcon,
            onClick: () => navigate("/accessibility"),
            selected: location.pathname === "/accessibility",
            badge: "Pro",
          },
          {
            label: "CSS מותאם",
            icon: CodeIcon,
            onClick: () => navigate("/custom-css"),
            selected: location.pathname === "/custom-css",
            badge: "Premium",
          },
          {
            label: "אייקוני תשלום",
            icon: CreditCardIcon,
            onClick: () => navigate("/payment-icons"),
            selected: location.pathname === "/payment-icons",
          },
          {
            label: "זיהוי מיקוד",
            icon: LocationIcon,
            onClick: () => navigate("/postcode"),
            selected: location.pathname === "/postcode",
            badge: "Premium",
          },
        ]}
      />
      <Navigation.Section
        title="חשבון"
        items={[
          {
            label: "מנוי ותשלום",
            icon: BillIcon,
            onClick: () => navigate("/billing"),
            selected: location.pathname === "/billing",
          },
        ]}
      />
    </Navigation>
  );

  return <Frame navigation={navigationMarkup}>{children}</Frame>;
}
