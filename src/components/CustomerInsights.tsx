import { motion } from "motion/react";
import { ShieldAlert, TrendingDown, RefreshCw, Layers, DollarSign, ArrowUpRight, HelpCircle } from "lucide-react";
import { SegmentSummary } from "../types";

export default function CustomerInsights() {
  const segments: SegmentSummary[] = [
    {
      segmentName: "Vulnerable Month-to-Month Fibers",
      size: 240,
      churnRate: 68.5,
      avgMonthlyCharges: 89.4,
      avgTenure: 4.8,
      revenueAtRisk: 14695,
    },
    {
      segmentName: "Unsecured DSL Subscribers",
      size: 155,
      churnRate: 41.2,
      avgMonthlyCharges: 52.8,
      avgTenure: 12.2,
      revenueAtRisk: 3372,
    },
    {
      segmentName: "High Charges/Low Tenure Auto-Payers",
      size: 80,
      churnRate: 31.8,
      avgMonthlyCharges: 104.5,
      avgTenure: 8.5,
      revenueAtRisk: 2659,
    },
    {
      segmentName: "Stable Multi-Year Loyalists",
      size: 525,
      churnRate: 2.4,
      avgMonthlyCharges: 61.2,
      avgTenure: 58.4,
      revenueAtRisk: 771,
    },
  ];

  const highRiskList = [
    {
      id: "CUST-8374",
      name: "Eleanor Vance",
      tenure: 2,
      contract: "Month-to-month",
      monthlyCharges: 90.25,
      paymentMethod: "Electronic check",
      prob: 88.4,
      reason: "No Tech Support, Month-to-Month Fiber Optic",
    },
    {
      id: "CUST-2931",
      name: "Marcus Aurelius",
      tenure: 5,
      contract: "Month-to-month",
      monthlyCharges: 79.9,
      paymentMethod: "Electronic check",
      prob: 84.1,
      reason: "Electronic check, Month-to-Month Contract",
    },
    {
      id: "CUST-9902",
      name: "Clara Temple",
      tenure: 1,
      contract: "Month-to-month",
      monthlyCharges: 95.15,
      paymentMethod: "Mailed check",
      prob: 81.6,
      reason: "Fiber internet with no Online Security bundle",
    },
    {
      id: "CUST-1049",
      name: "Dominic Cobb",
      tenure: 8,
      contract: "One year",
      monthlyCharges: 102.4,
      paymentMethod: "Electronic check",
      prob: 62.4,
      reason: "High monthly billing density, Electronic Check",
    },
  ];

  const strategies = [
    {
      name: "12-Month Contract Migration",
      target: "Month-to-Month Accounts",
      cost: "15% discount incentive",
      impact: "Expected 60% Churn reduction in cohort",
    },
    {
      name: "Complimentary Support Bundle",
      target: "Fiber subscribers with no security/support",
      cost: "Free 3-month trial (costs $0 marginal)",
      impact: "Expected 45% Churn reduction in cohort",
    },
    {
      name: "ACH Automated Billing Conversion",
      target: "Electronic Check subscribers",
      cost: "One-time $10 promotional bill credit",
      impact: "Expected 35% Churn reduction in cohort",
    },
  ];

  const totalAtRisk = segments.reduce((sum, s) => sum + (s.churnRate > 30 ? s.revenueAtRisk : 0), 0);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-[#e2e8f0] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Strategic Customer Insights
          </h1>
          <p className="text-sm text-[#64748b]">
            Automated customer segments and high-risk cohort matrices, translating classification scores into revenue preservation decisions.
          </p>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* At risk MRR Card */}
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm space-y-3 lg:col-span-1">
          <div className="flex items-center gap-2 text-rose-800">
            <DollarSign className="h-5 w-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Identified MRR At Risk</h3>
          </div>
          <div className="text-4xl font-extrabold text-[#0f172a]">${totalAtRisk.toLocaleString()}</div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Sum of Monthly Recurring Revenue (MRR) from high-churn vulnerability cohorts (Churn rate &gt; 30%). Targeting these groups presents major cost savings.
          </p>
        </div>

        {/* Dynamic Segment List */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#3b82f6]" />
            Algorithmic Customer Segmentations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((s, idx) => (
              <div key={idx} className="rounded-lg border border-slate-100 p-3 space-y-2 hover:border-[#e2e8f0] hover:bg-[#f8fafc] transition-all">
                <div className="flex items-start justify-between">
                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{s.segmentName}</h5>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    s.churnRate > 50
                      ? "bg-rose-100 text-rose-800 animate-pulse"
                      : s.churnRate > 25
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {s.churnRate}% Churn
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                  <div>
                    <span className="block font-medium">Cohort Size</span>
                    <span className="font-bold text-slate-800">{s.size} accts</span>
                  </div>
                  <div>
                    <span className="block font-medium">Avg Tenure</span>
                    <span className="font-bold text-slate-800">{s.avgTenure} mos</span>
                  </div>
                  <div>
                    <span className="block font-medium">MRR Risk</span>
                    <span className="font-bold text-slate-800">${s.revenueAtRisk.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom split: High Risk accounts & Retention campaigns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 items-start">
        {/* High Risk Customer list */}
        <div className="lg:col-span-3 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            Critical Vulnerability Watchlist (Top High-Risk Accounts)
          </h4>
          <div className="space-y-3">
            {highRiskList.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-100 p-3 flex flex-wrap items-center justify-between gap-3 hover:bg-[#f8fafc] hover:border-[#e2e8f0] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tenure: <span className="font-semibold text-slate-700">{c.tenure} mos</span> | Billing: <span className="font-semibold text-slate-700">${c.monthlyCharges}</span> | Pay: <span className="font-semibold text-slate-700">{c.paymentMethod}</span>
                  </p>
                  <p className="text-[10px] text-rose-600 font-medium italic">Vulnerability: {c.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-rose-600">{c.prob}% Churn</div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Calculated Risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention planner */}
        <div className="lg:col-span-2 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            Amazon-Grade Proactive Retention Strategy Planner
          </h4>
          <div className="space-y-4">
            {strategies.map((strat, idx) => (
              <div key={idx} className="rounded-lg border border-slate-100 bg-[#f8fafc]/60 p-3.5 space-y-2 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{strat.name}</span>
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    High ROI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Target cohort: <span className="font-semibold text-slate-700">{strat.target}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 pt-2 mt-1">
                  <div>
                    <span className="block text-slate-400 uppercase tracking-wider text-[8px]">Offer Cost</span>
                    <span className="font-semibold text-slate-700">{strat.cost}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase tracking-wider text-[8px]">Projected Outcome</span>
                    <span className="font-semibold text-[#0f172a]">{strat.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
