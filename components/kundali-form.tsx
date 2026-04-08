"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import {
  RiLoaderLine,
  RiFileCopyLine,
  RiCheckLine,
  RiSparklingLine,
  RiErrorWarningLine,
  RiUserLine,
  RiLayoutGridLine,
  RiFileTextLine,
  RiCodeLine,
  RiCloseLine,
  RiEditLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlaceSearch } from "@/components/place-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Frame, FramePanel } from "@/components/ui/frame"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  { id: 60, label: "Shashtiamsha", domain: "Past Karma" },
] as const

const CALC_SECTIONS = [
  { name: "moonChart", label: "Moon Chart", desc: "Chandra lagna" },
  { name: "sunChart", label: "Sun Chart", desc: "Surya lagna" },
  { name: "chalitChart", label: "Chalit Chart", desc: "Bhava chalit" },
  { name: "ashtakvarga", label: "Ashtakvarga", desc: "Bindus & sarva" },
  { name: "transits", label: "Transits", desc: "Current Gochar" },
  { name: "panchang", label: "Panchang", desc: "Tithi, nakshatra" },
] as const

const DASHA_OPTIONS = [
  { val: "0", label: "None", desc: "No Dashas" },
  { val: "1", label: "Level 1", desc: "Mahadasha only" },
  { val: "2", label: "Level 2", desc: "Antardasha" },
  { val: "3", label: "Level 3", desc: "Pratyantar" },
] as const

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z
    .string({ error: "Name must be a valid string" })
    .min(1, "Name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    error: "Gender must be MALE, FEMALE, or OTHER",
  }),
  dob: z.object({
    year: z
      .number({ error: "Year must be a number" })
      .int()
      .min(1900, "≥ 1900")
      .max(2100, "≤ 2100"),
    month: z
      .number({ error: "Month must be a number" })
      .int()
      .min(1, "1–12")
      .max(12, "1–12"),
    day: z
      .number({ error: "Day must be a number" })
      .int()
      .min(1, "1–31")
      .max(31, "1–31"),
  }),
  time: z.object({
    hour: z
      .number({ error: "Hour is required and must be a number" })
      .int()
      .min(1, "1–12")
      .max(12, "1–12"),
    minute: z
      .number({ error: "Minute is required and must be a number" })
      .int()
      .min(0, "0–59")
      .max(59, "0–59"),
  }),
  lat: z
    .number({ error: "Birth location is required" })
    .min(-90, "−90 to 90")
    .max(90, "−90 to 90"),
  lng: z
    .number({ error: "Birth location is required" })
    .min(-180, "−180 to 180")
    .max(180, "−180 to 180"),
  timezone: z
    .string({ error: "Timezone must be a string" })
    .min(1, "Timezone is required"),
  divisionalCharts: z
    .array(z.number())
    .min(1, "Select at least one divisional chart"),
  moonChart: z.boolean({ error: "moonChart must be a boolean" }),
  sunChart: z.boolean({ error: "sunChart must be a boolean" }),
  chalitChart: z.boolean({ error: "chalitChart must be a boolean" }),
  ashtakvarga: z.boolean({ error: "ashtakvarga must be a boolean" }),
  transits: z.boolean({ error: "transits must be a boolean" }),
  dashas: z.boolean({ error: "dashas must be a boolean" }),
  dashaDepth: z
    .number({ error: "dashaDepth must be a number" })
    .int()
    .min(1, "1–3")
    .max(3, "1–3"),
  currentDashaOnly: z.boolean({ error: "currentDashaOnly must be a boolean" }),
  panchang: z.boolean({ error: "panchang must be a boolean" }),
  outputFormat: z.enum(["JSON", "PROMPT"], { error: "Invalid output format" }),
})

