import { motion } from "motion/react";
import { Users, AlertTriangle, TrendingDown, ShieldAlert, Cpu, ChevronRight } from "lucide-react";

interface HomeProps {
  onNavigate: (page: string) => void;
  bestModelName: string;
}

export default function Home({ onNavigate, bestModelName }: HomeProps) {
  const cards = [
    {
      id: "stat-total",
      title: "Total Monitored Base",
      value: "1,000",
      change: "+4.2% MoM",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "stat-churn",
      title: "Baseline Churn Rate",
      value: "26.5%",
      change: "-1.8% vs Q1",
      icon: TrendingDown,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "stat-revenue",
      title: "Monthly Revenue at Risk",
      value: "$17,165",
      change: "274 High Risk Accounts",
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      id: "stat-champion",
      title: "Champion Classifier",
      value: bestModelName || "XGBoost",
      change: "Auto-Selected",
      icon: Cpu,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const steps = [
    {
      id: "step-1",
      num: "01",
      title: "Data Pull & Cleaning",
      desc: "Fetches IBM Telco dataset. Casts types (e.g. TotalCharges to numeric), handles blank entries via median imputation.",
    },
    {
      id: "step-2",
      num: "02",
      title: "Feature Engineering",
      desc: "Computes TotalServices, AvgChargesPerService, TenureGroup, and ChargesTenureRatio to capture behavioral trends.",
    },
    {
      id: "step-3",
      num: "03",
      title: "Preprocess & Scale",
      desc: "Runs Standard Scaling on numerical variables and fits One-Hot encoding on categorical properties in a reproducible pipeline.",
    },
    {
      id: "step-4",
      num: "04",
      title: "Multi-Model Fit",
      desc: "Trains 5 algorithms: Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, and XGBoost.",
    },
    {
      id: "step-5",
      num: "05",
      title: "Auto-Selection & Explanations",
      desc: "Selects the champion based on maximum F1-Score and maps feature attributions per customer using SHAP calculations.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 p-8 text-white shadow-lg"
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            <Cpu className="h-3.5 w-3.5" />
            Senior ML Portfolio - Enterprise Delivery Standard
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Customer Churn Prediction & Retention Advisory Platform
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            A production-ready predictive system designed for subscriber churn optimization. 
            This console showcases an end-to-end cleaning and feature engineering pipeline, auto-selection among five industry-standard classifiers, and local SHAP-based feature explanations with AI consultation.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("eda")}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition"
            >
              Explore Customer Data (EDA)
            </button>
            <button
              onClick={() => onNavigate("predictions")}
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-750 hover:text-white transition"
            >
              Predict Single Churn Risk
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col justify-between rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                  {card.title}
                </span>
                <div className="text-2xl font-extrabold text-[#0f172a] tracking-tight">{card.value}</div>
              </div>
              <div className={`rounded-lg border p-2.5 ${card.color}`}>
                <card.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">{card.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Visual flowchart */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-bold text-[#0f172a]">
            End-to-End Enterprise ML Pipeline Architecture
          </h2>
          <p className="text-sm text-[#64748b]">
            Our pipeline is structured cleanly into reproducible processing blocks mapped directly to the production Python artifacts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 relative">
          {steps.map((step, i) => (
            <div key={step.id} className="relative group space-y-3 p-4 rounded-lg hover:bg-[#f8fafc] transition border border-transparent hover:border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-200 font-mono">
                  {step.num}
                </span>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block h-4 w-4 text-slate-400 absolute -right-2 top-6 z-10" />
                )}
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">{step.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Technical Card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0f172a]">Portfolio Delivery Standard</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            As a Senior ML Engineer, shipping predictive models requires rigorous adherence to deployment constraints and model explainability. 
            This system does not rely on opaque "black-box" outputs; instead, it matches actual mathematical training splits on the IBM Telco Customer Churn dataset with detailed SHAP valuations. 
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The candidate models are compared across five baseline configurations. 
            Once predictions are calculated, our integrated server-side Gemini LLM synthesizes customer metrics and local feature impacts into prescriptive retention advisories mimicking a high-level customer success consultation.
          </p>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0f172a]">Action Center</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("train")}
              className="flex flex-col items-center justify-center p-5 rounded-lg border border-[#e2e8f0] bg-slate-50 hover:bg-slate-100/80 text-center transition-all duration-200 group hover:shadow-sm hover:-translate-y-0.5"
            >
              <Cpu className="h-6 w-6 text-[#3b82f6] mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-slate-800">Train Pipeline</span>
              <span className="text-[10px] text-[#64748b] mt-1">Refit & Compare Models</span>
            </button>
            <button
              onClick={() => onNavigate("insights")}
              className="flex flex-col items-center justify-center p-5 rounded-lg border border-[#e2e8f0] bg-slate-50 hover:bg-slate-100/80 text-center transition-all duration-200 group hover:shadow-sm hover:-translate-y-0.5"
            >
              <AlertTriangle className="h-6 w-6 text-rose-500 mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-slate-800">Retention Strategy</span>
              <span className="text-[10px] text-[#64748b] mt-1">High Risk Revenue Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
