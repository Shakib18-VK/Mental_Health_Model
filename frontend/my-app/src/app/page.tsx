"use client";

import React, { useRef, useState } from "react";
import {
  Brain,
  Smartphone,
  BookOpen,
  Activity,
  Moon,
  AlertCircle,
  Loader2,
  User,
  GraduationCap,
  RotateCcw,
  HeartPulse,
  Flame,
  Leaf,
  Unlock,
  Clock,
  Lightbulb,
  TriangleAlert,
  CircleCheck,
  Info,
} from "lucide-react";

/* ----------------------------- Types & data ----------------------------- */

type Gender = "Male" | "Female";
type AcademicLevel = "High School" | "Undergraduate" | "Graduate";
type Purpose = "Networking" | "Education" | "Entertainment" | "News";
type StressLevel = "Low" | "Medium" | "High" | "Very High";

interface StudentFormData {
  age: number;
  gender: Gender;
  country: string;
  academic_level: AcademicLevel;
  most_used_platform: string;
  purpose_of_use: Purpose;
  avg_daily_usage_hours: number;
  daily_unlocks: number;
  study_hours: number;
  physical_activity_hours: number;
  sleep_hours_per_night: number;
  stress_level: StressLevel;
}

interface PredictionResponse {
  predicted_mental_health_score: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://mental-health-model-m5n5.onrender.com/predict";

const PLATFORMS = [
  "Instagram",
  "YouTube",
  "WhatsApp",
  "LinkedIn",
  "Twitter",
  "Snapchat",
  "TikTok",
  "Facebook",
  "LINE",
  "KakaoTalk",
  "VKontakte",
  "WeChat",
];

const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Mexico",
  "Turkey",
  "Other",
];

const PURPOSES: Purpose[] = ["Entertainment", "Education", "Networking", "News"];
const LEVELS: AcademicLevel[] = ["High School", "Undergraduate", "Graduate"];

const STRESS_OPTIONS: { value: StressLevel; active: string }[] = [
  { value: "Low", active: "bg-emerald-600 border-emerald-600 text-white" },
  { value: "Medium", active: "bg-amber-500 border-amber-500 text-white" },
  { value: "High", active: "bg-orange-600 border-orange-600 text-white" },
  { value: "Very High", active: "bg-rose-600 border-rose-600 text-white" },
];

const INITIAL_DATA: StudentFormData = {
  age: 21,
  gender: "Male",
  country: "India",
  academic_level: "Undergraduate",
  most_used_platform: "Instagram",
  purpose_of_use: "Entertainment",
  avg_daily_usage_hours: 4.5,
  daily_unlocks: 65,
  study_hours: 3.5,
  physical_activity_hours: 1.0,
  sleep_hours_per_night: 7.0,
  stress_level: "Medium",
};

const PRESETS: Record<"balanced" | "overloaded", StudentFormData> = {
  balanced: {
    age: 22,
    gender: "Female",
    country: "India",
    academic_level: "Graduate",
    most_used_platform: "LinkedIn",
    purpose_of_use: "Education",
    avg_daily_usage_hours: 2.0,
    daily_unlocks: 30,
    study_hours: 5.0,
    physical_activity_hours: 1.5,
    sleep_hours_per_night: 8.0,
    stress_level: "Low",
  },
  overloaded: {
    age: 19,
    gender: "Male",
    country: "India",
    academic_level: "Undergraduate",
    most_used_platform: "Instagram",
    purpose_of_use: "Entertainment",
    avg_daily_usage_hours: 8.5,
    daily_unlocks: 140,
    study_hours: 1.5,
    physical_activity_hours: 0.0,
    sleep_hours_per_night: 4.5,
    stress_level: "Very High",
  },
};

/* ------------------------------- Helpers -------------------------------- */

const inputBase =
  "w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25";

function getScoreInfo(value: number) {
  if (value >= 7.5) {
    return {
      status: "Healthy and balanced",
      color: "#0f9d7a",
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
      note: "Your screen time, sleep and daily routine look well balanced. Keep it up.",
    };
  }
  if (value >= 5) {
    return {
      status: "Moderate wellness",
      color: "#d9922b",
      chip: "bg-amber-50 text-amber-800 border-amber-200",
      note: "Trimming screen time and adding more sleep or physical activity could raise your score.",
    };
  }
  return {
    status: "Needs attention",
    color: "#dc4a3d",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
    note: "Long screen hours and short sleep can raise stress. Plan regular breaks and more rest.",
  };
}

