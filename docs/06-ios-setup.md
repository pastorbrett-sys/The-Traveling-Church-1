# 🍎 iOS Setup

Guide to setting up and maintaining the iOS app via Capacitor.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Technology | Version |
|------------|---------|
| **Capacitor** | 6.x |
| **iOS Target** | 13.0+ |
| **Xcode** | 15.0+ |

&nbsp;

---

&nbsp;

## 📁 Project Location

```
ios/
└── App/
    ├── App/                    # Main app code
    │   ├── AppDelegate.swift
    │   └── Info.plist
    ├── App.xcworkspace         # Open this in Xcode
    └── Podfile                 # CocoaPods dependencies
```

&nbsp;

---

&nbsp;

## 🚀 Building the App

&nbsp;

### 1. Sync Web Assets

```bash
npx cap sync ios
```

&nbsp;

### 2. Open in Xcode

```bash
npx cap open ios
```

&nbsp;

### 3. Build & Run

- Select your device/simulator
- Press ▶️ (Play button)

&nbsp;

---

&nbsp;

## 🔔 Notification Service Extension

Required for rich notification images.

&nbsp;

### Creating the Extension

1. **File → New → Target**

2. Search: "Notification Service Extension"

3. **Name**: `NotificationService`

4. **Team**: Select your Apple Developer account

5. Click **Finish**

6. When asked "Activate scheme?": Click **Don't Activate**

&nbsp;

### Replace the Code

Open `NotificationService/NotificationService.swift` and replace with:

```swift
import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        
        guard let bestAttemptContent = bestAttemptContent else {
            contentHandler(request.content)
            return
        }
        
        var imageURLString: String?
        if let fcmOptions = request.content.userInfo["fcm_options"] as? [String: Any],
           let image = fcmOptions["image"] as? String {
            imageURLString = image
        }
        
        guard let urlString = imageURLString,
              let url = URL(string: urlString) else {
            contentHandler(bestAttemptContent)
            return
        }
        
        downloadImage(from: url) { attachment in
            if let attachment = attachment {
                bestAttemptContent.attachments = [attachment]
            }
            contentHandler(bestAttemptContent)
        }
    }
    
    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
    
    private func downloadImage(from url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        URLSession.shared.downloadTask(with: url) { location, _, error in
            guard let location = location, error == nil else {
                completion(nil)
                return
            }
            let tmpDir = FileManager.default.temporaryDirectory
            let tmpFile = tmpDir.appendingPathComponent(UUID().uuidString + ".png")
            try? FileManager.default.moveItem(at: location, to: tmpFile)
            let attachment = try? UNNotificationAttachment(identifier: "image", url: tmpFile, options: nil)
            completion(attachment)
        }.resume()
    }
}
```

&nbsp;

### Set Deployment Target

1. Click **NotificationService** in sidebar
2. **General → Minimum Deployments**: iOS 13.0

&nbsp;

---

&nbsp;

## 🔥 Firebase Setup

&nbsp;

### GoogleService-Info.plist

1. Download from Firebase Console
2. Add to `ios/App/App/`
3. Make sure it's included in the target

&nbsp;

### APNs Configuration

| Setting | Value |
|---------|-------|
| **Key ID** | S48F6S762Z |
| **Team ID** | FBD94PWXT2 |
| **Bundle ID** | com.vagabondbible.app |

&nbsp;

---

&nbsp;

## 📱 App Icon

Located at: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required size: **1024 x 1024** (single image, Xcode generates all sizes)

&nbsp;

---

&nbsp;

## ⚠️ Common Issues

&nbsp;

### Pods Not Found

```bash
cd ios/App && pod install
```

&nbsp;

### Signing Issues

- Open Xcode
- Select App target
- Signing & Capabilities
- Select your Team
