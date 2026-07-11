import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, User, HelpCircle, ArrowRight, Play } from "lucide-react";
import { CustomerData, PredictionResponse } from "../types";

// Predefined test customer templates for instant exploration
const CUSTOMER_TEMPLATES: Record<string, { label: string; data: CustomerData }> = {
  highRisk: {
    label: "High Risk Churn Customer (Month-to-Month, Fiber, No Support)",
    data: {
      gender: "Female",
      SeniorCitizen: 1,
      Partner: "No",
      Dependents: "No",
      tenure: 3,
      PhoneService: "Yes",
      MultipleLines: "No",
      InternetService: "Fiber optic",
      OnlineSecurity: "No",
      OnlineBackup: "No",
      DeviceProtection: "No",
      TechSupport: "No",
      StreamingTV: "No",
      StreamingMovies: "No",
      Contract: "Month-to-month",
      PaperlessBilling: "Yes",
      PaymentMethod: "Electronic check",
      MonthlyCharges: 79.85,
      TotalCharges: 239.55,
    },
  },
  stable: {
    label: "Stable Long-Term Customer (Two-Year, DSL, Online Security)",
    data: {
      gender: "Male",
      SeniorCitizen: 0,
      Partner: "Yes",
      Dependents: "Yes",
      tenure: 62,
      PhoneService: "Yes",
      MultipleLines: "Yes",
      InternetService: "DSL",
      OnlineSecurity: "Yes",
      OnlineBackup: "Yes",
      DeviceProtection: "Yes",
      TechSupport: "Yes",
      StreamingTV: "Yes",
      StreamingMovies: "Yes",
      Contract: "Two year",
      PaperlessBilling: "No",
      PaymentMethod: "Credit card (automatic)",
      MonthlyCharges: 84.4,
      TotalCharges: 5232.8,
    },
  },
  average: {
    label: "Average Tech-Heavy Customer (One-Year, Fiber, Med Tenure)",
    data: {
      gender: "Male",
      SeniorCitizen: 0,
      Partner: "No",
      Dependents: "No",
      tenure: 24,
      PhoneService: "Yes",
      MultipleLines: "No",
      InternetService: "Fiber optic",
      OnlineSecurity: "No",
      OnlineBackup: "Yes",
      DeviceProtection: "No",
      TechSupport: "Yes",
      StreamingTV: "Yes",
      StreamingMovies: "Yes",
      Contract: "One year",
      PaperlessBilling: "Yes",
      PaymentMethod: "Bank transfer (automatic)",
      MonthlyCharges: 95.5,
      TotalCharges: 2292.0,
    },
  },
};

interface PredictionsProps {
  onPredictComplete: (data: PredictionResponse, customer: CustomerData) => void;
  predictionResult: PredictionResponse | null;
  predictionCustomer: CustomerData | null;
  onNavigate: (page: string) => void;
}