function getHabitRows(d: StudentFormData) {
  const sleep =
    d.sleep_hours_per_night < 6
      ? { label: "Too short", tone: "text-rose-700 bg-rose-50" }
      : d.sleep_hours_per_night <= 9
      ? { label: "Healthy range", tone: "text-emerald-700 bg-emerald-50" }
      : { label: "Quite long", tone: "text-amber-700 bg-amber-50" };

  const screen =
    d.avg_daily_usage_hours > 6
      ? { label: "High", tone: "text-rose-700 bg-rose-50" }
      : d.avg_daily_usage_hours > 3
      ? { label: "Moderate", tone: "text-amber-700 bg-amber-50" }
      : { label: "Low", tone: "text-emerald-700 bg-emerald-50" };

  const activity =
    d.physical_activity_hours < 0.5
      ? { label: "Too little", tone: "text-rose-700 bg-rose-50" }
      : d.physical_activity_hours < 1
      ? { label: "Could be more", tone: "text-amber-700 bg-amber-50" }
      : { label: "Good", tone: "text-emerald-700 bg-emerald-50" };

  return [
    { name: "Sleep", value: `${d.sleep_hours_per_night} h`, ...sleep },
    { name: "Screen time", value: `${d.avg_daily_usage_hours} h`, ...screen },
    { name: "Activity", value: `${d.physical_activity_hours} h`, ...activity },
  ];
}

type AdviceLevel = "high" | "medium" | "good";
interface Advice {
  level: AdviceLevel;
  title: string;
  text: string;
}

function getAdvice(d: StudentFormData, score: number): Advice[] {
  const list: Advice[] = [];

  // Sleep
  if (d.sleep_hours_per_night < 6) {
    list.push({
      level: "high",
      title: "Protect your sleep",
      text: `You sleep about ${d.sleep_hours_per_night} hours. Aim for 7 to 9. Fix a bedtime, keep your phone away from the bed and avoid screens for the last 30 minutes of the day.`,
    });
  } else if (d.sleep_hours_per_night < 7) {
    list.push({
      level: "medium",
      title: "Add a little more sleep",
      text: "You are close to the healthy range. Going to bed 30 to 45 minutes earlier can improve mood and focus.",
    });
  } else if (d.sleep_hours_per_night > 9) {
    list.push({
      level: "medium",
      title: "Keep a steady sleep schedule",
      text: "Sleeping much longer than 9 hours can leave you tired. Wake up at the same time every day, including weekends.",
    });
  }

  // Screen time
  if (d.avg_daily_usage_hours > 6) {
    list.push({
      level: "high",
      title: "Cut down screen time",
      text: `${d.avg_daily_usage_hours} hours a day is high. Try app timers, a screen-free hour after waking up, and replace one scrolling session with a walk or a call with a friend.`,
    });
  } else if (d.avg_daily_usage_hours > 3) {
    list.push({
      level: "medium",
      title: "Keep an eye on screen time",
      text: "Your usage is moderate. Use the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
    });
  }

  // Unlocks
  if (d.daily_unlocks > 100) {
    list.push({
      level: "high",
      title: "Reduce phone pickups",
      text: `${d.daily_unlocks} unlocks a day suggests constant checking. Turn off non-essential notifications and batch your checks into set times.`,
    });
  } else if (d.daily_unlocks > 60) {
    list.push({
      level: "medium",
      title: "Check your phone less often",
      text: "Try leaving your phone in another room while you study. It breaks the habit of reaching for it.",
    });
  }

  // Activity
  if (d.physical_activity_hours < 0.5) {
    list.push({
      level: "high",
      title: "Move your body daily",
      text: "Start small: a 20 to 30 minute walk, stretching or any sport you enjoy. Regular activity is one of the best natural mood boosters.",
    });
  } else if (d.physical_activity_hours < 1) {
    list.push({
      level: "medium",
      title: "Build up your activity",
      text: "You are on the right track. Aim for around an hour of movement a day, split into short sessions if needed.",
    });
  }

  // Stress
  if (d.stress_level === "High" || d.stress_level === "Very High") {
    list.push({
      level: "high",
      title: "Take stress seriously",
      text: "Try 5 minutes of slow breathing, short breaks between study blocks, and talk to a friend, family member or campus counselor. You do not have to handle it alone.",
    });
  } else if (d.stress_level === "Medium") {
    list.push({
      level: "medium",
      title: "Keep stress in check",
      text: "Plan your week, break big tasks into small ones and schedule time for things you enjoy.",
    });
  }

  // Study load
  if (d.study_hours > 10) {
    list.push({
      level: "medium",
      title: "Add breaks to long study days",
      text: "Studying more than 10 hours a day risks burnout. Use focused blocks of 50 minutes followed by 10 minute breaks.",
    });
  }

  // Entertainment-heavy usage
  if (d.purpose_of_use === "Entertainment" && d.avg_daily_usage_hours > 4) {
    list.push({
      level: "medium",
      title: `Balance your ${d.most_used_platform} time`,
      text: "Much of your screen time is for entertainment. Moving part of it to learning, hobbies or time with people offline can lift your mood.",
    });
  }

  const order: Record<AdviceLevel, number> = { high: 0, medium: 1, good: 2 };
  list.sort((a, b) => order[a.level] - order[b.level]);
  const top = list.slice(0, 6);

  if (top.length === 0 || score >= 7.5) {
    top.push({
      level: "good",
      title: "Keep up your healthy routine",
      text: "Your habits look balanced. Stay consistent, keep time for friends and hobbies, and check in with yourself regularly.",
    });
  }

  return top.slice(0, 6);
}

