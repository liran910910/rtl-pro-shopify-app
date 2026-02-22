// RTL Pro - Shopify Billing Management
import shopify from "../shopify.js";
import { prisma } from "../shopify.js";

// Plan configurations
export const PLANS = {
  basic: {
    name: "RTL Pro Basic",
    price: 7.75,
    features: [
      "rtl_layout",
      "translation",
      "notifications",
      "custom_fonts",
      "buy_now_translation",
      "payment_icons",
      "email_support",
      "theme_updates",
    ],
  },
  pro: {
    name: "RTL Pro Pro",
    price: 9.95,
    features: [
      "rtl_layout",
      "translation",
      "notifications",
      "custom_fonts",
      "buy_now_translation",
      "payment_icons",
      "email_support",
      "theme_updates",
      "accessibility_widget",
      "accessibility_statement",
    ],
  },
  premium: {
    name: "RTL Pro Premium",
    price: 14.75,
    features: [
      "rtl_layout",
      "translation",
      "notifications",
      "custom_fonts",
      "buy_now_translation",
      "payment_icons",
      "email_support",
      "theme_updates",
      "accessibility_widget",
      "accessibility_statement",
      "custom_css",
      "postcode_detection",
    ],
  },
};

// Check if a feature is available for a given plan
export function hasFeature(plan, feature) {
  const planConfig = PLANS[plan];
  if (!planConfig) return false;
  return planConfig.features.includes(feature);
}

// Setup billing for a new store
export async function setupBilling(session) {
  const shop = session.shop;

  // Check if store has settings already
  let settings = await prisma.storeSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    // Create default settings with basic plan
    settings = await prisma.storeSettings.create({
      data: {
        shop,
        plan: "basic",
        isActive: true,
      },
    });
  }

  return settings;
}

// Create a billing subscription
export async function createSubscription(session, planKey) {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);

  const billingConfig = shopify.api.billing;

  // Check for existing subscription
  const currentPayments = await shopify.api.billing.check({
    session,
    plans: [plan.name],
    isTest: process.env.NODE_ENV !== "production",
  });

  if (currentPayments.hasActivePayment) {
    return { success: true, message: "Already subscribed to this plan" };
  }

  // Create new subscription
  const confirmationUrl = await shopify.api.billing.request({
    session,
    plan: plan.name,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `https://${session.shop}/admin/apps/rtl-pro`,
  });

  return { success: true, confirmationUrl };
}

// Cancel subscription
export async function cancelSubscription(session) {
  const shop = session.shop;

  await prisma.storeSettings.update({
    where: { shop },
    data: { plan: "basic", isActive: true },
  });

  return { success: true };
}

// Upgrade/downgrade plan
export async function changePlan(session, newPlanKey) {
  const shop = session.shop;

  // Create new billing subscription
  const result = await createSubscription(session, newPlanKey);

  if (result.confirmationUrl) {
    return result;
  }

  // Update local settings
  await prisma.storeSettings.update({
    where: { shop },
    data: { plan: newPlanKey },
  });

  return { success: true };
}

// Get current plan info
export async function getCurrentPlan(shop) {
  const settings = await prisma.storeSettings.findUnique({
    where: { shop },
  });

  if (!settings) return { plan: "basic", features: PLANS.basic.features };

  return {
    plan: settings.plan,
    features: PLANS[settings.plan]?.features || PLANS.basic.features,
  };
}
