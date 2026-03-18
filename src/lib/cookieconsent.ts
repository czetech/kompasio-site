import "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import "../styles/cookieconsent.css";
import content from "../../content/cookieconsent.yaml";

const BASE_URL = "https://kompasio.sk";
const CONSENT_ENDPOINT = `${BASE_URL}/app/sk/map/cookies/store-consent`;
const GTM_ID = "GTM-WLZ82XGH";

let cookieConsent: ReturnType<typeof initCookieConsent>;

export const runCookieConsent = () => {
  function gtag() {
    dataLayer.push(arguments);
  }

  const updateGTM = (cookie) => {
    console.log("updateGTM", cookie);
    const isAnalytics = cookie.level.includes("analytics");

    gtag("consent", "update", {
      analytics_storage: isAnalytics ? "granted" : "denied",
    });
  };

  const storeConsent = async (cookie, currentData) => {
    try {
      const response = await fetch(CONSENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: currentData?.id,
          cookie: cookie,
          url: window.location.href,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        cookieConsent.set("data", {
          value: { id: responseData.id },
        });
      }
    } catch (error) {
      console.error("[Cookie Consent] Failed to store consent:", error);
    }
  };

  window.dataLayer ??= [];
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });

  cookieConsent = initCookieConsent();
  cookieConsent.run({
    cookie_expiration: 365,
    cookie_necessary_only_expiration: 91,
    // cookie_domain: "kompasio.sk",
    current_lang: "sk",
    autoclear_cookies: true,

    onAccept: (cookie) => {
      updateGTM(cookie);
    },

    onChange: (cookie, changed_categories) => {
      updateGTM(cookie);
      storeConsent(cookie, cookieConsent.get("data"));
    },

    onFirstAction: (user_preferences, cookie) => {
      storeConsent(cookie);
    },

    languages: {
      sk: {
        consent_modal: {
          title: content.consentTitle,
          description: `${content.consentDescription}<br><button type="button" data-cc="c-settings" class="cc-link" style="margin-top: 0.5rem">${content.consentSettingsButton}</button>`,
          primary_btn: {
            text: content.consentPrimaryButton,
            role: "accept_all",
          },
          secondary_btn: {
            text: content.consentSecondaryButton,
            role: "accept_necessary",
          },
        },
        settings_modal: {
          title: content.settingsTitle,
          save_settings_btn: content.settingsSaveButton,
          accept_all_btn: content.settingsAcceptAllButton,
          reject_all_btn: content.settingsRejectAllButton,
          close_btn_label: content.settingsCloseButton,
          cookie_table_headers: [
            { col1: content.settingsTableCol1 },
            { col2: content.settingsTableCol2 },
            { col3: content.settingsTableCol3 },
            { col4: content.settingsTableCol4 },
          ],
          blocks: [
            {
              title: content.settingsBlocksUsageTitle,
              description: content.settingsBlocksUsageDescription,
            },
            {
              title: content.settingsBlocksNecessaryTitle,
              description: content.settingsBlocksNecessaryDescription,
              toggle: {
                value: "necessary",
                enabled: true,
                readonly: true,
              },
              cookie_table: [
                {
                  col1: content.settingsBlocksNecessaryCookie1Col1,
                  col2: content.settingsBlocksNecessaryCookie1Col2,
                  col3: content.settingsBlocksNecessaryCookie1Col3,
                  col4: content.settingsBlocksNecessaryCookie1Col4,
                },
                {
                  col1: content.settingsBlocksNecessaryCookie2Col1,
                  col2: content.settingsBlocksNecessaryCookie2Col2,
                  col3: content.settingsBlocksNecessaryCookie2Col3,
                  col4: content.settingsBlocksNecessaryCookie2Col4,
                },
              ],
            },
            {
              title: content.settingsBlocksAnalyticsTitle,
              description: content.settingsBlocksAnalyticsDescription,
              toggle: {
                value: "analytics",
                enabled: false,
                readonly: false,
              },
              cookie_table: [
                {
                  col1: content.settingsBlocksAnalyticsCookie1Col1,
                  col2: content.settingsBlocksAnalyticsCookie1Col2,
                  col3: content.settingsBlocksAnalyticsCookie1Col3,
                  col4: content.settingsBlocksAnalyticsCookie1Col4,
                  is_regex: true,
                },
                {
                  col1: content.settingsBlocksAnalyticsCookie2Col1,
                  col2: content.settingsBlocksAnalyticsCookie2Col2,
                  col3: content.settingsBlocksAnalyticsCookie2Col3,
                  col4: content.settingsBlocksAnalyticsCookie2Col4,
                },
              ],
            },
            {
              title: content.settingsBlocksInfoTitle,
              description: content.settingsBlocksInfoDescription,
            },
          ],
        },
      },
    },
  });

  dataLayer.push({
    event: "gtm.js",
    "gtm.start": new Date().getTime(),
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runCookieConsent);
} else {
  runCookieConsent();
}

document.addEventListener("astro:page-load", () => {
  document.querySelectorAll("[data-cc='c-settings']").forEach((el) => {
    el.addEventListener("click", () => cookieConsent.showSettings());
  });
});
