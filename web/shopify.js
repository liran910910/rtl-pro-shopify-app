// RTL Pro - Shopify Configuration
import shopifyAppExpress from "@shopify/shopify-app-express";
const { LATEST_API_VERSION, shopifyApp } = shopifyAppExpress;
import prismaSessionStorage from "@shopify/shopify-app-session-storage-prisma";
const { PrismaSessionStorage } = prismaSessionStorage;
import prismaClient from "@prisma/client";
const { PrismaClient } = prismaClient;
import shopifyApiRest from "@shopify/shopify-api/rest/admin/2024-10";
const { restResources } = shopifyApiRest;

const prisma = new PrismaClient();

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: {
      // Basic Plan
      "RTL Pro Basic": {
        amount: 7.75,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
      // Pro Plan
      "RTL Pro Pro": {
        amount: 9.95,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
      // Premium Plan
      "RTL Pro Premium": {
        amount: 14.75,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new PrismaSessionStorage(prisma),
});

export default shopify;
export { prisma };
