import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Sparkles,
  X
} from "lucide-react";
import { apiFetch } from "../app/apiClient";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

type StepKey = "DETAILS" | "CONTEXT" | "ASSETS" | "REVIEW";

const steps: Array<{ key: StepKey; label: string }> = [
  { key: "DETAILS", label: "Details" },
  { key: "CONTEXT", label: "Context" },
  { key: "ASSETS", label: "Assets" },
  { key: "REVIEW", label: "Review" }
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function suggestFromText(subject: string, description: string) {
  const t = `${subject}\n${description}`.toLowerCase();

  const tags: string[] = [];
  if (t.includes("api") || t.includes("latency") || t.includes("timeout") || t.includes("server")) {
    tags.push("Backend/Infrastructure");
  }
  if (t.includes("wifi") || t.includes("network") || t.includes("lan") || t.includes("vpn")) {
    tags.push("Network");
  }
  if (t.includes("sap") || t.includes("solman") || t.includes("sso")) {
    tags.push("Enterprise App");
  }
  if (t.includes("printer") || t.includes("laptop") || t.includes("keyboard") || t.includes("hardware")) {
    tags.push("Hardware");
  }

  let urgency: "Low" | "Medium" | "High" | "Critical" = "Medium";
  if (t.includes("down") || t.includes("outage") || t.includes("sev") || t.includes("urgent")) urgency = "High";
  if (t.includes("critical") || t.includes("sev1") || t.includes("production down")) urgency = "Critical";

  if (tags.length === 0) tags.push("General IT");
  return { tags: Array.from(new Set(tags)).slice(0, 2), urgency };
}

function Stepper({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {steps.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;

            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold",
                      active && "border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-glowViolet",
                      done && "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    )}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <div className={cn("text-xs font-medium", active ? "text-slate-100" : "text-slate-400")}>
                    {s.label}
                  </div>
                </div>

                {i !== steps.length - 1 && (
                  <div className="hidden h-[2px] w-16 rounded-full bg-white/10 md:block">
                    <div
                      className={cn(
                        "h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all",
                        done ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-slate-100">Create New Ticket</div>
          <div className="mt-1 text-xs text-slate-400">
            Step {stepIndex + 1} of {steps.length}: {steps[stepIndex].label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTicketPage() {
  const nav = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);

  // step 1
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // step 2
  const [impact, setImpact] = useState<"Individual" | "Department">("Individual");
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");

  // step 3
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // AI UI
  const [aiBusy, setAiBusy] = useState(false);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiUrgency, setAiUrgency] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");

  // submit
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepKey = steps[stepIndex].key;

  // fake AI analysis (frontend-only visual; backend has assistive routing anyway)
  useEffect(() => {
    const hasText = subject.trim().length > 0 || description.trim().length > 0;
    if (!hasText) {
      setAiTags([]);
      setAiUrgency("Medium");
      return;
    }

    setAiBusy(true);
    const id = setTimeout(() => {
      const s = suggestFromText(subject, description);
      setAiTags(s.tags);
      setAiUrgency(s.urgency);
      // gently align urgency unless user changed it already
      setUrgency((u) => u || s.urgency);
      setAiBusy(false);
    }, 700);

    return () => clearTimeout(id);
  }, [subject, description]);

  const canNext = useMemo(() => {
    if (stepKey === "DETAILS") return subject.trim().length >= 3 && description.trim().length >= 10;
    return true;
  }, [stepKey, subject, description]);

  function next() {
    setErr(null);
    if (!canNext) {
      setErr("Please provide a clear title and description to proceed.");
      return;
    }
    setStepIndex((i) => clamp(i + 1, 0, steps.length - 1));
  }

  function back() {
    setErr(null);
    setStepIndex((i) => clamp(i - 1, 0, steps.length - 1));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    setFiles((prev) => {
      const merged = [...prev, ...incoming];
      // keep reasonable list in UI
      return merged.slice(0, 6);
    });
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    setErr(null);
    setSubmitting(true);

    try {
      // attachments UI is present; backend upload can be added later.
      const data = await apiFetch<{ ticketId: string }>("/tickets", {
        method: "POST",
        body: JSON.stringify({ subject, description })
      });
      nav(`/tickets/${data.ticketId}`);
    } catch (e: any) {
      setErr(e.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Stepper stepIndex={stepIndex} />

      {/* main content */}
      <div className="grid grid-cols-1 gap-4">
        {/* STEP 1: Details */}
        {stepKey === "DETAILS" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-violet-500/10 shadow-glowViolet">
                    <Sparkles className="h-5 w-5 text-violet-200" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-100">Issue Description</div>
                    <div className="text-sm text-slate-400">Provide a concise title and detailed context.</div>
                  </div>
                </div>

                <Badge variant="violet" className={cn("w-fit", aiBusy ? "opacity-100" : "opacity-70")}>
                  {aiBusy ? "AI ANALYZING…" : "AI READY"}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Ticket Title</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="System latency during high-volume batch processing"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe impact, scope, error messages, timestamps, and what you already tried…"
                    className="min-h-[180px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs text-slate-500">AI Suggestions:</div>
                  {aiTags.length === 0 ? (
                    <Badge>—</Badge>
                  ) : (
                    aiTags.map((t) => (
                      <Badge key={t} variant="violet">
                        {t}
                      </Badge>
                    ))
                  )}
                  <Badge variant="cyan">⚡ {aiUrgency} urgency</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Context */}
        {stepKey === "CONTEXT" && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-100">Priority & Impact</div>
                  <div className="mt-1 text-sm text-slate-400">Help us route your ticket correctly.</div>
                </div>
                <Badge variant="cyan">AI recommended: {aiUrgency}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Label>Impact Level</Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setImpact("Individual")}
                      className={cn(
                        "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition",
                        impact === "Individual" && "border-violet-500/30 bg-violet-500/10 shadow-glowViolet"
                      )}
                    >
                      Individual
                      <div className="mt-1 text-xs text-slate-500">Single user impact</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImpact("Department")}
                      className={cn(
                        "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition",
                        impact === "Department" && "border-violet-500/30 bg-violet-500/10 shadow-glowViolet"
                      )}
                    >
                      Department
                      <div className="mt-1 text-xs text-slate-500">Multiple users affected</div>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Label>Urgency</Label>
                  <select
                    className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-100 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                  >
                    <option value="Low">Low — minor inconvenience</option>
                    <option value="Medium">Medium — normal business impact</option>
                    <option value="High">High — critical process impacted</option>
                    <option value="Critical">Critical — production/service down</option>
                  </select>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="violet">Impact: {impact}</Badge>
                    <Badge variant="cyan">Urgency: {urgency}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Assets */}
        {stepKey === "ASSETS" && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-100">Supporting Evidence</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Add logs or screenshots (UI-only in this MVP; upload backend can be added later).
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  <FileUp className="h-4 w-4" />
                  Add files
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              <div
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-200/10 via-white/[0.02] to-rose-300/10 p-8"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative grid place-items-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/10">
                    <FileUp className="h-6 w-6 text-slate-100" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-100">
                    Drag and drop logs or screenshots
                  </div>
                  <div className="mt-1 text-xs text-slate-400">PNG, JPG, PDF, LOG (UI-only)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-100">{f.name}</div>
                      <div className="text-xs text-slate-500">{Math.round(f.size / 1024)} KB</div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {files.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400 md:col-span-2">
                    No files added yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Review */}
        {stepKey === "REVIEW" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-100">Final Review</div>
                  <div className="mt-1 text-sm text-slate-400">Confirm before submission.</div>
                </div>
                <Badge variant="green">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)]" />
                  Ready
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-slate-500">Title</div>
                  <div className="mt-1 text-sm font-semibold text-slate-100">{subject || "—"}</div>
                  <div className="mt-3 text-xs text-slate-500">Description</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                    {description || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">AI Suggestions</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {aiTags.map((t) => (
                        <Badge key={t} variant="violet">{t}</Badge>
                      ))}
                      <Badge variant="cyan">{aiUrgency} urgency</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Selected Context</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="violet">Impact: {impact}</Badge>
                      <Badge variant="cyan">Urgency: {urgency}</Badge>
                      <Badge>Files: {files.length}</Badge>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                    Submission will always succeed even if AI / external systems are down (fallback rules + sync queue).
                  </div>
                </div>
              </div>

              {err && (
                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {err}
                </div>
              )}

              <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-5 md:flex-row">
                <div className="text-xs text-slate-500">
                  PRESS <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">ENTER</span> TO PROCEED
                </div>
                <div className="flex w-full gap-3 md:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full md:w-auto"
                    onClick={() => setErr("Draft saved locally (placeholder).")}
                    disabled={submitting}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full md:w-auto"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* bottom navigation like screenshot */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setErr("Draft saved locally (placeholder).")}
              disabled={submitting}
            >
              Save as Draft
            </Button>

            {stepKey !== "REVIEW" ? (
              <Button variant="primary" onClick={next} disabled={!canNext || submitting}>
                Next: {steps[stepIndex + 1]?.label ?? "Review"} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {err && stepKey !== "REVIEW" && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}