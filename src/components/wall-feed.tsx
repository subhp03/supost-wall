"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { dataUrlToBlob, getAvatar } from "@/lib/avatar";
import { DEFAULT_NAME, MAX_NAME_LENGTH, authorName, getName, saveName, subscribeName } from "@/lib/name";
import { createClient } from "@/lib/supabase/client";

type PostRow = {
  id: string;
  author: string;
  message: string | null;
  image_url: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Post = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  imageUrl: string | null;
  /** Public URL of the avatar copy stored when the post was shared. */
  avatarUrl: string | null;
};

function toPost(r: PostRow): Post {
  return {
    id: r.id,
    author: r.author,
    text: r.message ?? "",
    createdAt: r.created_at,
    imageUrl: r.image_url,
    avatarUrl: r.avatar_url,
  };
}

function timeAgo(iso: string) {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

const AVATAR_BUCKET = "avatars";
const PHOTO_BUCKET = "post-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const MAX_LENGTH = 280;

export function WallFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const name = useSyncExternalStore(subscribeName, getName, () => DEFAULT_NAME);

  const [photo, setPhoto] = useState<File | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const add = (row: PostRow) =>
      setPosts((p) => (p.some((x) => x.id === row.id) ? p : [toPost(row), ...p]));

    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setError(error.message);
        // Keep anything a realtime insert already delivered.
        setPosts((p) => {
          const seen = new Set(p.map((x) => x.id));
          return [...p, ...(data as PostRow[]).filter((r) => !seen.has(r.id)).map(toPost)].sort(
            (a, b) => b.createdAt.localeCompare(a.createdAt),
          );
        });
      });

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => add(payload.new as PostRow),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image.");
    if (file.size > MAX_PHOTO_BYTES) return setError("Photo must be under 5 MB.");
    setError(null);
    setPhoto(file);
  }

  async function share(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !photo) || sharing) return;

    setSharing(true);
    setError(null);
    const supabase = createClient();
    try {
      let imageUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, photo, { contentType: photo.type });
        if (error) throw error;
        imageUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      // A fresh copy of the current avatar is stored for every post.
      let avatarUrl: string | null = null;
      const avatar = getAvatar();
      if (avatar) {
        const path = `${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, await dataUrlToBlob(avatar), { contentType: "image/jpeg" });
        if (error) throw error;
        avatarUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author: authorName(),
          message: text || null,
          image_url: imageUrl,
          avatar_url: avatarUrl,
        })
        .select()
        .single();
      if (error) throw error;

      setPosts((p) => (p.some((x) => x.id === data.id) ? p : [toPost(data as PostRow), ...p]));
    } catch (err) {
      setSharing(false);
      return setError(err instanceof Error ? err.message : "Couldn't share that post.");
    }
    setDraft("");
    setPhoto(null);
    setSharing(false);
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <header className="bg-blue-500 px-8 py-5">
        <h1 className="text-2xl font-bold text-white">wall</h1>
      </header>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b p-5 md:border-r md:border-b-0 md:pb-12">
          <AvatarUpload />
          <input
            value={name}
            onChange={(e) => saveName(e.target.value)}
            onBlur={() => !name.trim() && saveName(DEFAULT_NAME)}
            maxLength={MAX_NAME_LENGTH}
            aria-label="Your name"
            title="Click to rename"
            className="mt-4 w-full rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 text-xl font-bold hover:border-slate-300 focus:border-blue-400 focus:outline-none"
          />
          <p className="mt-1 text-base text-slate-500">wall</p>

          <Button
            type="button"
            variant="outline"
            className="mt-5 h-9 bg-slate-100 px-3 text-sm font-normal"
          >
            Information
          </Button>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium">Networks</dt>
              <dd className="text-slate-600">Your network</dd>
            </div>
            <div>
              <dt className="font-medium">Current City</dt>
              <dd className="text-slate-600">Your city</dd>
            </div>
          </dl>
        </aside>

        <section className="p-8">
          <form onSubmit={share}>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_LENGTH}
              placeholder="What's on your mind?"
              aria-label="Write on the wall"
              className="h-36 resize-none rounded-sm border-2 border-dashed border-slate-300 bg-gradient-to-r from-blue-50 to-white p-6 text-base"
            />
            <p className="mt-3 text-slate-500">
              {MAX_LENGTH - draft.length} characters remaining
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickPhoto}
              className="hidden"
              aria-label="Attach a photo"
            />
            {preview && (
              <div className="mt-3 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Selected photo" className="h-24 rounded-md object-cover" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setPhoto(null)}>
                  Remove
                </Button>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-sm">Attach</span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Attach a photo"
                  title="Attach a photo"
                  className="rounded p-1.5 text-blue-500 hover:bg-blue-50"
                >
                  <ImageIcon className="size-5" />
                </button>
              </div>
              <Button
                type="submit"
                disabled={(!draft.trim() && !photo) || sharing}
                className="h-11 bg-blue-500 px-7 text-base font-medium hover:bg-blue-600"
              >
                {sharing ? "Sharing…" : "Share"}
              </Button>
            </div>
          </form>

          <ul className="mt-8">
            {posts.map((post) => (
              <li key={post.id}>
                <div className="flex gap-3">
                  {post.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.avatarUrl}
                      alt={`${post.author}'s avatar`}
                      className="size-[50px] shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="size-[50px] shrink-0 rounded-sm bg-slate-200"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-lg leading-snug break-words text-slate-800">
                      <span className="font-bold text-blue-600">{post.author}</span>
                      {post.text && <> {post.text}</>}
                    </p>
                    {post.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt="Shared photo"
                        className="mt-2 max-h-96 rounded-md"
                      />
                    )}
                    <p className="mt-1 text-sm text-slate-500">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <Separator className="my-4" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
