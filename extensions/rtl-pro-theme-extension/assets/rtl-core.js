/**
 * RTL Pro - Core JavaScript Engine
 * Handles RTL transformation, translation, font loading, payment icons,
 * postcode detection, and dynamic content observation.
 */

(function () {
  "use strict";

  const CONFIG = window.RTL_PRO_CONFIG || {};
  if (!CONFIG.rtlEnabled && !CONFIG.translationEnabled) return;

  // =============================================
  // Hebrew Translations Dictionary
  // =============================================
  const TRANSLATIONS = {
    // Buttons
    "Add to cart": "הוסף לסל",
    "Add to Cart": "הוסף לסל",
    "ADD TO CART": "הוסף לסל",
    "Buy it now": "קנה עכשיו",
    "Buy now": "קנה עכשיו",
    "BUY IT NOW": "קנה עכשיו",
    "BUY NOW": "קנה עכשיו",
    Checkout: "לתשלום",
    "Check out": "לתשלום",
    "View cart": "צפה בסל",
    "View Cart": "צפה בסל",
    "Continue shopping": "המשך לקנות",
    "Continue Shopping": "המשך לקנות",
    "Update cart": "עדכן סל",
    Subscribe: "הרשם",
    "Sign up": "הרשמה",
    "Sign in": "התחברות",
    "Log in": "התחברות",
    "Log out": "התנתקות",
    "Sign out": "התנתקות",
    Submit: "שלח",
    Send: "שלח",
    Apply: "החל",
    Remove: "הסר",
    Cancel: "ביטול",
    Close: "סגור",
    Save: "שמור",
    Search: "חיפוש",
    "Load more": "טען עוד",
    "Show more": "הצג עוד",
    "Read more": "קרא עוד",
    "View all": "צפה בהכל",
    "See all": "צפה בהכל",
    "Select options": "בחר אפשרויות",
    "Choose options": "בחר אפשרויות",
    "Quick view": "תצוגה מהירה",
    "Sold out": "אזל מהמלאי",
    "SOLD OUT": "אזל מהמלאי",
    Unavailable: "לא זמין",
    "Notify me": "הודע לי",
    "Pre-order": "הזמנה מוקדמת",
    "Clear all": "נקה הכל",
    Reset: "איפוס",
    Filter: "סינון",
    Sort: "מיון",

    // Navigation
    Home: "עמוד הבית",
    Shop: "חנות",
    "Shop all": "כל המוצרים",
    Collections: "קולקציות",
    Products: "מוצרים",
    "All products": "כל המוצרים",
    "New arrivals": "חדשים",
    "Best sellers": "הנמכרים ביותר",
    Sale: "מבצעים",
    About: "אודות",
    "About us": "אודותינו",
    Contact: "צור קשר",
    "Contact us": "צור קשר",
    Blog: "בלוג",
    FAQ: "שאלות נפוצות",
    Help: "עזרה",
    Support: "תמיכה",
    "Terms of service": "תנאי שירות",
    "Privacy policy": "מדיניות פרטיות",
    "Refund policy": "מדיניות החזרות",
    "Shipping policy": "מדיניות משלוחים",
    "My account": "החשבון שלי",
    Account: "חשבון",
    Orders: "הזמנות",
    Cart: "סל קניות",
    Menu: "תפריט",
    "Gift cards": "כרטיסי מתנה",
    Catalog: "קטלוג",

    // Product
    Price: "מחיר",
    Quantity: "כמות",
    Size: "מידה",
    Color: "צבע",
    Material: "חומר",
    Brand: "מותג",
    "In stock": "במלאי",
    "Out of stock": "אזל מהמלאי",
    Description: "תיאור",
    Details: "פרטים",
    Reviews: "ביקורות",
    "Write a review": "כתוב ביקורת",
    "You may also like": "אולי תאהב גם",
    "Recently viewed": "נצפו לאחרונה",
    "Related products": "מוצרים קשורים",
    "Free shipping": "משלוח חינם",
    "Tax included": 'כולל מע"מ',

    // Cart
    "Your cart": "סל הקניות שלך",
    "Shopping cart": "סל קניות",
    "Your cart is empty": "סל הקניות שלך ריק",
    Item: "פריט",
    Items: "פריטים",
    'Subtotal': 'סה"כ ביניים',
    'Total': 'סה"כ',
    Discount: "הנחה",
    "Discount code": "קוד הנחה",
    "Coupon code": "קוד קופון",
    Taxes: "מיסים",
    Shipping: "משלוח",
    "Calculated at checkout": "יחושב בתשלום",
    Free: "חינם",
    "Order note": "הערה להזמנה",
    "Continue to checkout": "המשך לתשלום",

    // Account
    "Create account": "צור חשבון",
    Register: "הרשמה",
    Login: "התחברות",
    Password: "סיסמה",
    "Forgot password": "שכחתי סיסמה",
    "Reset password": "איפוס סיסמה",
    "First name": "שם פרטי",
    "Last name": "שם משפחה",
    Email: "אימייל",
    Phone: "טלפון",

    // Search
    "Search our store": "חפש בחנות שלנו",
    "Search results": "תוצאות חיפוש",
    "No results found": "לא נמצאו תוצאות",
    "Popular searches": "חיפושים פופולריים",

    // Footer
    Newsletter: "ניוזלטר",
    "Subscribe to our newsletter": "הרשם לניוזלטר שלנו",
    "Enter your email": "הכנס את האימייל שלך",
    "Follow us": "עקוב אחרינו",
    "Customer service": "שירות לקוחות",
    "Quick links": "קישורים מהירים",
    "All rights reserved": "כל הזכויות שמורות",
    "Powered by Shopify": "מופעל על ידי Shopify",

    // Filters
    "Filter by": "סנן לפי",
    "Sort by": "מיין לפי",
    "Best selling": "הנמכרים ביותר",
    "Alphabetically, A-Z": "אלפביתי, א-ת",
    "Alphabetically, Z-A": "אלפביתי, ת-א",
    "Price, low to high": "מחיר, מהנמוך לגבוה",
    "Price, high to low": "מחיר, מהגבוה לנמוך",
    "Date, new to old": "תאריך, מהחדש לישן",
    "Date, old to new": "תאריך, מהישן לחדש",
    Featured: "מומלצים",

    // Accessibility
    "Skip to content": "דלג לתוכן",
    "Close menu": "סגור תפריט",

    // General
    or: "או",
    from: "מ",
    Loading: "טוען...",
  };

  // =============================================
  // RTL Layout Manager
  // =============================================
  class RTLManager {
    constructor() {
      this.isRTL = CONFIG.rtlEnabled;
      this.translations = { ...TRANSLATIONS };

      // Override with custom button texts
      if (CONFIG.buyNowText) {
        this.translations["Buy it now"] = CONFIG.buyNowText;
        this.translations["Buy now"] = CONFIG.buyNowText;
        this.translations["BUY IT NOW"] = CONFIG.buyNowText;
        this.translations["BUY NOW"] = CONFIG.buyNowText;
      }
      if (CONFIG.addToCartText) {
        this.translations["Add to cart"] = CONFIG.addToCartText;
        this.translations["Add to Cart"] = CONFIG.addToCartText;
        this.translations["ADD TO CART"] = CONFIG.addToCartText;
      }
    }

    init() {
      // Apply RTL direction
      if (this.isRTL) {
        this.applyRTL();
      }

      // Apply translations
      if (CONFIG.translationEnabled) {
        this.translatePage();
      }

      // Apply custom font
      if (CONFIG.fontEnabled && CONFIG.fontFamily) {
        this.applyFont();
      }

      // Payment icons
      if (CONFIG.paymentIconsEnabled) {
        this.addPaymentIcons();
      }

      // Postcode detection
      if (CONFIG.postcodeDetection) {
        this.setupPostcodeDetection();
      }

      // Observe DOM changes for dynamic content
      this.observeDOM();

      // Mark as loaded
      document.body.classList.add("rtl-pro-loaded");
    }

    // ---- RTL Application ---- //
    applyRTL() {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "he");
      document.body.setAttribute("dir", "rtl");

      // Fix any inline styles that set direction
      const elementsWithLTR = document.querySelectorAll('[style*="direction: ltr"]');
      elementsWithLTR.forEach((el) => {
        // Don't override inputs that need LTR (emails, numbers, etc.)
        if (
          el.tagName === "INPUT" &&
          ["email", "url", "tel", "number"].includes(el.type)
        ) {
          return;
        }
        el.style.direction = "rtl";
      });

      // Fix text-align: left to text-align: right
      const elementsWithLeftAlign = document.querySelectorAll('[style*="text-align: left"]');
      elementsWithLeftAlign.forEach((el) => {
        el.style.textAlign = "right";
      });

      // Handle CSS custom properties
      document.documentElement.style.setProperty("--rtl-direction", "rtl");
      document.documentElement.style.setProperty("--rtl-text-align", "right");
      document.documentElement.style.setProperty("--rtl-float", "right");
      document.documentElement.style.setProperty("--rtl-margin-start", "margin-right");
    }

    // ---- Translation Engine ---- //
    translatePage() {
      this.translateTextNodes(document.body);
      this.translatePlaceholders();
      this.translateAriaLabels();
      this.translateTitles();
      this.translateMetaTags();
    }

    translateTextNodes(root) {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip script and style elements
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
              return NodeFilter.FILTER_REJECT;
            }
            // Only process nodes with actual text
            if (node.textContent.trim().length === 0) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const nodesToTranslate = [];
      while (walker.nextNode()) {
        nodesToTranslate.push(walker.currentNode);
      }

      nodesToTranslate.forEach((node) => {
        const text = node.textContent.trim();
        if (this.translations[text]) {
          node.textContent = node.textContent.replace(text, this.translations[text]);
        }
      });
    }

    translatePlaceholders() {
      const inputs = document.querySelectorAll("[placeholder]");
      inputs.forEach((input) => {
        const placeholder = input.getAttribute("placeholder");
        if (this.translations[placeholder]) {
          input.setAttribute("placeholder", this.translations[placeholder]);
        }
      });
    }

    translateAriaLabels() {
      const elements = document.querySelectorAll("[aria-label]");
      elements.forEach((el) => {
        const label = el.getAttribute("aria-label");
        if (this.translations[label]) {
          el.setAttribute("aria-label", this.translations[label]);
        }
      });
    }

    translateTitles() {
      const elements = document.querySelectorAll("[title]");
      elements.forEach((el) => {
        const title = el.getAttribute("title");
        if (this.translations[title]) {
          el.setAttribute("title", this.translations[title]);
        }
      });
    }

    translateMetaTags() {
      // Translate meta description if needed
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const content = metaDesc.getAttribute("content");
        if (this.translations[content]) {
          metaDesc.setAttribute("content", this.translations[content]);
        }
      }
    }

    // ---- Font Application ---- //
    applyFont() {
      const fontFamily = CONFIG.fontFamily;
      const fontSize = CONFIG.fontSize || 16;

      document.documentElement.style.setProperty(
        "--rtl-pro-font-family",
        `'${fontFamily}', sans-serif`
      );

      const style = document.createElement("style");
      style.textContent = `
        body, body * {
          font-family: '${fontFamily}', sans-serif !important;
        }
        body {
          font-size: ${fontSize}px;
        }
      `;
      document.head.appendChild(style);
    }

    // ---- Payment Icons ---- //
    addPaymentIcons() {
      const paymentMethods = [
        { name: "Visa", svg: this.getPaymentSVG("visa") },
        { name: "Mastercard", svg: this.getPaymentSVG("mastercard") },
        { name: "American Express", svg: this.getPaymentSVG("amex") },
        { name: "PayPal", svg: this.getPaymentSVG("paypal") },
        { name: "Apple Pay", svg: this.getPaymentSVG("apple-pay") },
        { name: "Google Pay", svg: this.getPaymentSVG("google-pay") },
        { name: "Bit", svg: this.getPaymentSVG("bit") },
      ];

      const container = document.createElement("div");
      container.className = "rtl-pro-payment-icons";
      container.setAttribute("role", "list");
      container.setAttribute("aria-label", "אמצעי תשלום מקובלים");

      paymentMethods.forEach((method) => {
        const item = document.createElement("span");
        item.className = "rtl-pro-payment-icon";
        item.setAttribute("role", "listitem");
        item.setAttribute("aria-label", method.name);
        item.innerHTML = method.svg;
        container.appendChild(item);
      });

      // Add to footer
      const footer = document.querySelector("footer, .footer, #footer");
      if (footer) {
        footer.appendChild(container);
      }
    }

    getPaymentSVG(type) {
      const svgs = {
        visa: '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#1A1F71"/><text x="20" y="16" fill="white" font-size="10" text-anchor="middle" font-weight="bold">VISA</text></svg>',
        mastercard: '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#252525"/><circle cx="16" cy="12.5" r="7" fill="#EB001B"/><circle cx="24" cy="12.5" r="7" fill="#F79E1B" opacity="0.8"/></svg>',
        amex: '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#2E77BC"/><text x="20" y="16" fill="white" font-size="7" text-anchor="middle" font-weight="bold">AMEX</text></svg>',
        paypal: '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#003087"/><text x="20" y="16" fill="white" font-size="8" text-anchor="middle" font-weight="bold">PayPal</text></svg>',
        "apple-pay": '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#000"/><text x="20" y="16" fill="white" font-size="8" text-anchor="middle">Pay</text></svg>',
        "google-pay": '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#fff" stroke="#ddd"/><text x="20" y="16" fill="#5F6368" font-size="7" text-anchor="middle" font-weight="bold">GPay</text></svg>',
        bit: '<svg width="40" height="25" viewBox="0 0 40 25" fill="none"><rect width="40" height="25" rx="3" fill="#3CC8C8"/><text x="20" y="16" fill="white" font-size="10" text-anchor="middle" font-weight="bold">bit</text></svg>',
      };
      return svgs[type] || "";
    }

    // ---- Postcode Detection ---- //
    setupPostcodeDetection() {
      // Watch for postcode/zip inputs
      const observer = new MutationObserver(() => {
        this.attachPostcodeListeners();
      });

      observer.observe(document.body, { childList: true, subtree: true });
      this.attachPostcodeListeners();
    }

    attachPostcodeListeners() {
      const postcodeInputs = document.querySelectorAll(
        'input[name*="zip"], input[name*="postal"], input[name*="postcode"], input[autocomplete="postal-code"], input[id*="zip"], input[id*="postal"]'
      );

      postcodeInputs.forEach((input) => {
        if (input.dataset.rtlProPostcode) return;
        input.dataset.rtlProPostcode = "true";

        input.addEventListener("input", (e) => {
          const value = e.target.value.replace(/\D/g, "");
          if (value.length >= 2) {
            this.lookupPostcode(value, input);
          }
        });
      });
    }

    async lookupPostcode(code, input) {
      const postcodeMap = {
        61: "תל אביב-יפו", 62: "תל אביב-יפו", 63: "תל אביב-יפו",
        64: "תל אביב-יפו", 65: "תל אביב-יפו", 66: "תל אביב-יפו",
        67: "תל אביב-יפו", 68: "תל אביב-יפו", 69: "תל אביב-יפו",
        91: "ירושלים", 92: "ירושלים", 93: "ירושלים",
        94: "ירושלים", 95: "ירושלים", 96: "ירושלים",
        31: "חיפה", 32: "חיפה", 33: "חיפה", 34: "חיפה", 35: "חיפה",
        84: "באר שבע", 85: "באר שבע",
        42: "נתניה", 75: "ראשון לציון", 49: "פתח תקווה",
        77: "אשדוד", 46: "הרצליה", 52: "רמת גן",
        58: "חולון", 51: "בני ברק", 59: "בת ים",
        76: "רחובות", 78: "אשקלון", 44: "כפר סבא",
        43: "רעננה", 71: "מודיעין", 88: "אילת",
        16: "נצרת", 24: "עכו", 14: "טבריה",
        20: "כרמיאל", 30: "חדרה", 40: "רמלה",
        70: "לוד", 79: "קרית גת", 83: "ערד",
        87: "דימונה", 22: "נהריה",
      };

      const prefix = code.substring(0, 2);
      const city = postcodeMap[prefix];

      if (city) {
        // Find city input near the postcode input
        const form = input.closest("form");
        if (form) {
          const cityInput = form.querySelector(
            'input[name*="city"], input[name*="City"], select[name*="city"], input[autocomplete="address-level2"]'
          );
          if (cityInput) {
            if (cityInput.tagName === "SELECT") {
              // Try to find matching option
              const options = cityInput.querySelectorAll("option");
              options.forEach((opt) => {
                if (opt.textContent.includes(city) || opt.value.includes(city)) {
                  cityInput.value = opt.value;
                  cityInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
              });
            } else {
              cityInput.value = city;
              cityInput.dispatchEvent(new Event("input", { bubbles: true }));
              cityInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }

        // Also set country to Israel
        if (form) {
          const countrySelect = form.querySelector(
            'select[name*="country"], select[autocomplete="country"]'
          );
          if (countrySelect) {
            const israelOption = Array.from(countrySelect.options).find(
              (opt) =>
                opt.value === "IL" ||
                opt.value === "Israel" ||
                opt.textContent.includes("Israel") ||
                opt.textContent.includes("ישראל")
            );
            if (israelOption) {
              countrySelect.value = israelOption.value;
              countrySelect.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
      }
    }

    // ---- DOM Observer (for dynamic content) ---- //
    observeDOM() {
      const observer = new MutationObserver((mutations) => {
        let needsTranslation = false;

        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                needsTranslation = true;

                // Apply RTL to new elements
                if (this.isRTL && node.style) {
                  if (node.style.direction === "ltr") {
                    node.style.direction = "rtl";
                  }
                }
              }
            });
          }
        });

        if (needsTranslation && CONFIG.translationEnabled) {
          // Debounce translation
          clearTimeout(this._translateTimeout);
          this._translateTimeout = setTimeout(() => {
            this.translatePage();
          }, 100);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  // =============================================
  // Initialize
  // =============================================
  function init() {
    const rtlManager = new RTLManager();
    rtlManager.init();
    window.RTLPro = rtlManager;
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Also handle Shopify's section rendering events
  document.addEventListener("shopify:section:load", () => {
    if (window.RTLPro) {
      if (CONFIG.rtlEnabled) window.RTLPro.applyRTL();
      if (CONFIG.translationEnabled) window.RTLPro.translatePage();
    }
  });

  document.addEventListener("shopify:section:reorder", () => {
    if (window.RTLPro && CONFIG.translationEnabled) {
      window.RTLPro.translatePage();
    }
  });
})();
