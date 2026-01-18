import { useEffect } from "react";

const REFERRAL_CODE_KEY = "vagabond_referral_code";
const REFERRAL_EXPIRY_KEY = "vagabond_referral_expiry";
const REFERRAL_EXPIRY_DAYS = 30;

export function useReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    
    if (refCode) {
      localStorage.setItem(REFERRAL_CODE_KEY, refCode);
      const expiry = Date.now() + REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiry.toString());
      
      fetch("/api/ambassador/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: refCode }),
      }).catch((err) => {
        console.error("Failed to track referral click:", err);
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
}

export function getReferralCode(): string | null {
  const code = localStorage.getItem(REFERRAL_CODE_KEY);
  const expiryStr = localStorage.getItem(REFERRAL_EXPIRY_KEY);
  
  if (!code || !expiryStr) {
    return null;
  }
  
  const expiry = parseInt(expiryStr, 10);
  if (Date.now() > expiry) {
    localStorage.removeItem(REFERRAL_CODE_KEY);
    localStorage.removeItem(REFERRAL_EXPIRY_KEY);
    return null;
  }
  
  return code;
}

export function clearReferralCode() {
  localStorage.removeItem(REFERRAL_CODE_KEY);
  localStorage.removeItem(REFERRAL_EXPIRY_KEY);
}

export async function trackReferralSignup(userId: string): Promise<boolean> {
  const referralCode = getReferralCode();
  
  if (!referralCode) {
    return false;
  }
  
  try {
    const response = await fetch("/api/ambassador/track-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode, userId }),
    });
    
    if (response.ok) {
      clearReferralCode();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to track referral signup:", err);
    return false;
  }
}
