"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Post = { id: number; author: string; text: string };

const initialPosts: Post[] = [
  { id: 1, author: "Anna", text: "Hey Greg, did you debug your coffee maker yet? Last cup tasted like JavaScript errors." },
  { id: 2, author: "Adelaida", text: "Greg, saw your last coding session—pretty sure you broke Stack Overflow again! 🚨" },
  { id: 3, author: "Juho", text: "Greg, are you still coding in pajamas, or have you upgraded to full-time sweatpants mode?" },
  { id: 4, author: "Maija", text: "Greg, rumor has it your computer has more stickers than code running on it. Confirm?" },
  { id: 5, author: "Alex", text: "Yo Greg, just pulled an all-nighter on the assignment. Turns out sleep deprivation doesn't improve coding skills. Weird!" },
  { id: 6, author: "Sheryl", text: "Greg, when are we gonna deploy your latest dance moves to production? #AgileDancer" },
];

export function WallFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");

  function share() {
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [{ id: Date.now(), author: "You", text }, ...p]);
    setDraft("");
  }

  return (
    <div>
      <h2 className="mt-8 text-3xl">Wall</h2>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Write on the wall"
        className="mt-5 h-32 resize-none rounded-3xl border-2 border-dashed border-black bg-[repeating-linear-gradient(135deg,#bfe0fa_0_2px,transparent_2px_14px)] p-4 text-xl md:text-xl"
      />
      <div className="mt-5 flex justify-end">
        <Button
          onClick={share}
          className="h-14 rounded-xl bg-[#1e88e5] px-8 text-2xl font-bold text-white hover:bg-[#1976d2]"
        >
          Share
        </Button>
      </div>
      <ul className="mt-4">
        {posts.map((post, i) => (
          <li key={post.id}>
            {i > 0 && <Separator className="my-5 bg-black/70" />}
            <p className="text-2xl">{post.author}</p>
            <p className="text-2xl leading-snug">{post.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
