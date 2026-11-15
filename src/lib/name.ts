const KEY = "wall:name";
const EVENT = "wall:name-change";

export const DEFAULT_NAME = "Random Person";
export const MAX_NAME_LENGTH = 40;

export function getName(): string {
  try {
    return localStorage.getItem(KEY) ?? DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    // storage blocked or full: the name just won't persist
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeName(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** The name to store on a post: trimmed, never empty. */
export function authorName(): string {
  return getName().trim().slice(0, MAX_NAME_LENGTH) || DEFAULT_NAME;
}
