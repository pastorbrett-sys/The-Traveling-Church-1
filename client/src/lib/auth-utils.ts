export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = currentPath && currentPath !== "/" 
      ? `/login?redirect=${encodeURIComponent(currentPath)}`
      : "/login";
    window.location.href = loginUrl;
  }, 500);
}
