import 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

const BASE_URL = 'https://kompasio.sk';
const CONSENT_ENDPOINT = `${BASE_URL}/app/sk/map/cookies/store-consent`;
const GTM_ID = 'GTM-WLZ82XGH';

export const runCookieConsent = () => {
  function gtag(){dataLayer.push(arguments);}

  const updateGTM = (cookie) => {
    console.log('updateGTM', cookie);
    const isAnalytics = cookie.level.includes('analytics');

    gtag('consent', 'update', {
      'analytics_storage': isAnalytics ? 'granted' : 'denied',
    });
  };

  const storeConsent = async (cookie, currentData) => {
    try {
      const response = await fetch(CONSENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: currentData?.id,
          cookie: cookie,
          url: window.location.href
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        cookieConsent.set('data', {
          value: { id: responseData.id },
        });
      }
    } catch (error) {
      console.error('[Cookie Consent] Failed to store consent:', error);
    }
  };

  window.dataLayer ??= [];
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
  });

  const cookieConsent = initCookieConsent();
  cookieConsent.run({
    cookie_expiration: 365,
    cookie_necessary_only_expiration: 91,
    cookie_domain: "kompasio.sk",
    current_lang: "sk",
    autoclear_cookies: true,

    onAccept: (cookie) => {
      updateGTM(cookie);
    },

    onChange: (cookie, changed_categories) => {
      updateGTM(cookie);
      storeConsent(cookie, cookieConsent.get('data'));
    },

    onFirstAction: (user_preferences, cookie) => {
      storeConsent(cookie);
    },

    languages: {
        sk: {
            consent_modal: {
                title: 'Používame cookies!',
                description: 'Na prevádzku tejto stránky používame cookies. Okrem cookies potrebných na prevádzku stránky používame aj cookies na analýzu používania stránky. <button type="button" data-cc="c-settings" class="cc-link">Nastaviť používanie cookies</button>',
                primary_btn: {
                    text: 'Prijať všetky',
                    role: 'accept_all'
                },
                secondary_btn: {
                    text: 'Zamietnuť všetky',
                    role: 'accept_necessary'
                }
            },
            settings_modal: {
                title: 'Nastavenie cookies',
                save_settings_btn: 'Uložiť nastavenia',
                accept_all_btn: 'Prijať všetky',
                reject_all_btn: 'Zamietnuť všetky',
                close_btn_label: 'Zatvoriť',
                cookie_table_headers: [
                    { col1: 'Názov' },
                    { col2: 'Doména' },
                    { col3: 'Expirácia' },
                    { col4: 'Popis' }
                ],
                blocks: [
                    {
                        title: 'Použitie cookies',
                        description: 'Cookies používame na zabezpečenie základnej funkčnosti našej stránky a taktiež na analýzu návštevnosti stránky. Môžete si vybrať, ktoré cookies môžeme používať a ktoré nie.',
                    },
                    {
                        title: 'Potrebné cookies',
                        description: 'Tieto cookies sú dôležité pre správne fungovanie stránky. Bez nich stránka nebude správne fungovať.',
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true
                        },
                        cookie_table: [
                            {
                                col1: 'cc_cookie',
                                col2: 'kompasio.sk',
                                col3: '6 mesiacov',
                                col4: 'Uloženie súhlasu s cookies'
                            },
                            {
                                col1: 'PHPSESSID',
                                col2: 'kompasio.sk',
                                col3: '7 dní',
                                col4: 'This cookie is native to PHP applications. The cookie stores and identifies a user\'s unique session ID to manage user sessions on the website. The cookie is a session cookie and will be deleted when all the browser windows are closed.'
                            }
                        ]
                    },
                    {
                        title: 'Analytické cookies',
                        description: 'Tieto cookies nám slúžia na sledovanie návštevnosti našej stránky.',
                        toggle: {
                            value: 'analytics',
                            enabled: false,
                            readonly: false
                        },
                        cookie_table: [
                            {
                                col1: '^_ga_',
                                col2: '.kompasio.sk',
                                col3: '1 rok 1 mesiac 4 dni',
                                col4: 'Google Analytics sets this cookie to store and count page views.',
                                is_regex: true
                            },
                            {
                                col1: '_ga',
                                col2: '.kompasio.sk',
                                col3: '1 rok 1 mesiac 4 dni',
                                col4: 'Google Analytics sets this cookie to calculate visitor, session and campaign data and track site usage for the site\'s analytics report. The cookie stores information anonymously and assigns a randomly generated number to recognise unique visitors.'
                            }
                        ]
                    },
                    {
                        title: 'Viac informácií',
                        description: 'Ak máte dotazy ohľadom cookies, môžete nás <a class="cc-link" href="https://kompasio.sk/app/sk/map/contact/">kontaktovať</a>.',
                    }
                ]
            }
        }
    }
  });
  
  dataLayer.push({
    event: 'gtm.js',
    'gtm.start': new Date().getTime(),
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runCookieConsent);
} else {
  runCookieConsent();
}