export default function Predictions({
  onPredictComplete,
  predictionResult,
  predictionCustomer,
  onNavigate,
}: PredictionsProps) {
  const [form, setForm] = useState<CustomerData>({ ...CUSTOMER_TEMPLATES.highRisk.data });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CustomerData, value: string | number) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Keep TotalCharges roughly accurate (MonthlyCharges * tenure) if modified manually
      if (field === "MonthlyCharges" || field === "tenure") {
        updated.TotalCharges = parseFloat(
          (updated.MonthlyCharges * updated.tenure).toFixed(2)
        );
      }
      return updated;
    });
  };

  const loadTemplate = (key: string) => {
    if (CUSTOMER_TEMPLATES[key]) {
      setForm({ ...CUSTOMER_TEMPLATES[key].data });
    }
  };

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pipeline/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Inference request failed");
      const json: PredictionResponse = await res.json();
      onPredictComplete(json, form);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-[#e2e8f0] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Run Inference (Predictions)
          </h1>
          <p className="text-sm text-[#64748b]">
            Provide customer details to run real-time classification inference on our champion machine learning model.
          </p>
        </div>
      </div>

      {/* Templates Selector */}
      <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 shadow-sm space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">Load Portfolio Scenarios</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CUSTOMER_TEMPLATES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => loadTemplate(key)}
              className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 items-start">
        {/* Form input details */}
        <form onSubmit={handlePredict} className="lg:col-span-3 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-50 pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-700" />
            Customer Demographics & Usage Inputs
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Tenure */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Tenure (Months)</label>
              <input
                type="number"
                min="1"
                max="72"
                value={form.tenure}
                onChange={(e) => handleInputChange("tenure", parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none transition-colors"
              />
            </div>

            {/* Monthly Charges */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Monthly Charges ($)</label>
              <input
                type="number"
                step="0.01"
                min="15"
                max="125"
                value={form.MonthlyCharges}
                onChange={(e) => handleInputChange("MonthlyCharges", parseFloat(e.target.value) || 15)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none transition-colors"
              />
            </div>

            {/* Total Charges (Auto-updating) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider opacity-60">Total Charges ($)</label>
              <input
                type="number"
                disabled
                value={form.TotalCharges}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 focus:outline-none"
              />
            </div>

            {/* Contract */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Contract Type</label>
              <select
                value={form.Contract}
                onChange={(e) => handleInputChange("Contract", e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            {/* Internet Service */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Internet Service</label>
              <select
                value={form.InternetService}
                onChange={(e) => handleInputChange("InternetService", e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">No (None)</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Payment Method</label>
              <select
                value={form.PaymentMethod}
                onChange={(e) => handleInputChange("PaymentMethod", e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>

            {/* Tech Support */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Tech Support</label>
              <select
                value={form.TechSupport}
                onChange={(e) => handleInputChange("TechSupport", e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            {/* Online Security */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Online Security</label>
              <select
                value={form.OnlineSecurity}
                onChange={(e) => handleInputChange("OnlineSecurity", e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            {/* Senior Citizen */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Senior Citizen</label>
              <select
                value={form.SeniorCitizen}
                onChange={(e) => handleInputChange("SeniorCitizen", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none bg-white transition-colors"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm text-white transition-all duration-200 cursor-pointer ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#3b82f6] hover:bg-blue-600 shadow-md shadow-blue-500/10"
              }`}
            >
              <Play className="h-4 w-4" />
              {loading ? "Calculating Probabilities..." : "Run Prediction Inference"}
            </button>
          </div>
        </form>

        {/* Prediction Outputs cards */}
        <div className="lg:col-span-2 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              ❌ Critical Inference Failure: {error}
            </div>
          )}

          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              {/* Core Output card */}
              <div
                className={`rounded-xl border p-5 shadow-sm space-y-4 ${
                  predictionResult.prediction === "Likely to Churn"
                    ? "bg-rose-50/50 border-rose-100 text-rose-950"
                    : "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  {predictionResult.prediction === "Likely to Churn" ? (
                    <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inference Assessment</span>
                    <h3 className="text-xl font-extrabold">{predictionResult.prediction}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence Score</span>
                    <div className="text-lg font-black mt-0.5">{(predictionResult.confidenceScore * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Tier</span>
                    <div className="text-lg font-black mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          predictionResult.riskLevel === "Critical"
                            ? "bg-rose-600 animate-ping"
                            : predictionResult.riskLevel === "High"
                            ? "bg-rose-500"
                            : predictionResult.riskLevel === "Medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      {predictionResult.riskLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retention suggestions */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Retention Action Plan Suggestions</h4>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  {predictionResult.retentionSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 border-b border-slate-50 pb-2 last:border-none last:pb-0">
                      <span className="text-slate-400 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SHAP direct navigation call */}
              <button
                onClick={() => onNavigate("explain")}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-900 bg-slate-950 text-white shadow-md hover:bg-slate-900 transition group cursor-pointer"
              >
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Explain Predictions</span>
                  <div className="text-xs font-bold">Deep-Dive SHAP Explanation</div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1.5 transition" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
