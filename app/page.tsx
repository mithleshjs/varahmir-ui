import Image from "next/image"
import { KundaliForm } from "@/components/kundali-form"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-provider"

export default function Page() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background px-4 pt-16 sm:px-6 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-0 aspect-2/3 mask-t-from-50% mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top opacity-100 md:aspect-square lg:aspect-9/4 dark:opacity-25"
        aria-hidden
      >
        <Image
          src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          width={2268}
          height={1740}
          className="h-full w-full object-cover object-top"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="mb-10 space-y-3 text-center">
          <Badge
            variant="outline"
            className="font-mono tracking-widest uppercase"
          >
            Vedic Astrology
          </Badge>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground italic sm:text-5xl">
            Kundali Generator
          </h1>
          <p className="mx-auto max-w-md font-serif text-base text-muted-foreground italic">
            Generate a detailed Vedic birth chart with divisional charts,
            dashas, and ashtakvarga from birth details.
          </p>
        </header>
        <KundaliForm />
      </div>
      <ThemeToggle />
      <footer className="relative z-10 mt-auto pb-6 pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} · Designed by{" "}
        <a
          href="https://github.com/mithleshjs"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Mithlesh
        </a>
      </footer>
    </main>
  )
}
