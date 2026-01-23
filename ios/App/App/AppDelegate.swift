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
        
        // Set messaging delegate
        Messaging.messaging().delegate = self
        
        return true
    }
    
    // Handle APNs token registration - pass to Firebase for FCM conversion
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Pass the APNs token to Firebase Messaging
        // Firebase will automatically convert this to an FCM token
        Messaging.messaging().apnsToken = deviceToken
        
        // Debug: log the APNs token
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNs token received: \(tokenString)")
        
        // The FCM token will be delivered via MessagingDelegate (didReceiveRegistrationToken)
        // which will then notify Capacitor
    }
    
    // Handle registration failures
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
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
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - MessagingDelegate for FCM token updates
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("Firebase FCM token received: \(fcmToken ?? "nil")")
        
        guard let token = fcmToken else {
            print("FCM token is nil, skipping notification")
            return
        }
        
        // Post notification on main thread to ensure Capacitor receives it
        DispatchQueue.main.async {
            print("Posting FCM token to Capacitor via NotificationCenter")
            NotificationCenter.default.post(
                name: .capacitorDidRegisterForRemoteNotifications,
                object: token
            )
        }
    }
}
