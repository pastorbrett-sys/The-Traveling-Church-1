# Vagabond Bible - iOS App Store Submission Checklist

## 1. App Store Connect Setup
- [ ] Create App ID in Apple Developer Portal
- [ ] Create App Record in App Store Connect
- [ ] Set bundle ID: (your bundle identifier from capacitor.config.ts)
- [ ] Set app name: "Vagabond Bible"
- [ ] Select primary category: "Lifestyle" or "Reference"
- [ ] Set content rating via questionnaire

## 2. App Metadata
- [ ] App name (30 characters max)
- [ ] Subtitle (30 characters max)
- [ ] Description (4000 characters max)
- [ ] Keywords (100 characters max, comma-separated)
- [ ] What's New text (for updates)
- [ ] Support URL (required)
- [ ] Marketing URL (optional)

## 3. Screenshots Required
- [ ] 6.7" iPhone (1290 x 2796 px) - iPhone 15 Pro Max, 14 Plus
- [ ] 6.5" iPhone (1284 x 2778 px or 1242 x 2688 px) - iPhone 11 Pro Max, XS Max
- [ ] 5.5" iPhone (1242 x 2208 px) - iPhone 8 Plus
- [ ] 12.9" iPad Pro (2048 x 2732 px) - if supporting iPad
- [ ] Minimum 2 screenshots per device size, maximum 10

## 4. App Icon
- [ ] 1024 x 1024 px PNG (no alpha/transparency)
- [ ] No rounded corners (Apple adds them)
- [ ] Uploaded to App Store Connect

## 5. Privacy & Legal (COMPLETED)
- [x] Privacy Policy URL: /privacy-policy (hosted on your domain)
- [x] Terms of Service: /terms-of-service (hosted on your domain)
- [x] Legal disclosure in upgrade dialog (auto-renew notice, cancel instructions)
- [x] Legal links in profile page
- [ ] App Privacy Labels (data collection disclosure in App Store Connect)

## 6. In-App Purchases (RevenueCat)
- [x] Product created: "vagabond_bible_pro_monthly" at $9.99/month
- [x] Entitlement configured: "Vagabond Bible Pro"
- [x] App-Specific Shared Secret: 6293c71538394d9b93709c2798159625
- [ ] Subscription Group created in App Store Connect
- [ ] Product localized for all territories
- [ ] Review notes explaining how to test subscription

## 7. Build Preparation
- [ ] Update version number in capacitor.config.ts
- [ ] Update build number (must increment for each upload)
- [ ] Run: npm run build
- [ ] Run: npx cap sync ios
- [ ] Run: cd ios/App && pod install
- [ ] Open in Xcode: open ios/App/App.xcworkspace
- [ ] Select "Any iOS Device" as build target
- [ ] Product > Archive

## 8. Xcode Settings
- [ ] Set Team (Apple Developer account)
- [ ] Enable "Automatically manage signing"
- [ ] Verify bundle identifier matches App Store Connect
- [ ] Set deployment target (iOS 14.0 or higher recommended)
- [ ] Verify In-App Purchase capability is enabled

## 9. App Review Notes
- [ ] Demo account credentials (if login required)
- [ ] Instructions for testing in-app purchase (sandbox account)
- [ ] Explanation of any non-obvious features
- [ ] Contact information for reviewer questions

## 10. Common Rejection Reasons to Avoid
- [ ] No broken links or placeholder content
- [ ] All features are functional (no "coming soon")
- [ ] No mention of other platforms (Android, web) in screenshots
- [ ] No pricing in screenshots (Apple adds pricing)
- [ ] Subscription terms clearly disclosed before purchase
- [ ] Sign in with Apple offered if other social logins exist
- [ ] No references to beta, test, or demo in app

## 11. Final Checks Before Submit
- [ ] Test on physical device (not just simulator)
- [ ] Test subscription purchase flow in sandbox
- [ ] Test restore purchases
- [ ] Verify all links open correctly
- [ ] Check all screens render properly with safe areas
- [ ] Test on oldest supported iOS version
- [ ] Crash-free for at least basic user flows

## 12. After Archive - Upload
- [ ] Distribute App > App Store Connect
- [ ] Upload successful (no errors)
- [ ] Build appears in App Store Connect (may take 15-30 mins)
- [ ] Build passes automated review
- [ ] Select build for submission
- [ ] Submit for Review

## Notes
- First submission typically takes 24-48 hours for review
- Have demo video ready if app is complex
- Be prepared to respond to reviewer questions
- Keep sandbox test account credentials handy
