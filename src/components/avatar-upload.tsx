"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  fileToDataUrl,
  getAvatar,
  saveAvatar,
  subscribeAvatar,
} from "@/lib/avatar";

const MAX_BYTES = 10 * 1024 * 1024;

export function AvatarUpload() {
  // Stored in this browser's localStorage only; nothing is uploaded.
  const src = useSyncExternalStore(subscribeAvatar, getAvatar, () => null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image.");
    if (file.size > MAX_BYTES) return setError("Image must be under 10 MB.");

    try {
      saveAvatar(await fileToDataUrl(file));
      setError(null);
    } catch {
      setError("Couldn't save that picture.");
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
        aria-label="Upload your picture"
      />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Avatar"
          className="aspect-square w-full rounded-md object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-gradient-to-br from-blue-50 to-white p-4 text-center text-sm text-slate-500 hover:border-blue-400"
        >
          Click to upload your picture
        </button>
      )}
      {src && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="mt-1 h-7 px-2 text-xs text-slate-500"
        >
          Change photo
        </Button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
