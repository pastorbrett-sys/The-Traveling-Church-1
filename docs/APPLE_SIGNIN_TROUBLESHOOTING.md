# Apple Sign-In Troubleshooting Checklist

Go through each step below. Check off each one as you verify it.

---

## Step 1: Check if API Keys Were Revoked

**Where:** Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Select your project: `travelingchurch-1b4ab`
3. Click: **APIs & Services** → **Credentials**
4. Look for these API keys:
   - Web key: `AIzaSyD04isY5WpNZqfCPrbfeRJuZWDs8X15k7Q`
   - iOS key: `AIzaSyBgjnAMLSPnq6XahGahmEW3jwppoPQKlgE`
5. Check if either shows "Disabled" or "Revoked"

**Status:** [ ] Both keys are active / [ ] One or both are revoked

---

## Step 2: Check Apple Developer - App ID Has Sign in with Apple

**Where:** Apple Developer Console

1. Go to: https://developer.apple.com/account
2. Click: **Certificates, Identifiers & Profiles**
3. Click: **Identifiers** (left sidebar)
4. Find and click: `com.vagabondbible.app`
5. Scroll down to **Capabilities**
6. Check if **Sign in with Apple** has a checkmark

**Status:** [ ] Sign in with Apple is enabled / [ ] It's not enabled

---

## Step 3: Check Firebase Apple Provider Configuration

**Where:** Firebase Console

1. Go to: https://console.firebase.google.com
2. Select your project
3. Click: **Authentication** → **Sign-in method**
4. Click on **Apple** (the row, not just look at it)
5. Check if there's a **Services ID** configured
6. Check if **OAuth code flow** is set up

**Status:** [ ] Fully configured / [ ] Missing Services ID / [ ] Missing OAuth setup

---

## Step 4: Check Xcode - Sign in with Apple Capability

**Where:** Xcode

1. Open the project in Xcode
2. Click on **App** in the left sidebar (blue icon at top)
3. Click on **App** under TARGETS
4. Click **Signing & Capabilities** tab
5. Look for **Sign in with Apple** in the list

**Status:** [ ] It's there / [ ] It's missing (need to add it with + button)

---

## Step 5: Check Xcode - Provisioning Profile is Correct

**Where:** Xcode

1. Still in **Signing & Capabilities**
2. Look at the **Team** dropdown - correct Apple Developer account?
3. Look for any red warning icons
4. Check that **Automatically manage signing** is enabled

**Status:** [ ] No warnings / [ ] There are warnings

---

## Step 6: Check URL Types in Info.plist

**Where:** Xcode

1. Click on **Info.plist** in the left sidebar
2. Look for **URL types** section
3. Check if this URL scheme exists: `com.googleusercontent.apps.120766949732-5fu6t0hegaaaf8fdqenn2gu0mplghh5e`

**Status:** [ ] URL scheme exists / [ ] It's missing

---

## Results Summary

Write what you found:

- Step 1 (API Keys): 
- Step 2 (Apple App ID): 
- Step 3 (Firebase Apple Config): 
- Step 4 (Xcode Capability): 
- Step 5 (Provisioning Profile): 
- Step 6 (URL Types): 

---

## Common Fixes

### If API key was revoked:
1. Create a new API key in Google Cloud Console
2. Update GoogleService-Info.plist with the new iOS key
3. Rebuild the app

### If Apple App ID doesn't have Sign in with Apple:
1. Enable it in Apple Developer Console
2. Download a new provisioning profile
3. In Xcode: Signing & Capabilities → refresh profiles

### If Firebase Apple is missing Services ID:
1. Create a Services ID in Apple Developer Console
2. Configure it with your Firebase callback URL
3. Add it to Firebase Apple provider settings

### If Xcode capability is missing:
1. Click + Capability
2. Add Sign in with Apple
3. Clean and rebuild

### If URL scheme is missing:
1. Add URL Type in Info.plist
2. Set URL Schemes to the REVERSED_CLIENT_ID from GoogleService-Info.plist
