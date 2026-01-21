// @capacitor-community/safe-area plugin handles Android safe area insets automatically
// It patches env(safe-area-inset-*) for older Chromium versions (< 140)
// So we can use standard env() values on all platforms

export function getBottomNavOffset(): string {
  return 'calc(64px + env(safe-area-inset-bottom, 0px))';
}

export function getBottomInset(): string {
  return 'env(safe-area-inset-bottom, 0px)';
}
