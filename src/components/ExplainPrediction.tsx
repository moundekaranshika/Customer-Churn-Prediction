import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Sparkles, Brain, Cpu, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";
import { CustomerData, PredictionResponse } from "../types";

interface ExplainPredictionProps {
  predictionResult: PredictionResponse | null;
  predictionCustomer: CustomerData | null;
}

interface AIExplanation {
  summary: string;
  narrativeReason: string;
  topDrivers: Array<{ driver: string; impact: string }>;
  amazonGradeActionPlan: string[];
}

export default function ExplainPrediction({
  predictionResult,
  predictionCustomer,
}: ExplainPredictionProps) {
  const [aiData, setAiData] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIExplanation = async () => {
    if (!predictionCustomer || !predictionResult) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pipeline/explain-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerData: predictionCustomer,
          predictionResult,
        }),
      });
      if (!res.ok) throw new Error("Could not retrieve AI explanation");
      const json = await res.json();
      setAiData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (predictionCustomer && predictionResult) {
      fetchAIExplanation();
    }
  }, [predictionCustomer, predictionResult]);

  if (!predictionCustomer || !predictionResult) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-3">
        <Cpu className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Prediction Loaded</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please run a single customer prediction first to view SHAP metrics and load the Gemini consulting module.
        </p>
      </div>
    );
  }

  // Formatting SHAP values for the bar chart
  const shapChartData = [...predictionResult.topContributingFeatures]
    .map((s) => ({
      name: s.feature,
      impact: s.impact * 100, // represent as percentage probability shift
      originalValue: s.originalValue,
      direction: s.direction,
    }))
    .sort((a, b) => a.impact - b.impact); // sort to have positive impacts at the top/bottom clearly

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-[#e2e8f0] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Explain Predictions (SHAP & Gemini AI)
          </h1>
          <p className="text-sm text-[#64748b]">
            Deconstruct mathematical model outputs into local Shapley additive explanations (SHAP) and professional consulting plans.
          </p>
        </div>
      </div>

      {/* Grid split: SHAP waterfall and Gemini consulting */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 items-start">
        {/* SHAP impact chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-slate-700" />
              Local Feature Attribution (SHAP Plot)
            </h3>
            <p className="text-xs text-[#64748b]">
              Shows how each custom variable shifted this specific customer's churn risk relative to the base average.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapChartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  formatter={(value: any, name, props: any) => [
                    `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
                    `Shifted Risk (${props.payload.direction})`,
                  ]}
                  labelFormatter={(label) => `Feature: ${label}`}
                />
                <Bar dataKey="impact">
                  {shapChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.impact > 0 ? "#ef4444" : "#3b82f6"} // red for risk increasers, blue for reducers
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              Increases Churn Risk
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              Decreases Churn Risk
            </span>
          </div>
        </div>

        {/* Gemini AI Consultation */}
        <div className="lg:col-span-3 rounded-xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="border-b border-[#e2e8f0] bg-slate-50 px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#3b82f6] animate-pulse" />
              Gemini AI Strategic Retention Advisory
            </h3>
            {aiData && (
              <button
                onClick={fetchAIExplanation}
                disabled={loading}
                className="text-[10px] font-bold text-slate-600 border border-[#e2e8f0] px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition bg-white cursor-pointer"
              >
                Refresh Analysis
              </button>
            )}
          </div>

          <div className="p-5 min-h-[300px] flex flex-col justify-center">
            {loading && (
              <div className="text-center py-12 space-y-4">
                <RefreshCw className="h-8 w-8 text-slate-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-800 block">Synthesizing prediction weights...</span>
                  <span className="text-xs text-slate-500 block">Querying Gemini-3.5-Flash to draft tailored retention bundles.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-rose-600 space-y-2">
                <p className="text-xs font-bold">Could not load AI module.</p>
                <p className="text-[10px]">{error}</p>
                <button
                  onClick={fetchAIExplanation}
                  className="px-3 py-1 border border-rose-200 bg-rose-50 rounded-lg text-[10px] font-bold"
                >
                  Retry API Consultation
                </button>
              </div>
            )}

            {!loading && !error && aiData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Executive summary block */}
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-1.5">
                  <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                    <Brain className="h-4 w-4 text-slate-600" />
                    Executive Assessment
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{aiData.summary}"
                  </p>
                </div>

                {/* Narrative reasons */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Narrative Consultation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {aiData.narrativeReason}
                  </p>
                </div>

                {/* Top drivers list */}
                {aiData.topDrivers && aiData.topDrivers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary Behavioral Drivers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {aiData.topDrivers.map((driver, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 p-2.5 text-[11px] hover:border-slate-200 transition">
                          <span className="block font-bold text-slate-800 mb-0.5">{driver.driver}</span>
                          <span className="block text-slate-500 leading-relaxed">{driver.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amazon grade action plan */}
                {aiData.amazonGradeActionPlan && aiData.amazonGradeActionPlan.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Enterprise Action Recovery Plan</h4>
                    <div className="space-y-2">
                      {aiData.amazonGradeActionPlan.map((action, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/50 border border-slate-100 p-3 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
