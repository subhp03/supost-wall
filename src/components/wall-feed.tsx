"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Post = { id: number; author: string; text: string; time: string };

const MAX_LENGTH = 280;

const initialPosts: Post[] = [
  { id: 1, author: "Anna", time: "2h", text: "Hey Greg, did you debug your coffee maker yet? Last cup tasted like JavaScript errors." },
  { id: 2, author: "Adelaida", time: "3h", text: "Greg, saw your last coding session—pretty sure you broke Stack Overflow again! 🚨" },
  { id: 3, author: "Juho", time: "4h", text: "Greg, are you still coding in pajamas, or have you upgraded to full-time sweatpants mode?" },
  { id: 4, author: "Maija", time: "5h", text: "Greg, rumor has it your computer has more stickers than code running on it. Confirm?" },
  { id: 5, author: "Alex", time: "6h", text: "Yo Greg, just pulled an all-nighter on the assignment. Turns out sleep deprivation doesn't improve coding skills. Weird!" },
  { id: 6, author: "Sheryl", time: "8h", text: "Greg, when are we gonna deploy your latest dance moves to production? #AgileDancer" },
];

export function WallFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");

  function share(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [{ id: Date.now(), author: "Greg Wientjes", text, time: "now" }, ...p]);
    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <header className="bg-blue-500 px-8 py-5">
        <h1 className="text-2xl font-bold text-white">wall</h1>
      </header>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b p-5 md:border-r md:border-b-0 md:pb-12">
          <Image
            src="/greg.jpg"
            alt="Greg Wientjes"
            width={400}
            height={400}
            priority
            className="aspect-square w-full rounded-md object-cover"
          />
          <h2 className="mt-4 text-xl font-bold">Greg Wientjes</h2>
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
              <dd className="text-slate-600">Stanford Alum</dd>
            </div>
            <div>
              <dt className="font-medium">Current City</dt>
              <dd className="text-slate-600">Palo Alto, CA</dd>
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
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                disabled={!draft.trim()}
                className="h-11 bg-blue-500 px-7 text-base font-medium hover:bg-blue-600"
              >
                Share
              </Button>
            </div>
          </form>

          <ul className="mt-8">
            {posts.map((post) => (
              <li key={post.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold">{post.author}</h3>
                  <span className="text-slate-500">{post.time}</span>
                </div>
                <p className="mt-3 text-lg text-slate-800">{post.text}</p>
                <Separator className="my-6" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
