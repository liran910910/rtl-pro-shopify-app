// RTL Pro - API Routes
import { Router } from "express";
import { prisma } from "../shopify.js";
import shopify from "../shopify.js";
import { PLANS, hasFeature, changePlan, getCurrentPlan } from "../helpers/billing.js";
import hebrewTranslations from "../translations/hebrew.json" assert { type: "json" };
import notificationTemplates from "../translations/notifications.json" assert { type: "json" };

const router = Router();

// ============================================
// Settings Routes
// ============================================

// Get store settings
router.get("/settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    let settings = await prisma.storeSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { shop, plan: "basic", isActive: true },
      });
    }

    // Get plan info
    const planInfo = PLANS[settings.plan] || PLANS.basic;

    res.json({
      success: true,
      settings,
      plan: {
        key: settings.plan,
        name: planInfo.name,
        price: planInfo.price,
        features: planInfo.features,
      },
      allPlans: PLANS,
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update store settings
router.put("/settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const updates = req.body;

    // Check feature access based on plan
    const currentPlan = await getCurrentPlan(shop);

    // Validate premium features
    if (updates.customCssEnabled && !hasFeature(currentPlan.plan, "custom_css")) {
      return res.status(403).json({
        success: false,
        error: "Custom CSS requires Premium plan",
        requiredPlan: "premium",
      });
    }

    if (updates.accessibilityEnabled && !hasFeature(currentPlan.plan, "accessibility_widget")) {
      return res.status(403).json({
        success: false,
        error: "Accessibility features require Pro plan or higher",
        requiredPlan: "pro",
      });
    }

    if (updates.postcodeDetection && !hasFeature(currentPlan.plan, "postcode_detection")) {
      return res.status(403).json({
        success: false,
        error: "Postcode detection requires Premium plan",
        requiredPlan: "premium",
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.shop;
    delete updates.plan;
    delete updates.createdAt;
    delete updates.updatedAt;

    const settings = await prisma.storeSettings.upsert({
      where: { shop },
      update: updates,
      create: { shop, ...updates },
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Billing Routes
// ============================================

// Get current plan
router.get("/billing/plan", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const planInfo = await getCurrentPlan(session.shop);
    res.json({ success: true, ...planInfo, allPlans: PLANS });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change plan
router.post("/billing/change-plan", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    const result = await changePlan(session, plan);
    res.json(result);
  } catch (error) {
    console.error("Error changing plan:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Translation Routes
// ============================================

// Get all translations
router.get("/translations", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    // Get custom translations
    const customTranslations = await prisma.customTranslation.findMany({
      where: { shop, isActive: true },
    });

    res.json({
      success: true,
      defaultTranslations: hebrewTranslations,
      customTranslations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add/update custom translation
router.post("/translations", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const { originalText, translatedText, context } = req.body;

    const translation = await prisma.customTranslation.upsert({
      where: {
        shop_originalText: { shop, originalText },
      },
      update: { translatedText, context },
      create: { shop, originalText, translatedText, context },
    });

    res.json({ success: true, translation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete custom translation
router.delete("/translations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.customTranslation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Notification Routes
// ============================================

// Get notification templates
router.get("/notifications", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    const customTemplates = await prisma.notificationTemplate.findMany({
      where: { shop },
    });

    res.json({
      success: true,
      defaultTemplates: notificationTemplates,
      customTemplates,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notification template
router.put("/notifications/:templateKey", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const { templateKey } = req.params;
    const { subject, body } = req.body;

    const template = await prisma.notificationTemplate.upsert({
      where: {
        shop_templateKey: { shop, templateKey },
      },
      update: { subject, body },
      create: { shop, templateKey, subject, body },
    });

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Theme Integration Routes
// ============================================

// Get theme settings for the storefront extension
router.get("/theme-settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    const settings = await prisma.storeSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      return res.json({ success: true, settings: null });
    }

    const customTranslations = await prisma.customTranslation.findMany({
      where: { shop, isActive: true },
    });

    // Build merged translations
    const mergedTranslations = { ...hebrewTranslations };
    customTranslations.forEach((ct) => {
      const category = ct.context || "custom";
      if (!mergedTranslations[category]) {
        mergedTranslations[category] = {};
      }
      mergedTranslations[category][ct.originalText] = ct.translatedText;
    });

    res.json({
      success: true,
      settings: {
        rtlEnabled: settings.rtlEnabled,
        translationEnabled: settings.translationEnabled,
        translateButtons: settings.translateButtons,
        translateNavigation: settings.translateNavigation,
        translateCart: settings.translateCart,
        translateCheckout: settings.translateCheckout,
        translateSearch: settings.translateSearch,
        translateFooter: settings.translateFooter,
        translateFilters: settings.translateFilters,
        translateDates: settings.translateDates,
        fontEnabled: settings.fontEnabled,
        fontFamily: settings.fontFamily,
        fontUrl: settings.fontUrl,
        fontSize: settings.fontSize,
        paymentIconsEnabled: settings.paymentIconsEnabled,
        paymentIcons: JSON.parse(settings.paymentIcons || "[]"),
        paymentIconsPosition: settings.paymentIconsPosition,
        accessibilityEnabled: settings.accessibilityEnabled,
        accessibilityWidget: settings.accessibilityWidget,
        accessibilityStatement: settings.accessibilityStatement,
        accessibilityStatementContent: settings.accessibilityStatementContent,
        customCssEnabled: settings.customCssEnabled,
        customCss: settings.customCss,
        postcodeDetection: settings.postcodeDetection,
        buyNowText: settings.buyNowText,
        addToCartText: settings.addToCartText,
        plan: settings.plan,
      },
      translations: mergedTranslations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Israeli Postcode API
// ============================================

// Get city by postcode
router.get("/postcode/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Israeli postcode to city mapping (common cities)
    const postcodeMap = {
      // Tel Aviv area
      "61": "תל אביב-יפו", "62": "תל אביב-יפו", "63": "תל אביב-יפו",
      "64": "תל אביב-יפו", "65": "תל אביב-יפו", "66": "תל אביב-יפו",
      "67": "תל אביב-יפו", "68": "תל אביב-יפו", "69": "תל אביב-יפו",
      // Jerusalem
      "91": "ירושלים", "92": "ירושלים", "93": "ירושלים",
      "94": "ירושלים", "95": "ירושלים", "96": "ירושלים",
      // Haifa
      "31": "חיפה", "32": "חיפה", "33": "חיפה",
      "34": "חיפה", "35": "חיפה",
      // Beer Sheva
      "84": "באר שבע", "85": "באר שבע",
      // Netanya
      "42": "נתניה",
      // Rishon LeZion
      "75": "ראשון לציון",
      // Petah Tikva
      "49": "פתח תקווה",
      // Ashdod
      "77": "אשדוד",
      // Herzliya
      "46": "הרצליה",
      // Ramat Gan
      "52": "רמת גן",
      // Holon
      "58": "חולון",
      // Bnei Brak
      "51": "בני ברק",
      // Bat Yam
      "59": "בת ים",
      // Rehovot
      "76": "רחובות",
      // Ashkelon
      "78": "אשקלון",
      // Kfar Saba
      "44": "כפר סבא",
      // Ra'anana
      "43": "רעננה",
      // Modiin
      "71": "מודיעין",
      // Eilat
      "88": "אילת",
      // Nazareth
      "16": "נצרת",
      // Acre
      "24": "עכו",
      // Tiberias
      "14": "טבריה",
    };

    const prefix = code.substring(0, 2);
    const city = postcodeMap[prefix];

    if (city) {
      res.json({ success: true, city, postcode: code });
    } else {
      res.json({ success: false, message: "Postcode not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as apiRoutes };
// RTL Pro - API Routes
const express = require("express");
const { Router } = express;
const shopifyModule = require("../shopify.js");
const { prisma } = shopifyModule;
const shopify = shopifyModule;
const { PLANS, hasFeature, changePlan, getCurrentPlan } = require("../helpers/billing.js");
const hebrewTranslations = require("../translations/hebrew.json");
const notificationTemplates = require("../translations/notifications.json");

const router = Router();

// ============================================
// Settings Routes
// ============================================

// Get store settings
router.get("/settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    let settings = await prisma.storeSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { shop, plan: "basic", isActive: true },
      });
    }

    // Get plan info
    const planInfo = PLANS[settings.plan] || PLANS.basic;

    res.json({
      success: true,
      settings,
      plan: {
        key: settings.plan,
        name: planInfo.name,
        price: planInfo.price,
        features: planInfo.features,
      },
      allPlans: PLANS,
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update store settings
router.put("/settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const updates = req.body;

    // Check feature access based on plan
    const currentPlan = await getCurrentPlan(shop);

    // Validate premium features
    if (updates.customCssEnabled && !hasFeature(currentPlan.plan, "custom_css")) {
      return res.status(403).json({
        success: false,
        error: "Custom CSS requires Premium plan",
        requiredPlan: "premium",
      });
    }

    if (updates.accessibilityEnabled && !hasFeature(currentPlan.plan, "accessibility_widget")) {
      return res.status(403).json({
        success: false,
        error: "Accessibility features require Pro plan or higher",
        requiredPlan: "pro",
      });
    }

    if (updates.postcodeDetection && !hasFeature(currentPlan.plan, "postcode_detection")) {
      return res.status(403).json({
        success: false,
        error: "Postcode detection requires Premium plan",
        requiredPlan: "premium",
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.shop;
    delete updates.plan;
    delete updates.createdAt;
    delete updates.updatedAt;

    const settings = await prisma.storeSettings.upsert({
      where: { shop },
      update: updates,
      create: { shop, ...updates },
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Billing Routes
// ============================================

// Get current plan
router.get("/billing/plan", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const planInfo = await getCurrentPlan(session.shop);
    res.json({ success: true, ...planInfo, allPlans: PLANS });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change plan
router.post("/billing/change-plan", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    const result = await changePlan(session, plan);
    res.json(result);
  } catch (error) {
    console.error("Error changing plan:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Translation Routes
// ============================================

// Get all translations
router.get("/translations", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    // Get custom translations
    const customTranslations = await prisma.customTranslation.findMany({
      where: { shop, isActive: true },
    });

    res.json({
      success: true,
      defaultTranslations: hebrewTranslations,
      customTranslations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add/update custom translation
router.post("/translations", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const { originalText, translatedText, context } = req.body;

    const translation = await prisma.customTranslation.upsert({
      where: {
        shop_originalText: { shop, originalText },
      },
      update: { translatedText, context },
      create: { shop, originalText, translatedText, context },
    });

    res.json({ success: true, translation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete custom translation
router.delete("/translations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.customTranslation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Notification Routes
// ============================================

// Get notification templates
router.get("/notifications", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    const customTemplates = await prisma.notificationTemplate.findMany({
      where: { shop },
    });

    res.json({
      success: true,
      defaultTemplates: notificationTemplates,
      customTemplates,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notification template
router.put("/notifications/:templateKey", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;
    const { templateKey } = req.params;
    const { subject, body } = req.body;

    const template = await prisma.notificationTemplate.upsert({
      where: {
        shop_templateKey: { shop, templateKey },
      },
      update: { subject, body },
      create: { shop, templateKey, subject, body },
    });

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Theme Integration Routes
// ============================================

// Get theme settings for the storefront extension
router.get("/theme-settings", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = session.shop;

    const settings = await prisma.storeSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      return res.json({ success: true, settings: null });
    }

    const customTranslations = await prisma.customTranslation.findMany({
      where: { shop, isActive: true },
    });

    // Build merged translations
    const mergedTranslations = { ...hebrewTranslations };
    customTranslations.forEach((ct) => {
      const category = ct.context || "custom";
      if (!mergedTranslations[category]) {
        mergedTranslations[category] = {};
      }
      mergedTranslations[category][ct.originalText] = ct.translatedText;
    });

    res.json({
      success: true,
      settings: {
        rtlEnabled: settings.rtlEnabled,
        translationEnabled: settings.translationEnabled,
        translateButtons: settings.translateButtons,
        translateNavigation: settings.translateNavigation,
        translateCart: settings.translateCart,
        translateCheckout: settings.translateCheckout,
        translateSearch: settings.translateSearch,
        translateFooter: settings.translateFooter,
        translateFilters: settings.translateFilters,
        translateDates: settings.translateDates,
        fontEnabled: settings.fontEnabled,
        fontFamily: settings.fontFamily,
        fontUrl: settings.fontUrl,
        fontSize: settings.fontSize,
        paymentIconsEnabled: settings.paymentIconsEnabled,
        paymentIcons: JSON.parse(settings.paymentIcons || "[]"),
        paymentIconsPosition: settings.paymentIconsPosition,
        accessibilityEnabled: settings.accessibilityEnabled,
        accessibilityWidget: settings.accessibilityWidget,
        accessibilityStatement: settings.accessibilityStatement,
        accessibilityStatementContent: settings.accessibilityStatementContent,
        customCssEnabled: settings.customCssEnabled,
        customCss: settings.customCss,
        postcodeDetection: settings.postcodeDetection,
        buyNowText: settings.buyNowText,
        addToCartText: settings.addToCartText,
        plan: settings.plan,
      },
      translations: mergedTranslations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Israeli Postcode API
// ============================================

// Get city by postcode
router.get("/postcode/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Israeli postcode to city mapping (common cities)
    const postcodeMap = {
      // Tel Aviv area
      "61": "תל אביב-יפו", "62": "תל אביב-יפו", "63": "תל אביב-יפו",
      "64": "תל אביב-יפו", "65": "תל אביב-יפו", "66": "תל אביב-יפו",
      "67": "תל אביב-יפו", "68": "תל אביב-יפו", "69": "תל אביב-יפו",
      // Jerusalem
      "91": "ירושלים", "92": "ירושלים", "93": "ירושלים",
      "94": "ירושלים", "95": "ירושלים", "96": "ירושלים",
      // Haifa
      "31": "חיפה", "32": "חיפה", "33": "חיפה",
      "34": "חיפה", "35": "חיפה",
      // Beer Sheva
      "84": "באר שבע", "85": "באר שבע",
      // Netanya
      "42": "נתניה",
      // Rishon LeZion
      "75": "ראשון לציון",
      // Petah Tikva
      "49": "פתח תקווה",
      // Ashdod
      "77": "אשדוד",
      // Herzliya
      "46": "הרצליה",
      // Ramat Gan
      "52": "רמת גן",
      // Holon
      "58": "חולון",
      // Bnei Brak
      "51": "בני ברק",
      // Bat Yam
      "59": "בת ים",
      // Rehovot
      "76": "רחובות",
      // Ashkelon
      "78": "אשקלון",
      // Kfar Saba
      "44": "כפר סבא",
      // Ra'anana
      "43": "רעננה",
      // Modiin
      "71": "מודיעין",
      // Eilat
      "88": "אילת",
      // Nazareth
      "16": "נצרת",
      // Acre
      "24": "עכו",
      // Tiberias
      "14": "טבריה",
    };

    const prefix = code.substring(0, 2);
    const city = postcodeMap[prefix];

    if (city) {
      res.json({ success: true, city, postcode: code });
    } else {
      res.json({ success: false, message: "Postcode not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = { apiRoutes: router };
