// RTL Pro - Webhook Handlers
import shopifyApiPkg from "@shopify/shopify-api";
const { DeliveryMethod } = shopifyApiPkg;
import { prisma } from "../shopify.js";

export const webhookRoutes = {
  // App uninstalled
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log(`App uninstalled from ${shop}`);
      // Clean up store data
      try {
        await prisma.storeSettings.deleteMany({ where: { shop } });
        await prisma.customTranslation.deleteMany({ where: { shop } });
        await prisma.notificationTemplate.deleteMany({ where: { shop } });
        await prisma.session.deleteMany({ where: { shop } });
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    },
  },

  // GDPR webhooks
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body) => {
      console.log(`Customer data request from ${shop}`);
      // RTL Pro doesn't store customer data
    },
  },

  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body) => {
      console.log(`Customer redact request from ${shop}`);
      // RTL Pro doesn't store customer data
    },
  },

  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body) => {
      console.log(`Shop redact request from ${shop}`);
      try {
        await prisma.storeSettings.deleteMany({ where: { shop } });
        await prisma.customTranslation.deleteMany({ where: { shop } });
        await prisma.notificationTemplate.deleteMany({ where: { shop } });
        await prisma.session.deleteMany({ where: { shop } });
      } catch (e) {
        console.error("Shop redact error:", e);
      }
    },
  },

  // Subscription billing
  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body) => {
      console.log(`Subscription update for ${shop}`);
      const payload = JSON.parse(body);
      const subscription = payload.app_subscription;

      if (subscription) {
        const planName = subscription.name;
        let planKey = "basic";

        if (planName.includes("Premium")) planKey = "premium";
        else if (planName.includes("Pro")) planKey = "pro";

        const isActive = subscription.status === "ACTIVE";

        try {
          await prisma.storeSettings.upsert({
            where: { shop },
            update: { plan: planKey, isActive },
            create: { shop, plan: planKey, isActive },
          });
        } catch (e) {
          console.error("Subscription update error:", e);
        }
      }
    },
  },
};
