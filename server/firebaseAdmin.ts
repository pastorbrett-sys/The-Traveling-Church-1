import admin from "firebase-admin";
import type { RequestHandler } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

let firebaseApp: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    try {
      const parsedKey = JSON.parse(serviceAccount);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(parsedKey),
      });
    } catch (error) {
      console.error("Error parsing Firebase service account key:", error);
      firebaseApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    firebaseApp = admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }

  return firebaseApp;
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const app = getFirebaseAdmin();
    const decodedToken = await app.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export async function upsertFirebaseUser(decodedToken: admin.auth.DecodedIdToken) {
  const nameParts = (decodedToken.name || "").split(" ");
  const firstName = nameParts[0] || null;
  const lastName = nameParts.slice(1).join(" ") || null;

  return await authStorage.upsertUser({
    id: decodedToken.uid,
    email: decodedToken.email || null,
    firstName,
    lastName,
    profileImageUrl: decodedToken.picture || null,
  });
}