type KundaliFormValues = z.infer<typeof formSchema>

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) return false
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  return { copied, copy }
}

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
    <div className="flex items-center justify-between gap-4 rounded-md border p-3 shadow-sm transition-colors hover:bg-accent/50">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function KundaliForm() {
  const [response, setResponse] = useState<string | null>(null)
  const [responseFormat, setResponseFormat] = useState<"JSON" | "PROMPT">(
    "PROMPT"
  )
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM")
  const [manualLocation, setManualLocation] = useState(false)
  const [selectedPlaceName, setSelectedPlaceName] = useState("")
  const { copied, copy } = useCopyToClipboard()

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
      time: { hour: 12, minute: 0 },
      lat: undefined,
      lng: undefined,
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
  const dashasEnabled = watch("dashas")

  function toggleChart(
    id: KundaliFormValues["divisionalCharts"][number],
    current: KundaliFormValues["divisionalCharts"]
  ) {
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id]
    setValue("divisionalCharts", next, { shouldValidate: true })
  }

  function onInvalid() {
    const hasBasicError = !!(
      errors.name ||
      errors.gender ||
      errors.dob ||
      errors.time ||
      errors.lat ||
      errors.lng ||
      errors.timezone
    )
    if (hasBasicError) {
      setActiveTab("basic")
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
        el?.focus()
      }, 50)
    }
  }

  async function onSubmit(data: KundaliFormValues) {
    setResponse(null)
    setResponseFormat(data.outputFormat)
    // Convert 12-hour AM/PM to 24-hour
    const h = data.time.hour
    let hour24: number
    if (ampm === "AM") {
      hour24 = h === 12 ? 0 : h
    } else {
      hour24 = h === 12 ? 12 : h + 12
    }
    data = { ...data, time: { ...data.time, hour: hour24 } }
    const endpoint =
      process.env.NEXT_PUBLIC_CHART_API_URL ?? "/api/generate-chart"
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
            <Alert className="border-destructive/30 bg-destructive/4 shadow-lg [&>svg]:text-destructive">
              <RiErrorWarningLine />
              <AlertTitle className="font-semibold">
                Server returned {res.status}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {text || res.statusText}
              </AlertDescription>
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
            <AlertDescription className="text-xs">
              {err instanceof Error ? err.message : String(err)}
            </AlertDescription>
          </Alert>
        ),
        { id: "api-error" }
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-6">
      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <Frame>
        <FramePanel className="p-0!">
          {/* Titlebar */}
          <div className="relative flex shrink-0 items-center overflow-hidden border-b bg-muted/40 px-4 py-4">
            <div className="z-10 flex gap-2">
              <div className="size-3.5 rounded-full bg-[#ff5f56] ring-1 ring-border/50" />
              <div className="size-3.5 rounded-full bg-[#ffbd2e] ring-1 ring-border/50" />
              <div className="size-3.5 rounded-full bg-[#27c93f] ring-1 ring-border/50" />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 font-mono text-sm font-medium tracking-wide text-muted-foreground">
                <RiSparklingLine className="size-3.5" />
                kundali_generator
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <form
              id="kundali-form"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-8"
            >
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "basic" | "advanced")}
                className="w-full max-w-xl"
              >
                <TabsList className="mb-8 grid w-full grid-cols-2">
                  <TabsTrigger value="basic">
                    <RiUserLine className="size-3.5" />
                    Birth Details
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    <RiLayoutGridLine className="size-3.5" />
                    Chart Settings
                  </TabsTrigger>
                </TabsList>

                {/* ── Birth Details ── */}
                <TabsContent
                  value="basic"
                  className="mt-0 space-y-6 focus-visible:ring-0 focus-visible:outline-none"
                >
                  {/* Personal */}
                  <div className="space-y-5">
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        id="name"
                        placeholder="e.g. Maharishi Bhrigu"
                        className="h-10 text-[15px]"
                        {...register("name")}
                        aria-invalid={!!errors.name}
                      />
                      <FieldError>{errors.name?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Gender</FieldLabel>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-3 gap-3"
                          >
                            {[
                              { val: "MALE", label: "Male" },
                              { val: "FEMALE", label: "Female" },
                              { val: "OTHER", label: "Other" },
                            ].map((opt) => (
                              <FieldLabel key={opt.val} htmlFor={opt.val}>
                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    value={opt.val}
                                    id={opt.val}
                                  />
                                  {opt.label}
                                </Field>
                              </FieldLabel>
                            ))}
                          </RadioGroup>
                        )}
                      />
                      <FieldError>{errors.gender?.message}</FieldError>
                    </Field>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          id: "year",
                          label: "Year",
                          placeholder: "YYYY",
                          field: "dob.year" as const,
                          min: 1900,
                          max: 2100,
                          error: errors.dob?.year,
                        },
                        {
                          id: "month",
                          label: "Month",
                          placeholder: "MM",
                          field: "dob.month" as const,
                          min: 1,
                          max: 12,
                          error: errors.dob?.month,
                        },
                        {
                          id: "day",
                          label: "Day",
                          placeholder: "DD",
                          field: "dob.day" as const,
                          min: 1,
                          max: 31,
                          error: errors.dob?.day,
                        },
                      ].map(
                        ({
                          id,
                          label,
                          placeholder,
                          field,
                          min,
                          max,
                          error,
                        }) => (
                          <Field key={id}>
                            <FieldLabel
                              htmlFor={id}
                              className="text-xs text-muted-foreground uppercase"
                            >
                              {label}
                            </FieldLabel>
                            <Input
                              id={id}
                              type="number"
                              min={min}
                              max={max}
                              placeholder={placeholder}
                              className="h-10 tabular-nums"
                              {...register(field, { valueAsNumber: true })}
                              aria-invalid={!!error}
                            />
                            <FieldError>{error?.message}</FieldError>
                          </Field>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Field>
                        <FieldLabel
                          htmlFor="hour"
                          className="text-xs text-muted-foreground uppercase"
                        >
                          Hour
                        </FieldLabel>
                        <Input
                          id="hour"
                          type="number"
                          min={1}
                          max={12}
                          placeholder="HH"
                          className="h-10 tabular-nums"
                          {...register("time.hour", { valueAsNumber: true })}
                          aria-invalid={!!errors.time?.hour}
                        />
                        <FieldError>{errors.time?.hour?.message}</FieldError>
                      </Field>
                      <Field>
                        <FieldLabel
                          htmlFor="minute"
                          className="text-xs text-muted-foreground uppercase"
                        >
                          Minute
                        </FieldLabel>
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
                        <FieldLabel className="text-xs text-muted-foreground uppercase">
                          AM/PM
                        </FieldLabel>
                        <Select value={ampm} onValueChange={(v) => setAmpm(v as "AM" | "PM")}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>

                  {/* Location */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Birth Location</FieldLabel>
                      <Button
                        type="button"
                        variant={manualLocation ? "default" : "ghost"}
                        size="icon-xs"
                        onClick={() => setManualLocation((v) => !v)}
                        aria-label="Enter coordinates manually"
                        title="Enter coordinates manually"
                      >
                        <RiEditLine className="size-3.5" />
                      </Button>
                    </div>

                    {!manualLocation ? (
                      <>
                        <PlaceSearch
                          className="h-10 text-[15px]"
                          invalid={!!(errors.lat || errors.lng)}
                          value={selectedPlaceName}
                          onSelect={(result) => {
                            setSelectedPlaceName(result.displayName)
                            setValue("lat", result.latitude, {
                              shouldValidate: true,
                            })
                            setValue("lng", result.longitude, {
                              shouldValidate: true,
                            })
                            if (result.timezone) {
                              setValue("timezone", result.timezone, {
                                shouldValidate: true,
                              })
                            }
                          }}
                        />
                        <FieldError>
                          {errors.lat?.message ?? errors.lng?.message}
                        </FieldError>
                        <input
                          type="hidden"
                          {...register("lat", { valueAsNumber: true })}
                        />
                        <input
                          type="hidden"
                          {...register("lng", { valueAsNumber: true })}
                        />
                        <input type="hidden" {...register("timezone")} />
                      </>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <Field>
                          <FieldLabel
                            htmlFor="lat"
                            className="text-xs text-muted-foreground uppercase"
                          >
                            Latitude
                          </FieldLabel>
                          <Input
                            id="lat"
                            type="number"
                            step="any"
                            placeholder="28.6139"
                            className="h-10 tabular-nums"
                            {...register("lat", { valueAsNumber: true })}
                            aria-invalid={!!errors.lat}
                          />
                          <FieldError>{errors.lat?.message}</FieldError>
                        </Field>
                        <Field>
                          <FieldLabel
                            htmlFor="lng"
                            className="text-xs text-muted-foreground uppercase"
                          >
                            Longitude
                          </FieldLabel>
                          <Input
                            id="lng"
                            type="number"
                            step="any"
                            placeholder="77.2090"
                            className="h-10 tabular-nums"
                            {...register("lng", { valueAsNumber: true })}
                            aria-invalid={!!errors.lng}
                          />
                          <FieldError>{errors.lng?.message}</FieldError>
                        </Field>
                        <Field>
                          <FieldLabel
                            htmlFor="timezone"
                            className="text-xs text-muted-foreground uppercase"
                          >
                            Timezone
                          </FieldLabel>
                          <Input
                            id="timezone"
                            type="text"
                            placeholder="Asia/Kolkata"
                            className="h-10"
                            {...register("timezone")}
                            aria-invalid={!!errors.timezone}
                          />
                          <FieldError>{errors.timezone?.message}</FieldError>
                        </Field>
                      </div>
                    )}
                  </Field>
                </TabsContent>

                {/* ── Chart Settings ── */}
                <TabsContent
                  value="advanced"
                  className="mt-0 space-y-6 focus-visible:ring-0 focus-visible:outline-none"
                >
                  {/* Divisional Charts */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Divisional Charts</FieldLabel>
                      <Badge
                        variant="default"
                        className="cursor-default px-2 py-0.5 text-[11px] font-medium"
                      >
                        {selectedCharts.length} selected
                      </Badge>
                    </div>
                    <Controller
                      name="divisionalCharts"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {DIVISIONAL_CHARTS.map((chart) => (
                            <FieldLabel
                              key={chart.id}
                              htmlFor={`chart-${chart.id}`}
                            >
                              <Field>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <Checkbox
                                      id={`chart-${chart.id}`}
                                      checked={field.value.includes(chart.id)}
                                      onCheckedChange={() =>
                                        toggleChart(chart.id, field.value)
                                      }
                                    />
                                    <span className="shrink-0 text-sm font-bold">
                                      D{chart.id}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                      {chart.label}
                                    </span>
                                  </div>
                                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    {chart.domain}
                                  </span>
                                </div>
                              </Field>
                            </FieldLabel>
                          ))}
                        </div>
                      )}
                    />
                    <FieldError>{errors.divisionalCharts?.message}</FieldError>
                  </Field>

                  <Separator className="bg-border/50" />

                  {/* Calculations & Sections */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Calculations & Sections
                    </Label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {CALC_SECTIONS.map(({ name, label, desc }) => (
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

                  {/* Vimshottari Dasha */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Vimshottari Dasha
                    </Label>
                    <RadioGroup
                      value={String(dashasEnabled ? watch("dashaDepth") : 0)}
                      onValueChange={(val) => {
                        if (val === "0") {
                          setValue("dashas", false, { shouldValidate: true })
                        } else {
                          setValue("dashas", true, { shouldValidate: true })
                          setValue("dashaDepth", Number(val), {
                            shouldValidate: true,
                          })
                        }
                      }}
                      className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4"
                    >
                      {DASHA_OPTIONS.map((opt) => (
                        <FieldLabel key={opt.val} htmlFor={`dasha-${opt.val}`}>
                          <Field>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <RadioGroupItem
                                  value={opt.val}
                                  id={`dasha-${opt.val}`}
                                />
                                <span className="text-sm font-bold">
                                  {opt.label}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {opt.desc}
                              </span>
                            </div>
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>

                    <div
                      className={cn(
                        "pt-2 transition-opacity duration-200",
                        !dashasEnabled && "pointer-events-none opacity-40"
                      )}
                    >
                      <Controller
                        name="currentDashaOnly"
                        control={control}
                        render={({ field }) => (
                          <Field orientation="horizontal">
                            <Switch
                              id="currentDashaOnly"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FieldLabel htmlFor="currentDashaOnly">
                              Current Dasha Only
                            </FieldLabel>
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </div>

          {/* Footer */}
          <div className="flex flex-col justify-between gap-4 border-t bg-muted/50 px-6 py-4 sm:flex-row">
            <Controller
              name="outputFormat"
              control={control}
              render={({ field }) => (
                <Tabs
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-full sm:w-[200px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="PROMPT">
                      <RiFileTextLine className="size-3.5" />
                      PROMPT
                    </TabsTrigger>
                    <TabsTrigger value="JSON">
                      <RiCodeLine className="size-3.5" />
                      JSON
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />
            <Button
              type="button"
              onClick={handleSubmit(onSubmit, onInvalid)}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
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
          </div>
        </FramePanel>
      </Frame>

      {/* ── Output Modal ──────────────────────────────────────────────────────── */}
      <Dialog
        open={response !== null}
        onOpenChange={(open) => {
          if (!open) setResponse(null)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex! h-[80vh] w-[95vw] flex-col! bg-transparent! p-0 shadow-none! ring-0! sm:w-full sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Chart Output</DialogTitle>
          <DialogDescription className="sr-only">
            Generated Astrology Data Results
          </DialogDescription>

          <Frame className="min-h-0 flex-1">
            <FramePanel className="flex h-full flex-col overflow-hidden p-0!">
              <DialogHeader className="relative shrink-0 flex-row items-center border-b px-4 py-3 [.border-b]:pb-3">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[13px] font-medium tracking-wide text-muted-foreground">
                    {responseFormat === "JSON"
                      ? "astrology_chart.json"
                      : "astrology_prompt.txt"}
                  </span>
                </div>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="ml-auto text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    />
                  }
                >
                  <RiCloseLine className="size-4" />
                </DialogClose>
              </DialogHeader>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <ScrollArea className="absolute inset-0 h-full w-full">
                  <div className="p-4 md:p-5">
                    {responseFormat === "JSON" ? (
                      <pre className="w-max min-w-full pr-4 pb-4 font-mono text-[14px] leading-relaxed text-foreground">
                        {response}
                      </pre>
                    ) : (
                      <div className="pb-4 text-[15px] leading-relaxed font-medium whitespace-pre-wrap text-foreground">
                        {response}
                      </div>
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <DialogFooter className="mx-0 mb-0">
                <Button
                  type="button"
                  onClick={() => copy(response ?? "")}
                  aria-label="Copy Output"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <RiCheckLine className="size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine className="size-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </DialogFooter>
            </FramePanel>
          </Frame>
        </DialogContent>
      </Dialog>
    </div>
  )
}
