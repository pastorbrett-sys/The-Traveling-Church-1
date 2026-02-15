type Listener = () => void;

let currentActiveTab: string = "";
const listeners: Set<Listener> = new Set();

export function setGlobalActiveTab(tabId: string) {
  currentActiveTab = tabId;
  listeners.forEach((fn) => fn());
}

export function getGlobalActiveTab(): string {
  return currentActiveTab;
}

export function subscribeToActiveTab(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
