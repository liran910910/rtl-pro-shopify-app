import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, Banner, Box,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

export default function CustomCSSEditor() {
  const [settings, setSettings] = useState({
    customCssEnabled: false,
    customCss: "",
  });
  const [plan, setPlan] = useState("basic");
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings({
        customCssEnabled: data.settings.customCssEnabled,
        customCss: data.settings.customCss || "",
      });
      setPlan(data.settings.plan);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const needsUpgrade = plan !== "premium";

  return (
    <Page
      title="CSS מותאם אישית"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={needsUpgrade ? undefined : { content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section><Banner tone="success" onDismiss={() => setSaved(false)}><p>נשמר!</p></Banner></Layout.Section>
        )}

        {needsUpgrade && (
          <Layout.Section>
            <Banner tone="warning" action={{ content: "שדרג ל-Premium", url: "/billing" }}>
              <p>עורך CSS מותאם זמין רק בתוכנית Premium.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">עורך CSS</Text>
              <Text tone="subdued">
                הוסף CSS מותאם אישית לאתר שלך. ה-CSS יתווסף לכל דפי האתר.
              </Text>

              <Checkbox
                label="הפעל CSS מותאם"
                checked={settings.customCssEnabled}
                onChange={(v) => setSettings({ ...settings, customCssEnabled: v })}
                disabled={needsUpgrade}
              />

              <Box
                padding="0"
                borderRadius="200"
                borderWidth="025"
                borderColor="border"
              >
                <textarea
                  value={settings.customCss}
                  onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                  disabled={needsUpgrade || !settings.customCssEnabled}
                  placeholder={`/* הוסף CSS מותאם אישית כאן */\n\n/* דוגמה: */\n.header {\n  background-color: #1a1a2e;\n}\n\n.product-title {\n  font-size: 24px;\n  color: #333;\n}`}
                  style={{
                    width: "100%",
                    minHeight: "300px",
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    padding: "16px",
                    border: "none",
                    outline: "none",
                    resize: "vertical",
                    backgroundColor: needsUpgrade ? "#f5f5f5" : "#1e1e1e",
                    color: needsUpgrade ? "#999" : "#d4d4d4",
                    direction: "ltr",
                    textAlign: "left",
                    borderRadius: "8px",
                    tabSize: 2,
                  }}
                  spellCheck={false}
                />
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">טיפים</Text>
              <BlockStack gap="200">
                <Text>- השתמש ב-<code>!important</code> כדי לדרוס סגנונות קיימים</Text>
                <Text>- בדוק את ה-CSS שלך בדפדפנים שונים</Text>
                <Text>- השתמש ב-<code>[dir="rtl"]</code> כדי למקד אלמנטים ב-RTL</Text>
                <Text>- שמור גיבוי של ה-CSS שלך</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
