"use client";

import { Clock, Zap, Film, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import { usePlan } from "@/hooks/usePlan";

export default function PlanStatsRow() {
  const {
    plan,
    credits,
    minutesUsed,
    minutesTotal,
    clipsThisMonth,
    clipsRemaining,
    totalClipsEver,
    overageAmount,
    monthlyCost,
  } = usePlan();

  // Card 1: Clips this month (same for all plans)
  const card1Sub =
    plan === "free"
      ? `${clipsRemaining ?? 0} remaining on free plan`
      : plan === "payg"
        ? `${clipsThisMonth} clips trimmed`
        : `${clipsThisMonth} clips this period`;

  // Card 2: Usage / credits
  let card2Label: string;
  let card2Value: string;
  let card2Sub: string;
  let card2Progress: { value: number; max: number } | undefined;

  if (plan === "free") {
    card2Label = "Minutes used";
    card2Value = `${minutesUsed.toFixed(1)}`;
    card2Sub = `of ${minutesTotal ?? 10} min this month`;
    card2Progress = { value: minutesUsed, max: minutesTotal ?? 10 };
  } else if (plan === "payg") {
    card2Label = "Credit balance";
    card2Value = `${(credits ?? 0).toFixed(1)} min`;
    card2Sub = (credits ?? 0) < 5 ? "Running low — top up soon" : "Pre-purchased credits";
  } else {
    card2Label = "Minutes used";
    card2Value = `${minutesUsed.toFixed(1)}`;
    card2Sub = `of ${minutesTotal ?? 300} min this month`;
    card2Progress = { value: minutesUsed, max: minutesTotal ?? 300 };
  }

  // Card 3: Plan-specific metric
  let card3Label: string;
  let card3Value: string;
  let card3Sub: string;

  if (plan === "free") {
    card3Label = "Free plan";
    card3Value = "10 min";
    card3Sub = "Upgrade for more quota";
  } else if (plan === "payg") {
    card3Label = "Spent this month";
    card3Value = `$${(monthlyCost / 100).toFixed(2)}`;
    card3Sub = "Pay-as-you-go usage";
  } else {
    card3Label = "Overage this month";
    card3Value = `$${(overageAmount / 100).toFixed(2)}`;
    card3Sub = "Overage at $0.05/min";
  }

  return (
    <>
      <StatsCard
        label="Clips this month"
        value={String(clipsThisMonth)}
        sub={card1Sub}
        icon={Film}
      />
      <StatsCard
        label={card2Label}
        value={card2Value}
        sub={card2Sub}
        icon={Clock}
        progress={card2Progress}
        accent={plan === "payg" && (credits ?? 0) < 5}
      />
      <StatsCard
        label={card3Label}
        value={card3Value}
        sub={card3Sub}
        icon={plan === "free" ? Zap : TrendingUp}
        accent={plan !== "free"}
      />
      <StatsCard
        label="Total clips ever"
        value={String(totalClipsEver)}
        sub="Since you joined"
        icon={Film}
      />
    </>
  );
}
