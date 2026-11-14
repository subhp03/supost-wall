import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { WallFeed } from "@/components/wall-feed";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      <header className="rounded-xl border-2 border-black bg-[#1e88e5] px-6 py-3">
        <h1 className="text-4xl font-bold text-white">wall</h1>
      </header>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <aside>
          <Image
            src="/greg.jpg"
            alt="Greg Wientjes"
            width={400}
            height={400}
            priority
            className="aspect-square w-full object-cover"
          />
          <p className="mt-16 rounded-lg border-2 border-neutral-300 bg-neutral-100 px-4 py-2 text-2xl">
            Information
          </p>
          <Card className="mt-1 rounded-3xl border-2 border-neutral-300 bg-neutral-100 shadow-none ring-0">
            <CardContent className="space-y-8 text-xl">
              <div>
                <p>Networks</p>
                <p>Stanford Alum</p>
              </div>
              <div>
                <p>Current City</p>
                <p>Palo Alto, CA</p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section>
          <h2 className="text-4xl font-bold">Greg Wientjes</h2>
          <WallFeed />
        </section>
      </div>
    </main>
  );
}
