import UIKit
import Capacitor
import FirebaseCore
import FirebaseAuth
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Firebase for native authentication and messaging
        FirebaseApp.configure()
        
        // Set messaging delegate for token updates
        Messaging.messaging().delegate = self
        
        print("[AppDelegate] Firebase configured, MessagingDelegate set")
        
        return true
    }
    
    // Handle APNs token registration - convert to FCM and notify Capacitor
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Debug: log the APNs token
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("[AppDelegate] APNs token received: \(tokenString.prefix(20))...")
        
        // Pass the APNs token to Firebase Messaging
        Messaging.messaging().apnsToken = deviceToken
        
        // IMPORTANT: Explicitly request FCM token and post to Capacitor
        // This ensures the token is posted even if MessagingDelegate fired too early
        Messaging.messaging().token { token, error in
            if let error = error {
                print("[AppDelegate] Error getting FCM token: \(error.localizedDescription)")
                NotificationCenter.default.post(
                    name: .capacitorDidFailToRegisterForRemoteNotifications,
                    object: error
                )
            } else if let token = token {
                print("[AppDelegate] FCM token obtained: \(token.prefix(20))...")
                // Post on main thread to ensure Capacitor receives it
                DispatchQueue.main.async {
                    print("[AppDelegate] Posting FCM token to Capacitor")
                    NotificationCenter.default.post(
                        name: .capacitorDidRegisterForRemoteNotifications,
                        object: token
                    )
                }
            }
        }
    }
    
    // Handle registration failures
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[AppDelegate] Failed to register for remote notifications: \(error.localizedDescription)")
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Handle Firebase Auth URLs first
        if Auth.auth().canHandle(url) {
            return true
        }
        // Then let Capacitor handle other URLs
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - MessagingDelegate for FCM token updates
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("[AppDelegate] MessagingDelegate received FCM token: \(fcmToken?.prefix(20) ?? "nil")...")
        
        guard let token = fcmToken else {
            print("[AppDelegate] FCM token is nil, skipping")
            return
        }
        
        // Also post here for token refresh scenarios
        DispatchQueue.main.async {
            print("[AppDelegate] MessagingDelegate posting token to Capacitor")
            NotificationCenter.default.post(
                name: .capacitorDidRegisterForRemoteNotifications,
                object: token
            )
        }
    }
}
