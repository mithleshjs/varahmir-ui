import Image from "next/image"
import { KundaliForm } from "@/components/kundali-form"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  return (
    <main className="relative min-h-svh bg-background overflow-hidden px-4 py-16 sm:py-20 sm:px-6">
      <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% aspect-2/3 lg:aspect-9/4 absolute inset-0 md:aspect-square opacity-100 dark:opacity-25 pointer-events-none" aria-hidden>
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
        <header className="mb-10 text-center space-y-3">
          <Badge variant="outline" className="font-mono uppercase tracking-widest">
            Vedic Astrology
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Kundali Generator
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Generate a detailed Vedic birth chart with divisional charts, dashas, and ashtakvarga from birth details.
          </p>
        </header>
        <KundaliForm />
      </div>
    </main>
  )
}
