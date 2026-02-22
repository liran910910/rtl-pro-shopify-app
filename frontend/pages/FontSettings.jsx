import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, Select, RangeSlider,
  Banner, Box,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

const HEBREW_FONTS = [
  { label: "Assistant - מודרני ונקי", value: "Assistant" },
  { label: "Heebo - עדין וקריא", value: "Heebo" },
  { label: "Rubik - עגול ונעים", value: "Rubik" },
  { label: "Varela Round - עגלגל ומזמין", value: "Varela Round" },
  { label: "Alef - קלאסי", value: "Alef" },
  { label: "David Libre - פורמלי", value: "David Libre" },
  { label: "Frank Ruhl Libre - אלגנטי", value: "Frank Ruhl Libre" },
  { label: "Secular One - בולט וחזק", value: "Secular One" },
  { label: "Suez One - כותרות מרשימות", value: "Suez One" },
  { label: "Amatic SC - יצירתי וחופשי", value: "Amatic SC" },
  { label: "Noto Sans Hebrew - אוניברסלי", value: "Noto Sans Hebrew" },
  { label: "Open Sans Hebrew - פופולרי", value: "Open Sans Hebrew" },
];

export default function FontSettings() {
  const [settings, setSettings] = useState({
    fontEnabled: false,
    fontFamily: "Assistant",
    fontSize: "16",
  });
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings({
        fontEnabled: data.settings.fontEnabled,
        fontFamily: data.settings.fontFamily,
        fontSize: data.settings.fontSize?.replace("px", "") || "16",
      });
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", {
        fontEnabled: settings.fontEnabled,
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <Page
      title="הגדרות פונט"
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
              <Text variant="headingMd" as="h2">פונט עברי</Text>
              <Checkbox
                label="הפעל פונט עברי מותאם"
                checked={settings.fontEnabled}
                onChange={(v) => setSettings({ ...settings, fontEnabled: v })}
                helpText="הפונט יחליף את הפונט הברירת מחדל של התמה שלך"
              />

              <Select
                label="בחר פונט"
                options={HEBREW_FONTS}
                value={settings.fontFamily}
                onChange={(v) => setSettings({ ...settings, fontFamily: v })}
                disabled={!settings.fontEnabled}
              />

              <RangeSlider
                label={`גודל פונט: ${settings.fontSize}px`}
                value={parseInt(settings.fontSize)}
                min={12}
                max={24}
                step={1}
                onChange={(v) => setSettings({ ...settings, fontSize: String(v) })}
                disabled={!settings.fontEnabled}
                output
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">תצוגה מקדימה</Text>
              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <div
                  style={{
                    fontFamily: settings.fontEnabled ? `'${settings.fontFamily}', sans-serif` : "inherit",
                    fontSize: settings.fontEnabled ? `${settings.fontSize}px` : "16px",
                    direction: "rtl",
                    textAlign: "right",
                    lineHeight: "1.8",
                  }}
                >
                  <p style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "8px" }}>
                    כותרת לדוגמה
                  </p>
                  <p>
                    זהו טקסט לדוגמה שמראה איך הפונט שבחרת ייראה באתר שלך.
                    הפונט ישפיע על כל הטקסטים באתר כולל כותרות, פסקאות, כפתורים ותפריטים.
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    <strong>טקסט מודגש</strong> | <em>טקסט נטוי</em> | טקסט רגיל
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    מחיר: ₪199.00 | משלוח חינם | 5 כוכבים
                  </p>
                </div>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
