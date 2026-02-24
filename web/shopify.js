// RTL Pro - Shopify Configuration
import shopifyAppPkg from "@shopify/shopify-app-express";
const { shopifyApp } = shopifyAppPkg;
import sessionStoragePkg from "@shopify/shopify-app-session-storage-prisma";
const { PrismaSessionStorage } = sessionStoragePkg;
import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;

const prisma = new PrismaClient();

const shopify = shopifyApp({
      api: {
              apiVersion: "2026-01",
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
