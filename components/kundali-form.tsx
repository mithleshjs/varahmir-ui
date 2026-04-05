"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import {
  RiLoaderLine,
  RiFileCopyLine,
  RiCheckLine,
  RiSettings3Line,
  RiSparklingLine,
  RiErrorWarningLine,
  RiMoonLine,
  RiSunLine,
  RiUser3Line,
  RiMapPin2Line,
  RiTimeLine,
  RiCalendarLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlaceSearch } from "@/components/place-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const DIVISIONAL_CHARTS = [
  { id: 2, label: "Hora", domain: "Wealth" },
  { id: 3, label: "Drekkana", domain: "Siblings" },
  { id: 4, label: "Chaturthamsha", domain: "Destiny/Property" },
  { id: 7, label: "Saptamsha", domain: "Children" },
  { id: 9, label: "Navamsha", domain: "Spouse & Dharma" },
  { id: 10, label: "Dashamsha", domain: "Career" },
  { id: 12, label: "Dwadashamsha", domain: "Parents" },
  { id: 16, label: "Shodashamsha", domain: "Vehicles" },
  { id: 20, label: "Vimshamsha", domain: "Spirituality" },
  { id: 24, label: "Chaturvimshamsha", domain: "Education" },
  { id: 27, label: "Saptavimshamsha", domain: "Strengths" },
  { id: 30, label: "Trishamsha", domain: "Misfortunes" },
  { id: 40, label: "Khavedamsha", domain: "Auspiciousness" },
  { id: 45, label: "Akshavedamsha", domain: "Well-being" },
  { id: 60, label: "Shashtiamsha", domain: "Past Karma" }
] as const

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string({ error: "Name must be a valid string" }).min(1, "Name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { error: "Gender must be MALE, FEMALE, or OTHER" }),
  dob: z.object({
    year: z.number({ error: "Year must be a number" }).int().min(1900, "≥ 1900").max(2100, "≤ 2100"),
    month: z.number({ error: "Month must be a number" }).int().min(1, "1–12").max(12, "1–12"),
    day: z.number({ error: "Day must be a number" }).int().min(1, "1–31").max(31, "1–31"),
  }),
  time: z.object({
    hour: z.number({ error: "Hour is required and must be a number" }).int().min(0, "0–23").max(23, "0–23"),
    minute: z.number({ error: "Minute is required and must be a number" }).int().min(0, "0–59").max(59, "0–59"),
    second: z.number({ error: "Second must be a number" }).int().min(0, "0–59").max(59, "0–59").optional(),
  }),
  lat: z.number({ error: "Latitude must be a number" }).min(-90, "−90 to 90").max(90, "−90 to 90"),
  lng: z.number({ error: "Longitude must be a number" }).min(-180, "−180 to 180").max(180, "−180 to 180"),
  timezone: z.string({ error: "Timezone must be a string" }).min(1, "Timezone is required"),
  divisionalCharts: z
    .array(z.number())
    .min(1, "Select at least one divisional chart"),
  moonChart: z.boolean({ error: "moonChart must be a boolean" }),
  sunChart: z.boolean({ error: "sunChart must be a boolean" }),
  chalitChart: z.boolean({ error: "chalitChart must be a boolean" }),
  ashtakvarga: z.boolean({ error: "ashtakvarga must be a boolean" }),
  transits: z.boolean({ error: "transits must be a boolean" }),
  dashas: z.boolean({ error: "dashas must be a boolean" }),
  dashaDepth: z.number({ error: "dashaDepth must be a number" }).int().min(1, "1–3").max(3, "1–3"),
  currentDashaOnly: z.boolean({ error: "currentDashaOnly must be a boolean" }),
  panchang: z.boolean({ error: "panchang must be a boolean" }),
  outputFormat: z.enum(["JSON", "PROMPT"], { error: "Invalid output format" }),
})

export type KundaliFormValues = z.infer<typeof formSchema>

// ─── Sub-components ───────────────────────────────────────────────────────────





