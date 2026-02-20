# GA4 Event Tracking Documentation

Complete list of all Google Analytics 4 events tracked across The Traveling Church website and the Vagabond Bible landing page.

All events use the `window.gtag?.('event', ...)` optional chaining pattern to ensure zero breakage if GA4 fails to load.

---

## Vagabond Bible Landing Page (`/vagabond-bible`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `start_studying` | Hero section — "Start Studying" button (gold CTA) | User clicks to open Pastor Chat | Key Event |
| `start_reading` | Hero section — "Start Reading" button (outline CTA) | User clicks to open Bible Reader | Key Event |
| `click_app_store` | Download section — App Store badge | User clicks to go to Apple App Store listing | Key Event |
| `click_google_play` | Download section — Google Play badge | User clicks Google Play button (currently "Coming Soon") | Key Event |
| `click_try_free_bottom` | Bottom CTA section — "Try It Free" button | User clicks the final call-to-action to try the app | Key Event |
| `click_login_signup` | Header nav — Login/Sign Up button (desktop + mobile) | User clicks to go to login page | Key Event |
| `click_join_church` | Community section — "Join The Traveling Church" button | User clicks to visit thetravelingchurch.com | Regular Event |
| `nav_click_features` | Header nav — "Features" link (desktop + mobile) | User clicks to scroll to Features section | Regular Event |
| `nav_click_about` | Header nav — "About" link (desktop + mobile) | User clicks to scroll to About section | Regular Event |
| `nav_click_community` | Header nav — "Community" link (desktop + mobile) | User clicks to scroll to Community section | Regular Event |
| `nav_click_contact` | Header nav — "Contact" link (desktop + mobile) | User clicks to scroll to Contact section | Regular Event |
| `footer_click_features` | Footer — "Features" quick link | User clicks Features link in footer | Regular Event |
| `footer_click_about` | Footer — "About" quick link | User clicks About link in footer | Regular Event |
| `footer_click_community` | Footer — "Community" quick link | User clicks Community link in footer | Regular Event |
| `click_contact_footer` | Footer — email address link | User clicks to email pastorbrett@thetravelingchurch.com | Regular Event |

---

## The Traveling Church — Home Page (`/`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `click_whatsapp_join` | WhatsApp section — "Join Whatsapp" button | User clicks to join WhatsApp community group | Key Event |
| `click_give_onetime` | Donate section — "Give Now" button | User clicks to view donation/programs page | Key Event |
| `submit_contact_form` | Contact form — "Send Message" button | User submits the contact form | Key Event |

---

## The Traveling Church — Missions Page (`/missions`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `click_mission_explore` | Mission cards (Jordan, Israel, Cambodia, etc.) | User clicks any mission card to explore details | Regular Event |

---

## The Traveling Church — Programs Page (`/programs`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `click_program_learn_more` | Program cards — "Learn More" link | User clicks any program card to view details | Regular Event |
| `click_daf_giving` | DAF section — "DAF Giving Instructions" button | User clicks to view Donor-Advised Fund instructions | Regular Event |

---

## The Traveling Church — Services Page (`/find-a-service`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `click_view_services` | Hero section — "View Service Times" button | User clicks to scroll down to service times | Regular Event |
| `click_add_calendar` | Service cards — "Add to Calendar" dropdown options | User adds any service to Google/Apple/Outlook/Other calendar | Regular Event |
| `click_whatsapp_join` | Sticky footer — "Checkout the WhatsApp Group" button | User clicks to join WhatsApp from services page | Key Event |

---

## The Traveling Church — Keep Us Alive / Support Page (`/keep-us-alive`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `click_give_monthly` | Hero + Bottom CTA — "Become a Monthly Supporter" button (x2) | User clicks to become a monthly donor | Key Event |
| `click_give_onetime` | Hero + Bottom CTA — "Give a One-Time Gift" button (x2) | User clicks to make a one-time donation | Key Event |

---

## The Traveling Church — Join Page (`/join`)

| Event Name | Location | Trigger | Category |
|---|---|---|---|
| `submit_join_church_form` | Join form — "Join Now" button | User submits the church membership signup form | Key Event |
| `click_support_link_join_page` | Below QR code — "Support The Traveling Church" link | User clicks the support/donate link on the join page | Regular Event |

---

## Summary

| Category | Count |
|---|---|
| **Key Events** (High Intent) | 11 |
| **Regular Events** (Engagement) | 14 |
| **Total Events** | **25** |

### Key Events (recommended to mark as Key Events in GA4 Admin):
`start_studying`, `start_reading`, `click_app_store`, `click_google_play`, `click_try_free_bottom`, `click_login_signup`, `click_whatsapp_join`, `click_give_onetime`, `click_give_monthly`, `submit_contact_form`, `submit_join_church_form`

**Note:** `click_whatsapp_join` fires from two locations (Home page WhatsApp section and Services page sticky footer) but is the same event name, counted once above.