const ADVICE_STYLE: Record<
  AdviceLevel,
  { label: string; card: string; badge: string; Icon: typeof Info }
> = {
  high: {
    label: "High priority",
    card: "border-rose-200 bg-rose-50/60",
    badge: "bg-rose-100 text-rose-800",
    Icon: TriangleAlert,
  },
  medium: {
    label: "Worth improving",
    card: "border-amber-200 bg-amber-50/60",
    badge: "bg-amber-100 text-amber-800",
    Icon: Info,
  },
  good: {
    label: "Doing well",
    card: "border-emerald-200 bg-emerald-50/60",
    badge: "bg-emerald-100 text-emerald-800",
    Icon: CircleCheck,
  },
};

function extractError(data: unknown): string {
  const fallback = "The prediction request failed. Please try again.";
  if (!data || typeof data !== "object") return fallback;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: unknown[] };
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : "";
    return first.msg ? `${field ? field + ": " : ""}${first.msg}` : fallback;
  }
  return fallback;
}

/* ----------------------------- UI building blocks ----------------------------- */

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function SliderField({
  id,
  label,
  icon,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          {icon}
          {label}
        </label>
        <span className="whitespace-nowrap rounded-full bg-teal-50 px-2.5 py-0.5 text-sm font-bold text-teal-800">
          {value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        style={{
          background: `linear-gradient(to right, #0f766e ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  gridClass,
  activeClassFor,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  gridClass: string;
  activeClassFor?: (v: T) => string;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <div role="radiogroup" aria-label={label} className={`grid gap-2 ${gridClass}`}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt)}
              className={`min-h-[44px] cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                active
                  ? activeClassFor?.(opt) ??
                    "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* Semicircle gauge: the signature element of the page */
function ScoreGauge({ score }: { score: number | null }) {
  const pct = score === null ? 0 : Math.min(Math.max(score * 10, 0), 100);
  const color = score === null ? "#cbd5e1" : getScoreInfo(score).color;
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <svg viewBox="0 0 200 120" className="w-full" role="img" aria-label={score === null ? "Score gauge, no result yet" : `Score gauge showing ${score} out of 10`}>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - pct}
          style={{ transition: "stroke-dashoffset 900ms ease, stroke 400ms ease" }}
          className="motion-reduce:!transition-none"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
            {score === null ? "--" : score.toFixed(1)}
          </span>
          <span className="text-base font-semibold text-slate-400">/ 10</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Page --------------------------------- */

export default function MindPulsePage() {
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_DATA);
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<StudentFormData | null>(null);
  const adviceRef = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const update = <K extends keyof StudentFormData>(
    key: K,
    value: StudentFormData[K]
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (name: keyof typeof PRESETS) => {
    setError(null);
    setScore(null);
    setSubmitted(null);
    setFormData(PRESETS[name]);
  };

  const reset = () => {
    setFormData(INITIAL_DATA);
    setScore(null);
    setSubmitted(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(extractError(errData));
      }

      const data: PredictionResponse = await res.json();
      setScore(data.predicted_mental_health_score);
      setSubmitted({ ...formData });

      // On small screens the result sits below the form, so bring it into view
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setTimeout(
          () =>
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          120
        );
      }
    } catch (err) {
      setScore(null);
      setSubmitted(null);
      setError(
        err instanceof TypeError
          ? "Could not reach the server. Make sure the FastAPI backend is running."
          : err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const info = score !== null ? getScoreInfo(score) : null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#eef3f2] text-slate-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 min-[400px]:px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
              <Brain className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight">
                MindPulse AI
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Student mental health predictor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span className="hidden min-[360px]:inline">Reset</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pb-12 pt-6 min-[400px]:px-4 sm:px-6 sm:pt-10 lg:px-8">
        {/* Intro */}
        <div className="mb-7 max-w-3xl sm:mb-9">
          <h1 className="text-balance text-2xl font-extrabold leading-tight tracking-tight min-[400px]:text-3xl sm:text-4xl lg:text-5xl">
            See how your daily habits shape your mental wellbeing
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Enter your screen, study, sleep and stress details. Our model
            estimates a wellness score out of 10.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <span className="text-sm font-semibold text-slate-500">
              Try a sample:
            </span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => applyPreset("balanced")}
                className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Leaf className="h-4 w-4 shrink-0" aria-hidden />
                Balanced routine
              </button>
              <button
                type="button"
                onClick={() => applyPreset("overloaded")}
                className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              >
                <Flame className="h-4 w-4 shrink-0" aria-hidden />
                Heavy screen time
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 lg:col-span-7"
            noValidate
          >
            <Card
              icon={<User className="h-5 w-5" aria-hidden />}
              title="About you"
              subtitle="Basic and academic details"
            >
              <SliderField
                id="age"
                label="Age"
                value={formData.age}
                unit="yrs"
                min={10}
                max={100}
                step={1}
                onChange={(v) => update("age", v)}
              />

              <Segmented<Gender>
                label="Gender"
                options={["Male", "Female"]}
                value={formData.gender}
                onChange={(v) => update("gender", v)}
                gridClass="grid-cols-2"
              />

              <SelectField
                id="country"
                label="Country"
                value={formData.country}
                options={COUNTRIES}
                onChange={(v) => update("country", v)}
              />

              <div>
                <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <GraduationCap className="h-4 w-4 text-slate-400" aria-hidden />
                  Academic level
                </span>
                <Segmented<AcademicLevel>
                  label="Academic level"
                  options={LEVELS}
                  value={formData.academic_level}
                  onChange={(v) => update("academic_level", v)}
                  gridClass="grid-cols-1 sm:grid-cols-3"
                />
              </div>
            </Card>

            <Card
              icon={<Smartphone className="h-5 w-5" aria-hidden />}
              title="Screen habits"
              subtitle="How you use your phone and social media"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="platform"
                  label="Most used platform"
                  value={formData.most_used_platform}
                  options={PLATFORMS}
                  onChange={(v) => update("most_used_platform", v)}
                />
                <SelectField
                  id="purpose"
                  label="Main purpose"
                  value={formData.purpose_of_use}
                  options={PURPOSES}
                  onChange={(v) => update("purpose_of_use", v as Purpose)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <SliderField
                id="usage"
                label="Daily screen time"
                icon={<Clock className="h-4 w-4 text-slate-400" aria-hidden />}
                value={formData.avg_daily_usage_hours}
                unit="h"
                min={0}
                max={18}
                step={0.5}
                onChange={(v) => update("avg_daily_usage_hours", v)}
              />

              <SliderField
                id="unlocks"
                label="Daily phone unlocks"
                icon={<Unlock className="h-4 w-4 text-slate-400" aria-hidden />}
                value={formData.daily_unlocks}
                unit="times"
                min={0}
                max={250}
                step={5}
                onChange={(v) => update("daily_unlocks", v)}
              />
              </div>
            </Card>

            <Card
              icon={<HeartPulse className="h-5 w-5" aria-hidden />}
              title="Lifestyle and stress"
              subtitle="Study, movement, rest and how you feel"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <SliderField
                id="study"
                label="Study per day"
                icon={<BookOpen className="h-4 w-4 text-slate-400" aria-hidden />}
                value={formData.study_hours}
                unit="h"
                min={0}
                max={16}
                step={0.5}
                onChange={(v) => update("study_hours", v)}
              />
              <SliderField
                id="activity"
                label="Physical activity per day"
                icon={<Activity className="h-4 w-4 text-slate-400" aria-hidden />}
                value={formData.physical_activity_hours}
                unit="h"
                min={0}
                max={8}
                step={0.5}
                onChange={(v) => update("physical_activity_hours", v)}
              />
              <SliderField
                id="sleep"
                label="Sleep per night"
                icon={<Moon className="h-4 w-4 text-slate-400" aria-hidden />}
                value={formData.sleep_hours_per_night}
                unit="h"
                min={2}
                max={14}
                step={0.5}
                onChange={(v) => update("sleep_hours_per_night", v)}
              />
              </div>

              <Segmented<StressLevel>
                label="Stress level"
                options={STRESS_OPTIONS.map((s) => s.value)}
                value={formData.stress_level}
                onChange={(v) => update("stress_level", v)}
                gridClass="grid-cols-2 sm:grid-cols-4"
                activeClassFor={(v) =>
                  STRESS_OPTIONS.find((s) => s.value === v)?.active ?? ""
                }
              />
            </Card>

            {/* Submit: sticks to the bottom on phones so it is always reachable */}
            <div className="sticky bottom-0 z-20 -mx-3 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur min-[400px]:-mx-4 min-[400px]:px-4 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 text-base font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" aria-hidden />
                    Predict my score
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result */}
          <aside
            ref={resultRef}
            aria-live="polite"
            className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:col-span-5"
          >
            <h2 className="text-lg font-bold">Your result</h2>
            <p className="text-sm text-slate-500">
              Estimated by the machine learning model
            </p>

            <div className="mt-6">
              <ScoreGauge score={loading ? null : score} />
            </div>

            {loading && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Calculating your score...
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            {score === null && !error && !loading && (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Fill in your details and select Predict my score. Your result
                will appear here.
              </p>
            )}

            {score !== null && info && !loading && (
              <div className="mt-5 space-y-4">
                <div className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${info.chip}`}
                  >
                    {info.status}
                  </span>
                </div>
                <p className="rounded-xl bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600">
                  {info.note}
                </p>

                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-800">
                    Your habits at a glance
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {getHabitRows(submitted ?? formData).map((row) => (
                      <li
                        key={row.name}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                      >
                        <span className="font-medium text-slate-700">
                          {row.name}
                          <span className="ml-2 font-normal text-slate-400">
                            {row.value}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.tone}`}
                        >
                          {row.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <p className="mt-5 text-xs leading-relaxed text-slate-400">
              This tool gives a general estimate for learning purposes and is
              not a medical diagnosis. If you feel overwhelmed, please talk to
              a counselor or someone you trust.
            </p>
          </aside>
        </div>
        {/* Personalized advice */}
        {score !== null && submitted && !loading && (
          <section
            ref={adviceRef}
            aria-labelledby="advice-title"
            className="mt-8 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-10 sm:p-6 lg:p-8"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Lightbulb className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 id="advice-title" className="text-lg font-bold sm:text-xl">
                  Advice for you
                </h2>
                <p className="text-sm text-slate-500">
                  Suggestions based on the details you submitted, most
                  important first.
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {getAdvice(submitted, score).map((tip) => {
                const st = ADVICE_STYLE[tip.level];
                return (
                  <li
                    key={tip.title}
                    className={`flex flex-col gap-2 rounded-2xl border p-4 ${st.card}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <st.Icon className="h-5 w-5 shrink-0 text-slate-700" aria-hidden />
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badge}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {tip.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {tip.text}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3 sm:text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#0f9d7a]" />
                7.5 to 10: Healthy and balanced
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#d9922b]" />
                5 to 7.4: Moderate wellness
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#dc4a3d]" />
                Below 5: Needs attention
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}