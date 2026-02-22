import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Banner, Button, Badge,
  InlineStack, Box, Divider,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

const PLANS = {
  basic: {
    name: "Basic",
    price: "7.75",
    features: [
      "RTL Layout",
      "תרגום לעברית",
      "תרגום התראות ואימיילים",
      "פונטים עבריים",
      'תרגום כפתור "קנה עכשיו"',
      "אייקוני תשלום",
      "תמיכה באימייל/צ'אט",
      "עדכוני תמה",
    ],
  },
  pro: {
    name: "Pro",
    price: "9.95",
    features: [
      "כל תכונות Basic",
      "מודול נגישות",
      "הצהרת נגישות",
      "כפתור נגישות צף",
      "תואם חוק נגישות ישראלי",
    ],
    highlight: true,
  },
  premium: {
    name: "Premium",
    price: "14.75",
    features: [
      "כל תכונות Pro",
      "עורך CSS מותאם",
      "זיהוי מיקוד אוטומטי",
      "תמיכה בעדיפות גבוהה",
    ],
  },
};

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("basic");
  const [changingPlan, setChangingPlan] = useState(null);
  const { get, post, loading } = useApi();

  const loadPlan = useCallback(async () => {
    try {
      const data = await get("/billing/plan");
      setCurrentPlan(data.plan);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const handleChangePlan = async (planKey) => {
    setChangingPlan(planKey);
    try {
      const result = await post("/billing/change-plan", { plan: planKey });
      if (result.confirmationUrl) {
        window.top.location.href = result.confirmationUrl;
      } else {
        loadPlan();
      }
    } catch (e) {
      console.error(e);
    }
    setChangingPlan(null);
  };

  return (
    <Page title="מנוי ותשלום" backAction={{ content: "חזרה", url: "/" }}>
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            <p>כל התוכניות כוללות 5 ימי ניסיון חינם! אפשר לשדרג או לשנמך בכל עת.</p>
          </Banner>
        </Layout.Section>

        {Object.entries(PLANS).map(([key, plan]) => (
          <Layout.Section key={key} variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingLg" as="h2">{plan.name}</Text>
                  {key === currentPlan && <Badge tone="success">פעיל</Badge>}
                  {plan.highlight && key !== currentPlan && <Badge tone="attention">מומלץ</Badge>}
                </InlineStack>

                <Text variant="heading2xl" as="p">
                  ${plan.price}
                  <Text as="span" variant="bodySm" tone="subdued"> / חודש</Text>
                </Text>

                <Divider />

                <BlockStack gap="200">
                  {plan.features.map((feature, i) => (
                    <Text key={i}>&#x2705; {feature}</Text>
                  ))}
                </BlockStack>

                <Box paddingBlockStart="200">
                  {key === currentPlan ? (
                    <Button disabled fullWidth>
                      התוכנית הנוכחית שלך
                    </Button>
                  ) : (
                    <Button
                      variant={plan.highlight ? "primary" : "secondary"}
                      fullWidth
                      onClick={() => handleChangePlan(key)}
                      loading={changingPlan === key}
                    >
                      {key === "basic" ? "שנמך ל-Basic" : `שדרג ל-${plan.name}`}
                    </Button>
                  )}
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">שאלות נפוצות</Text>
              <BlockStack gap="300">
                <BlockStack gap="100">
                  <Text variant="headingSm">האם אפשר לבטל בכל עת?</Text>
                  <Text tone="subdued">כן, אפשר לבטל את המנוי בכל עת ללא התחייבות.</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingSm">מה קורה כשמשדרגים?</Text>
                  <Text tone="subdued">השדרוג נכנס לתוקף מיד ומחויב באופן יחסי.</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingSm">יש ימי ניסיון?</Text>
                  <Text tone="subdued">כן, 5 ימי ניסיון חינם לכל תוכנית חדשה.</Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
