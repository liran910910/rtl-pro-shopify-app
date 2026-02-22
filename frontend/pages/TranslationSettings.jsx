import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, TextField, Button,
  Banner, DataTable, InlineStack, Modal, Box,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

export default function TranslationSettings() {
  const [settings, setSettings] = useState({
    translationEnabled: true,
    translateButtons: true,
    translateNavigation: true,
    translateCart: true,
    translateCheckout: true,
    translateSearch: true,
    translateFooter: true,
    translateFilters: true,
    translateDates: true,
    buyNowText: "קנה עכשיו",
    addToCartText: "הוסף לסל",
  });
  const [customTranslations, setCustomTranslations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTranslation, setNewTranslation] = useState({ originalText: "", translatedText: "", context: "" });
  const [saved, setSaved] = useState(false);
  const { get, put, post, del, loading } = useApi();

  const loadData = useCallback(async () => {
    try {
      const [settingsData, translationsData] = await Promise.all([
        get("/settings"),
        get("/translations"),
      ]);
      const s = settingsData.settings;
      setSettings({
        translationEnabled: s.translationEnabled,
        translateButtons: s.translateButtons,
        translateNavigation: s.translateNavigation,
        translateCart: s.translateCart,
        translateCheckout: s.translateCheckout,
        translateSearch: s.translateSearch,
        translateFooter: s.translateFooter,
        translateFilters: s.translateFilters,
        translateDates: s.translateDates,
        buyNowText: s.buyNowText,
        addToCartText: s.addToCartText,
      });
      setCustomTranslations(translationsData.customTranslations || []);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveSettings = async () => {
    try {
      await put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const addTranslation = async () => {
    try {
      await post("/translations", newTranslation);
      setShowModal(false);
      setNewTranslation({ originalText: "", translatedText: "", context: "" });
      loadData();
    } catch (e) { console.error(e); }
  };

  const deleteTranslation = async (id) => {
    try {
      await del(`/translations/${id}`);
      loadData();
    } catch (e) { console.error(e); }
  };

  const tableRows = customTranslations.map((t) => [
    t.originalText,
    t.translatedText,
    t.context || "-",
    <Button size="slim" tone="critical" onClick={() => deleteTranslation(t.id)}>מחק</Button>,
  ]);

  return (
    <Page
      title="הגדרות תרגום"
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
              <Text variant="headingMd" as="h2">תרגום אוטומטי</Text>
              <Checkbox
                label="הפעל תרגום לעברית"
                checked={settings.translationEnabled}
                onChange={(v) => setSettings({ ...settings, translationEnabled: v })}
              />
              <Checkbox
                label="תרגם כפתורים"
                checked={settings.translateButtons}
                onChange={(v) => setSettings({ ...settings, translateButtons: v })}
              />
              <Checkbox
                label="תרגם ניווט"
                checked={settings.translateNavigation}
                onChange={(v) => setSettings({ ...settings, translateNavigation: v })}
              />
              <Checkbox
                label="תרגם סל קניות"
                checked={settings.translateCart}
                onChange={(v) => setSettings({ ...settings, translateCart: v })}
              />
              <Checkbox
                label="תרגם צ'קאאוט"
                checked={settings.translateCheckout}
                onChange={(v) => setSettings({ ...settings, translateCheckout: v })}
              />
              <Checkbox
                label="תרגם חיפוש"
                checked={settings.translateSearch}
                onChange={(v) => setSettings({ ...settings, translateSearch: v })}
              />
              <Checkbox
                label="תרגם פוטר"
                checked={settings.translateFooter}
                onChange={(v) => setSettings({ ...settings, translateFooter: v })}
              />
              <Checkbox
                label="תרגם פילטרים"
                checked={settings.translateFilters}
                onChange={(v) => setSettings({ ...settings, translateFilters: v })}
              />
              <Checkbox
                label="תרגם תאריכים"
                checked={settings.translateDates}
                onChange={(v) => setSettings({ ...settings, translateDates: v })}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">טקסט כפתורים</Text>
              <TextField
                label='טקסט "קנה עכשיו"'
                value={settings.buyNowText}
                onChange={(v) => setSettings({ ...settings, buyNowText: v })}
              />
              <TextField
                label='טקסט "הוסף לסל"'
                value={settings.addToCartText}
                onChange={(v) => setSettings({ ...settings, addToCartText: v })}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">תרגומים מותאמים אישית</Text>
                <Button onClick={() => setShowModal(true)}>הוסף תרגום</Button>
              </InlineStack>
              {tableRows.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["מקור", "תרגום", "קונטקסט", "פעולות"]}
                  rows={tableRows}
                />
              ) : (
                <Text tone="subdued">אין תרגומים מותאמים אישית. לחץ "הוסף תרגום" כדי להוסיף.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="הוסף תרגום מותאם"
        primaryAction={{ content: "הוסף", onAction: addTranslation }}
        secondaryActions={[{ content: "ביטול", onAction: () => setShowModal(false) }]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="טקסט מקורי (אנגלית)"
              value={newTranslation.originalText}
              onChange={(v) => setNewTranslation({ ...newTranslation, originalText: v })}
            />
            <TextField
              label="תרגום (עברית)"
              value={newTranslation.translatedText}
              onChange={(v) => setNewTranslation({ ...newTranslation, translatedText: v })}
            />
            <TextField
              label="קונטקסט (אופציונלי)"
              value={newTranslation.context}
              onChange={(v) => setNewTranslation({ ...newTranslation, context: v })}
              helpText="לדוגמה: button, navigation, footer"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
