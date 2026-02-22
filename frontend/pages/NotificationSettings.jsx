import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, TextField, Banner, Tabs,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

const TEMPLATE_LABELS = {
  order_confirmation: "אישור הזמנה",
  shipping_confirmation: "אישור משלוח",
  shipping_update: "עדכון משלוח",
  order_cancelled: "ביטול הזמנה",
  refund_confirmation: "אישור החזר כספי",
  customer_welcome: "ברוך הבא ללקוח חדש",
  password_reset: "איפוס סיסמה",
  abandoned_cart: "עגלה נטושה",
  gift_card: "כרטיס מתנה",
  draft_order_invoice: "חשבונית",
  contact_customer: "פנייה ללקוח",
};

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [templates, setTemplates] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadData = useCallback(async () => {
    try {
      const [settingsData, notifData] = await Promise.all([
        get("/settings"),
        get("/notifications"),
      ]);
      setEnabled(settingsData.settings.notificationsEnabled);
      setTemplates(notifData.defaultTemplates);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveSettings = async () => {
    try {
      await put("/settings", { notificationsEnabled: enabled });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const templateKeys = Object.keys(TEMPLATE_LABELS);
  const tabs = templateKeys.map((key) => ({
    id: key,
    content: TEMPLATE_LABELS[key],
  }));

  const currentTemplate = templates[templateKeys[selectedTab]];

  return (
    <Page
      title="תרגום התראות ואימיילים"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={{ content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setSaved(false)}>
              <p>ההגדרות נשמרו!</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">תרגום התראות</Text>
              <Text tone="subdued">
                תרגם את כל ההתראות והאימיילים שנשלחים ללקוחות שלך לעברית.
                כולל אישורי הזמנה, אישורי משלוח, ועוד.
              </Text>
              <Checkbox
                label="הפעל תרגום התראות לעברית"
                checked={enabled}
                onChange={setEnabled}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">תבניות הודעות</Text>
              <Text tone="subdued">
                להלן התבניות המתורגמות שישלחו ללקוחות שלך:
              </Text>

              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                {currentTemplate && (
                  <Box padding="400">
                    <BlockStack gap="300">
                      <TextField
                        label="נושא"
                        value={currentTemplate.subject}
                        readOnly
                      />
                      <TextField
                        label="פתיח"
                        value={currentTemplate.greeting}
                        readOnly
                      />
                      <TextField
                        label="תוכן"
                        value={currentTemplate.body}
                        multiline={3}
                        readOnly
                      />
                      <TextField
                        label="סיום"
                        value={currentTemplate.footer || ""}
                        readOnly
                      />
                    </BlockStack>
                  </Box>
                )}
              </Tabs>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">הודעות כלולות</Text>
              <BlockStack gap="100">
                {templateKeys.map((key) => (
                  <InlineStack key={key} gap="200">
                    <Text>&#x2705; {TEMPLATE_LABELS[key]}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function InlineStack({ children, gap }) {
  return <div style={{ display: "flex", gap: gap ? `${parseInt(gap) * 4}px` : "8px", alignItems: "center" }}>{children}</div>;
}

function Box({ children, padding }) {
  return <div style={{ padding: padding ? `${parseInt(padding) * 4}px` : "0" }}>{children}</div>;
}