function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3 shadow-sm transition-colors hover:bg-muted/50">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function KundaliForm() {
  const [response, setResponse] = useState<string | null>(null)
  const [responseFormat, setResponseFormat] = useState<"JSON" | "PROMPT">("PROMPT")
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KundaliFormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "MALE",
      dob: { year: 1990, month: 1, day: 1 },
      time: { hour: 0, minute: 0, second: 0 },
      lat: 0,
      lng: 0,
      timezone: "Asia/Kolkata",
      divisionalCharts: [9 as const],
      moonChart: false,
      sunChart: false,
      chalitChart: true,
      ashtakvarga: true,
      transits: false,
      dashas: false,
      dashaDepth: 1,
      currentDashaOnly: false,
      panchang: false,
      outputFormat: "PROMPT",
    },
  })

  const selectedCharts = watch("divisionalCharts")

  function toggleDivisionalChart(
    chart: KundaliFormValues["divisionalCharts"][number],
    currentValues: KundaliFormValues["divisionalCharts"]
  ) {
    if (currentValues.includes(chart)) {
      setValue("divisionalCharts", currentValues.filter((c) => c !== chart), { shouldValidate: true })
    } else {
      setValue("divisionalCharts", [...currentValues, chart], { shouldValidate: true })
    }
  }

  async function onSubmit(data: KundaliFormValues) {
    setResponse(null)
    setResponseFormat(data.outputFormat)
    const endpoint = process.env.NEXT_PUBLIC_CHART_API_URL ?? "/api/generate-chart"
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const text = await res.text()
      if (!res.ok) {
        toast.custom(
          () => (
            <Alert variant="destructive" className="shadow-lg">
              <RiErrorWarningLine />
              <AlertTitle className="font-semibold">Server returned {res.status}</AlertTitle>
              <AlertDescription className="opacity-70 text-xs">{text || res.statusText}</AlertDescription>
            </Alert>
          ),
          { id: "api-error" }
        )
        return
      }
      if (data.outputFormat === "JSON") {
        try {
          setResponse(JSON.stringify(JSON.parse(text), null, 2))
        } catch {
          setResponse(text)
        }
      } else {
        setResponse(text)
      }
    } catch (err) {
      toast.custom(
        () => (
          <Alert variant="destructive" className="shadow-lg">
            <RiErrorWarningLine />
            <AlertTitle className="font-semibold">Request failed</AlertTitle>
            <AlertDescription className="opacity-70 text-xs">
              {err instanceof Error ? err.message : String(err)}
            </AlertDescription>
          </Alert>
        ),
        { id: "api-error" }
      )
    }
  }

  async function copyResponse() {
    if (!response) return
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 py-6">

      {/* ── Form ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-6 border-b border-border/40 mb-2">
          <CardTitle className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RiSparklingLine className="size-5" />
            </div>
            Kundali Generator
          </CardTitle>
          <CardDescription className="text-[15px] pl-[3.25rem]">
            Generate a precise Vedic natal chart using modern ephemeris integration.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="kundali-generation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40">
                <TabsTrigger value="basic" className="text-sm rounded-md data-[state=active]:shadow-sm">Birth Details</TabsTrigger>
                <TabsTrigger value="advanced" className="text-sm rounded-md data-[state=active]:shadow-sm">Chart Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                {/* ── Personal Details ──────────────────────────── */}
            <div className="space-y-5">
              {/* Name */}
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Arjuna Sharma"
                  className="h-10 text-[15px]"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              {/* Gender */}
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "MALE", label: "Male" },
                    { val: "FEMALE", label: "Female" },
                    { val: "OTHER", label: "Other" },
                  ].map((opt) => {
                    const checked = watch("gender") === opt.val
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setValue("gender", opt.val as any, { shouldValidate: true })}
                        className={cn(
                          "flex items-center justify-center rounded-xl border h-[42px] transition-all font-semibold text-[13px]",
                          checked
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <FieldError>{errors.gender?.message}</FieldError>
              </Field>
            </div>

            {/* ── Date & Time ───────────────────────────────── */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Field>
                      <FieldLabel htmlFor="year" className="text-xs text-muted-foreground uppercase">Year</FieldLabel>
                      <Input
                        id="year"
                        type="number"
                        placeholder="YYYY"
                        className="h-10 tabular-nums"
                        {...register("dob.year", { valueAsNumber: true })}
                        aria-invalid={!!errors.dob?.year}
                      />
                      <FieldError>{errors.dob?.year?.message}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="month" className="text-xs text-muted-foreground uppercase">Month</FieldLabel>
                      <Input
                        id="month"
                        type="number"
                        min={1}
                        max={12}
                        placeholder="MM"
                        className="h-10 tabular-nums"
                        {...register("dob.month", { valueAsNumber: true })}
                        aria-invalid={!!errors.dob?.month}
                      />
                      <FieldError>{errors.dob?.month?.message}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="day" className="text-xs text-muted-foreground uppercase">Day</FieldLabel>
                      <Input
                        id="day"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="DD"
                        className="h-10 tabular-nums"
                        {...register("dob.day", { valueAsNumber: true })}
                        aria-invalid={!!errors.dob?.day}
                      />
                      <FieldError>{errors.dob?.day?.message}</FieldError>
                    </Field>
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Field>
                      <FieldLabel htmlFor="hour" className="text-xs text-muted-foreground uppercase">Hour</FieldLabel>
                      <Input
                        id="hour"
                        type="number"
                        min={0}
                        max={23}
                        placeholder="HH"
                        className="h-10 tabular-nums"
                        {...register("time.hour", { valueAsNumber: true })}
                        aria-invalid={!!errors.time?.hour}
                      />
                      <FieldError>{errors.time?.hour?.message}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="minute" className="text-xs text-muted-foreground uppercase">Minute</FieldLabel>
                      <Input
                        id="minute"
                        type="number"
                        min={0}
                        max={59}
                        placeholder="MM"
                        className="h-10 tabular-nums"
                        {...register("time.minute", { valueAsNumber: true })}
                        aria-invalid={!!errors.time?.minute}
                      />
                      <FieldError>{errors.time?.minute?.message}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="second" className="text-xs text-muted-foreground uppercase">Second</FieldLabel>
                      <Input
                        id="second"
                        type="number"
                        min={0}
                        max={59}
                        placeholder="SS"
                        className="h-10 tabular-nums"
                        {...register("time.second", { valueAsNumber: true })}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Location ──────────────────────────────────── */}
            <div className="space-y-4">
              <Field>
                <FieldLabel>Birth Location</FieldLabel>
                <PlaceSearch
                  className="h-10 text-[15px]"
                  onSelect={(result) => {
                    setValue("lat", result.latitude, { shouldValidate: true })
                    setValue("lng", result.longitude, { shouldValidate: true })
                    if (result.timezone) {
                      setValue("timezone", result.timezone, { shouldValidate: true })
                    }
                  }}
                />
              </Field>

              {/* Hidden location fields populated by PlaceSearch */}
              <input type="hidden" {...register("lat", { valueAsNumber: true })} />
              <input type="hidden" {...register("lng", { valueAsNumber: true })} />
              <input type="hidden" {...register("timezone")} />
            </div>

              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 pt-2 mt-0 focus-visible:outline-none focus-visible:ring-0">
                {/* ── Advanced Options ──────────────────────────── */}

              {/* Divisional Charts */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Divisional Charts</FieldLabel>
                  <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-default">
                    {selectedCharts.length} selected
                  </Badge>
                </div>
                <Controller
                  name="divisionalCharts"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {DIVISIONAL_CHARTS.map((chart) => {
                        const checked = field.value.includes(chart.id)
                        return (
                          <button
                            key={chart.id}
                            type="button"
                            onClick={() => toggleDivisionalChart(chart.id, field.value)}
                            className={cn(
                              "flex flex-col items-start rounded-md border p-2 transition-all text-left",
                              checked
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-1.5 w-full">
                              <span className="text-[13px] font-bold">D{chart.id}</span>
                              <span className={cn("text-[11px] font-semibold truncate", checked ? "opacity-90" : "text-muted-foreground")}>{chart.label}</span>
                            </div>
                            <span className={cn("text-[10px] uppercase font-medium tracking-wider mt-0.5 truncate w-full", checked ? "opacity-70" : "text-muted-foreground")}>{chart.domain}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                <FieldError>{errors.divisionalCharts?.message}</FieldError>
              </Field>

              <Separator className="bg-border/50" />

              {/* Chart Inclusions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Calculations & Sections</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { name: "moonChart", label: "Moon Chart", desc: "Chandra lagna" },
                      { name: "sunChart", label: "Sun Chart", desc: "Surya lagna" },
                      { name: "chalitChart", label: "Chalit Chart", desc: "Bhava chalit" },
                      { name: "ashtakvarga", label: "Ashtakvarga", desc: "Bindus & sarva" },
                      { name: "transits", label: "Transits", desc: "Current Gochar" },
                      { name: "panchang", label: "Panchang", desc: "Tithi, nakshatra" },
                    ] as const
                  ).map(({ name, label, desc }) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field }) => (
                        <SwitchRow
                          id={name}
                          label={label}
                          description={desc}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Dasha Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vimshottari Dasha</Label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { val: 0, label: "None", desc: "No Dashas" },
                    { val: 1, label: "Level 1", desc: "Mahadasha only" },
                    { val: 2, label: "Level 2", desc: "Antardasha" },
                    { val: 3, label: "Level 3", desc: "Pratyantar" },
                  ].map((opt) => {
                    const currentVal = watch("dashas") ? watch("dashaDepth") : 0
                    const checked = currentVal === opt.val
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          if (opt.val === 0) {
                            setValue("dashas", false, { shouldValidate: true })
                          } else {
                            setValue("dashas", true, { shouldValidate: true })
                            setValue("dashaDepth", opt.val, { shouldValidate: true })
                          }
                        }}
                        className={cn(
                          "flex flex-col items-start rounded-xl border p-2.5 transition-all text-left",
                          checked
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span className="text-[13px] font-bold">
                          {opt.label}
                        </span>
                        <span className={cn("text-[11px] font-medium mt-0.5", checked ? "opacity-80" : "text-muted-foreground")}>
                          {opt.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className={cn("pt-2 transition-opacity duration-200", !watch("dashas") && "opacity-40 pointer-events-none")}>
                  <Controller
                    name="currentDashaOnly"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <Switch
                          id="currentDashaOnly"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="currentDashaOnly" className="text-sm cursor-pointer font-medium hover:text-foreground">
                          Current Dasha Only
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>

              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4">
          <Controller
            name="outputFormat"
            control={control}
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange} className="w-full sm:w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="PROMPT">PROMPT</TabsTrigger>
                  <TabsTrigger value="JSON">JSON</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />
          <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full sm:w-auto px-6 h-10 gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RiLoaderLine className="size-4 animate-spin" />
                Generating Chart…
              </>
            ) : (
              <>
                <RiSparklingLine className="size-4" />
                Generate Kundali
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Chart Output Modal ───────────────────────── */}
      <Dialog open={response !== null} onOpenChange={(open) => {
        if (!open) {
          setResponse(null)
          setCopied(false)
        }
      }}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg md:max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl border-zinc-700/50 dark:border-zinc-800 bg-zinc-950 gap-0 [&>button]:hidden">

          <DialogTitle className="sr-only">Chart Output</DialogTitle>
          <DialogDescription className="sr-only">Generated Astrology Data Results</DialogDescription>

          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900 shrink-0 relative overflow-hidden">
            <div className="flex items-center gap-2 z-10">
              <div className="flex gap-2 opacity-90 group transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setResponse(null)
                    setCopied(false)
                  }}
                  className="size-3.5 rounded-full bg-[#ff5f56] outline-none hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center cursor-pointer ring-1 ring-black/10 inset-shadow-xs"
                  aria-label="Close Window"
                />
                <div className="size-3.5 rounded-full bg-[#ffbd2e] ring-1 ring-black/10 inset-shadow-xs" />
                <div className="size-3.5 rounded-full bg-[#27c93f] ring-1 ring-black/10 inset-shadow-xs" />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-0 w-full pointer-events-none">
              <span className="text-[13px] font-mono font-medium tracking-wide text-zinc-400">
                {responseFormat === "JSON" ? "astrology_chart.json" : "astrology_prompt.txt"}
              </span>
            </div>

            <div className="z-10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-3 gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
                onClick={copyResponse}
                aria-label="Copy Output"
              >
                {copied ? (
                  <>
                    <RiCheckLine className="size-3.5 text-[#27c93f]" />
                    <span className="text-xs font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className="size-3.5" />
                    <span className="text-xs font-semibold">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden bg-zinc-950 rounded-b-lg">
            <ScrollArea className="absolute inset-0 w-full h-full">
              <div className="p-4 md:p-5">
                {responseFormat === "JSON" ? (
                  <pre className="text-[14px] leading-relaxed font-mono text-zinc-300 w-max min-w-full pb-4 pr-4">
                    {response}
                  </pre>
                ) : (
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-300 font-medium pb-4">
                    {response}
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
