"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Hobby",
    description: "个人项目与试验田",
    monthly: 0,
    yearly: 0,
    features: ["3 projects", "Community support", "Unlimited previews"],
    highlighted: false,
  },
  {
    name: "Pro",
    description: "独立开发者与小团队",
    monthly: 19,
    yearly: 15,
    features: [
      "Unlimited projects",
      "Custom domains",
      "Priority support",
      "Usage analytics",
    ],
    highlighted: true,
  },
  {
    name: "Studio",
    description: "需要协作与审计的团队",
    monthly: 49,
    yearly: 39,
    features: ["Everything in Pro", "5 team seats", "SSO & audit log", "SLA"],
    highlighted: false,
  },
];

export default function Demo() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="bg-white px-6 py-16 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl text-2xl">
            Simple pricing
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            随时取消，按年付费节省 20%。
          </p>

          <div
            role="group"
            aria-label="Billing period"
            className="mt-6 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {[
              { label: "Monthly", value: false },
              { label: "Yearly", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={yearly === option.value}
                onClick={() => setYearly(option.value)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  yearly === option.value
                    ? "bg-white font-medium text-zinc-900 dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-emerald-400/70 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-500/5"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-semibold text-zinc-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    /mo
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    plan.highlighted
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "border border-zinc-300 text-zinc-800 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500"
                  }`}
                >
                  {plan.monthly === 0 ? "Start for free" : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
