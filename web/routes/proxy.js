// RTL Pro - App Proxy Routes (public, served to storefront)
import express from "express";
const { Router } = express;
import { prisma } from "../shopify.js";
import hebrewTranslations from "../translations/hebrew.json" assert { type: "json" };

const router = Router();

// Public endpoint: Get RTL settings for a shop (called by theme extension)
router.get("/settings/:shop", async (req, res) => {
  try {
    const { shop } = req.params;

    // CORS for storefront
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Cache-Control", "public, max-age=300"); // 5 min cache

    const settings = await prisma.storeSettings.findUnique({
      where: { shop },
    });

    if (!settings || !settings.isActive) {
      return res.json({ active: false });
    }

    const customTranslations = await prisma.customTranslation.findMany({
      where: { shop, isActive: true },
    });

    // Flatten all translations into a single key-value map
    const flatTranslations = {};
    Object.values(hebrewTranslations).forEach((category) => {
      Object.entries(category).forEach(([key, value]) => {
        flatTranslations[key] = value;
      });
    });

    // Override with custom translations
    customTranslations.forEach((ct) => {
      flatTranslations[ct.originalText] = ct.translatedText;
    });

    res.json({
      active: true,
      rtl: settings.rtlEnabled,
      translate: settings.translationEnabled,
      translateButtons: settings.translateButtons,
      translateNav: settings.translateNavigation,
      translateCart: settings.translateCart,
      translateSearch: settings.translateSearch,
      translateFooter: settings.translateFooter,
      translateFilters: settings.translateFilters,
      translateDates: settings.translateDates,
      font: settings.fontEnabled
        ? {
            family: settings.fontFamily,
            url: settings.fontUrl,
            size: settings.fontSize,
          }
        : null,
      paymentIcons: settings.paymentIconsEnabled
        ? {
            icons: JSON.parse(settings.paymentIcons || "[]"),
            position: settings.paymentIconsPosition,
          }
        : null,
      accessibility: settings.accessibilityEnabled
        ? {
            widget: settings.accessibilityWidget,
            statement: settings.accessibilityStatement,
            statementContent: settings.accessibilityStatementContent,
          }
        : null,
      customCss: settings.customCssEnabled ? settings.customCss : null,
      postcodeDetection: settings.postcodeDetection,
      buyNowText: settings.buyNowText,
      addToCartText: settings.addToCartText,
      translations: flatTranslations,
    });
  } catch (error) {
    console.error("Proxy settings error:", error);
    res.status(500).json({ active: false, error: "Server error" });
  }
});

// Postcode lookup (public)
router.get("/postcode/:code", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const { code } = req.params;

  const postcodeMap = {
    "61": "תל אביב-יפו", "62": "תל אביב-יפו", "63": "תל אביב-יפו",
    "64": "תל אביב-יפו", "65": "תל אביב-יפו", "66": "תל אביב-יפו",
    "91": "ירושלים", "92": "ירושלים", "93": "ירושלים",
    "94": "ירושלים", "95": "ירושלים",
    "31": "חיפה", "32": "חיפה", "33": "חיפה",
    "84": "באר שבע", "85": "באר שבע",
    "42": "נתניה", "75": "ראשון לציון", "49": "פתח תקווה",
    "77": "אשדוד", "46": "הרצליה", "52": "רמת גן",
    "58": "חולון", "51": "בני ברק", "59": "בת ים",
    "76": "רחובות", "78": "אשקלון", "44": "כפר סבא",
    "43": "רעננה", "71": "מודיעין", "88": "אילת",
  };

  const prefix = code.substring(0, 2);
  const city = postcodeMap[prefix];

  res.json(city ? { success: true, city } : { success: false });
});

export { router as proxyRoutes };
