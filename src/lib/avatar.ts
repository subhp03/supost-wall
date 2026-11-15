const KEY = "wall:avatar";
const EVENT = "wall:avatar-change";
const MAX_SIZE = 256; // px, longest side; keeps the data URL small for localStorage

export function getAvatar(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveAvatar(dataUrl: string) {
  localStorage.setItem(KEY, dataUrl); // may throw if storage is full or blocked
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeAvatar(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Downscale an image file to a small JPEG data URL. */
export async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Convert a data URL (as stored in localStorage) back into a Blob for upload. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}
