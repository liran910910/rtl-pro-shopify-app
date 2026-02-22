/**
 * RTL Pro - Accessibility Widget
 * Israeli accessibility law compliance
 */
(function () {
  "use strict";
  const A11Y_CONFIG = window.RTL_PRO_ACCESSIBILITY || {};
  if (!A11Y_CONFIG.enabled) return;
  const STORAGE_KEY = "rtl_pro_a11y_settings";

  class AccessibilityWidget {
    constructor() {
      this.settings = this.loadSettings();
      this.panel = null;
      this.readingGuide = null;
    }
    init() {
      if (A11Y_CONFIG.showWidget) { this.createToggleButton(); this.createPanel(); }
      if (A11Y_CONFIG.showStatement) { this.createStatementModal(); }
      this.createReadingGuide();
      this.applySettings();
    }
    loadSettings() {
      try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : this.getDefaults(); }
      catch { return this.getDefaults(); }
    }
    saveSettings() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch {} }
    getDefaults() { return { fontSize: 0, highContrast: false, grayscale: false, highlightLinks: false, largeCursor: false, readingGuide: false, stopAnimations: false, textSpacing: false }; }
    createToggleButton() {
      const btn = document.createElement("button");
      btn.className = `rtl-pro-a11y-toggle ${A11Y_CONFIG.position || "bottom-left"}`;
      btn.style.backgroundColor = A11Y_CONFIG.color || "#0066CC";
      btn.setAttribute("aria-label", "תפריט נגישות");
      btn.setAttribute("title", "נגישות");
      btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="4" r="2" fill="white"/><path d="M12 7c-3 0-5.5 1-7 2l1.5 2c1.2-.8 3.2-1.5 5.5-1.5s4.3.7 5.5 1.5L19 9c-1.5-1-4-2-7-2z" fill="white"/><path d="M10 11v3H8v6h3v-6h2v6h3v-6h-2v-3h-4z" fill="white"/></svg>';
      btn.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(btn);
    }

    createPanel() {
      const panel = document.createElement("div");
      panel.className = `rtl-pro-a11y-panel ${A11Y_CONFIG.position || "bottom-left"}`;
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "הגדרות נגישות");
      panel.innerHTML = `
        <div class="rtl-pro-a11y-header"><h3>♿ הגדרות נגישות</h3><button class="rtl-pro-a11y-close" aria-label="סגור">&times;</button></div>
        <div class="rtl-pro-a11y-body">
          <div class="rtl-pro-a11y-group"><div class="rtl-pro-a11y-group-title">📝 תוכן</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;justify-content:space-between;">
              <span style="font-size:14px;">גודל טקסט</span>
              <div class="rtl-pro-a11y-size-controls">
                <button class="rtl-pro-a11y-size-btn" data-action="decrease-font" aria-label="הקטן טקסט">א-</button>
                <span data-display="font-size" style="min-width:30px;text-align:center;">100%</span>
                <button class="rtl-pro-a11y-size-btn" data-action="increase-font" aria-label="הגדל טקסט">א+</button>
              </div></div>
            <button class="rtl-pro-a11y-btn" data-feature="textSpacing"><span class="rtl-pro-a11y-btn-icon">↔️</span><span class="rtl-pro-a11y-btn-label">ריווח טקסט</span></button>
          </div>          <div class="rtl-pro-a11y-group"><div class="rtl-pro-a11y-group-title">🎨 תצוגה</div>
            <button class="rtl-pro-a11y-btn" data-feature="highContrast"><span class="rtl-pro-a11y-btn-icon">◐</span><span class="rtl-pro-a11y-btn-label">ניגודיות גבוהה</span></button>
            <button class="rtl-pro-a11y-btn" data-feature="grayscale"><span class="rtl-pro-a11y-btn-icon">🔲</span><span class="rtl-pro-a11y-btn-label">גווני אפור</span></button>
            <button class="rtl-pro-a11y-btn" data-feature="highlightLinks"><span class="rtl-pro-a11y-btn-icon">🔗</span><span class="rtl-pro-a11y-btn-label">הדגש קישורים</span></button>
          </div>
          <div class="rtl-pro-a11y-group"><div class="rtl-pro-a11y-group-title">🖱️ ניווט</div>
            <button class="rtl-pro-a11y-btn" data-feature="largeCursor"><span class="rtl-pro-a11y-btn-icon">🖱️</span><span class="rtl-pro-a11y-btn-label">סמן גדול</span></button>
            <button class="rtl-pro-a11y-btn" data-feature="readingGuide"><span class="rtl-pro-a11y-btn-icon">📏</span><span class="rtl-pro-a11y-btn-label">סרגל קריאה</span></button>
            <button class="rtl-pro-a11y-btn" data-feature="stopAnimations"><span class="rtl-pro-a11y-btn-icon">⏸️</span><span class="rtl-pro-a11y-btn-label">עצור אנימציות</span></button>
          </div>
          <button class="rtl-pro-a11y-reset" data-action="reset">🔄 איפוס הגדרות</button>
        </div>
        ${A11Y_CONFIG.showStatement ? '<a class="rtl-pro-a11y-statement-link" data-action="show-statement">📋 הצהרת נגישות</a>' : ""}`;

      panel.querySelector(".rtl-pro-a11y-close").addEventListener("click", () => this.togglePanel());
      panel.querySelectorAll("[data-feature]").forEach((btn) => {
        btn.addEventListener("click", () => { const f = btn.dataset.feature; this.settings[f] = !this.settings[f]; this.saveSettings(); this.applySettings(); this.updateButtonStates(); });
      });
      panel.querySelector('[data-action="increase-font"]').addEventListener("click", () => { if (this.settings.fontSize < 5) { this.settings.fontSize++; this.saveSettings(); this.applySettings(); this.updateFontDisplay(); } });
      panel.querySelector('[data-action="decrease-font"]').addEventListener("click", () => { if (this.settings.fontSize > -3) { this.settings.fontSize--; this.saveSettings(); this.applySettings(); this.updateFontDisplay(); } });
      panel.querySelector('[data-action="reset"]').addEventListener("click", () => { this.settings = this.getDefaults(); this.saveSettings(); this.applySettings(); this.updateButtonStates(); this.updateFontDisplay(); });
      const sl = panel.querySelector('[data-action="show-statement"]'); if (sl) { sl.addEventListener("click", () => this.showStatement()); }
      document.body.appendChild(panel); this.panel = panel; this.updateButtonStates(); this.updateFontDisplay();
    }
    togglePanel() { if (this.panel) { this.panel.classList.toggle("active"); } }
    updateButtonStates() { if (!this.panel) return; this.panel.querySelectorAll("[data-feature]").forEach((btn) => { btn.classList.toggle("active", !!this.settings[btn.dataset.feature]); }); }
    updateFontDisplay() { if (!this.panel) return; const d = this.panel.querySelector('[data-display="font-size"]'); if (d) { d.textContent = `${100 + this.settings.fontSize * 10}%`; } }

    applySettings() {
      const body = document.body;
      document.documentElement.style.fontSize = `${16 + this.settings.fontSize * 2}px`;
      body.classList.toggle("rtl-pro-high-contrast", this.settings.highContrast);
      body.classList.toggle("rtl-pro-grayscale", this.settings.grayscale);
      body.classList.toggle("rtl-pro-highlight-links", this.settings.highlightLinks);
      body.classList.toggle("rtl-pro-large-cursor", this.settings.largeCursor);
      if (this.readingGuide) { this.readingGuide.classList.toggle("active", this.settings.readingGuide); }
      body.classList.toggle("rtl-pro-stop-animations", this.settings.stopAnimations);
      body.classList.toggle("rtl-pro-text-spacing", this.settings.textSpacing);
    }

    createReadingGuide() {
      const guide = document.createElement("div"); guide.className = "rtl-pro-reading-guide";
      const line = document.createElement("div"); line.className = "rtl-pro-reading-guide-line"; guide.appendChild(line);
      document.body.appendChild(guide); this.readingGuide = guide;
      document.addEventListener("mousemove", (e) => { if (this.settings.readingGuide) { line.style.top = `${e.clientY - 20}px`; } });
    }
    createStatementModal() {
      const cn = A11Y_CONFIG.companyName || A11Y_CONFIG.shopName || "החנות";
      const email = A11Y_CONFIG.contactEmail || "";
      const phone = A11Y_CONFIG.contactPhone || "";
      const officer = A11Y_CONFIG.accessibilityOfficer || "";
      const lastUpdated = A11Y_CONFIG.lastUpdated || new Date().toISOString().split("T")[0];
      const overlay = document.createElement("div"); overlay.className = "rtl-pro-a11y-modal-overlay";
      overlay.innerHTML = `<div class="rtl-pro-a11y-modal">
        <div class="rtl-pro-a11y-modal-header"><h2>הצהרת נגישות</h2><button class="rtl-pro-a11y-close" aria-label="סגור">&times;</button></div>
        <div class="rtl-pro-a11y-modal-body">
          <h3>כללי</h3><p>${cn} מחויבים להנגשת האתר לאנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998.</p>
          <h3>רמת הנגישות</h3><p>אנו שואפים לעמוד בדרישות תקן הנגישות הישראלי (תקן ישראלי 5568) המבוסס על תקן WCAG 2.1 ברמה AA.</p>
          <h3>התאמות הנגישות שבוצעו</h3><ul><li>התאמת האתר לטכנולוגיות מסייעות</li><li>ניווט באמצעות מקלדת</li><li>התאמת צבעים וניגודיות</li><li>תיאור טקסטואלי לתמונות</li><li>שינוי גודל טקסט</li><li>תמיכה בתצוגת RTL</li><li>מבנה כותרות היררכי</li><li>התאמת טפסים</li></ul>
          <h3>דפדפנים נתמכים</h3><p>Chrome, Firefox, Safari, Edge.</p>
          <h3>יצירת קשר</h3><p>אם נתקלתם בבעיית נגישות, צרו קשר:</p>
          ${officer ? `<p><strong>רכז/ת נגישות:</strong> ${officer}</p>` : ""}
          ${email ? `<p><strong>אימייל:</strong> <a href="mailto:${email}">${email}</a></p>` : ""}
          ${phone ? `<p><strong>טלפון:</strong> <a href="tel:${phone}">${phone}</a></p>` : ""}
          <h3>תאריך עדכון</h3><p>הצהרת נגישות זו עודכנה לאחרונה בתאריך ${lastUpdated}.</p>
        </div></div>`;
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("active"); });
      overlay.querySelector(".rtl-pro-a11y-close").addEventListener("click", () => overlay.classList.remove("active"));
      document.body.appendChild(overlay); this.statementModal = overlay;
    }
    showStatement() { if (this.statementModal) { this.statementModal.classList.add("active"); if (this.panel) this.panel.classList.remove("active"); } }
  }

  function init() { const widget = new AccessibilityWidget(); widget.init(); window.RTLProAccessibility = widget; }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();