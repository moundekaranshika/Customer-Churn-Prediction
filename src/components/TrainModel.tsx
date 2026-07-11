import { useState } from "react";
import { motion } from "motion/react";
import { Play, Terminal, CheckCircle2, Award, ShieldAlert, Cpu } from "lucide-react";
import { TrainResponse } from "../types";

interface TrainModelProps {
  onTrainComplete: (results: TrainResponse) => void;
  trainResults: TrainResponse | null;
}

export default function TrainModel({ onTrainComplete, trainResults }: TrainModelProps) {
  const [training, setTraining] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);

  const startTraining = async () => {
    try {
      setTraining(true);
      setConsoleLogs([]);
      setActiveLogIndex(-1);

      // We hit the backend /api/pipeline/train
      const res = await fetch("/api/pipeline/train", { method: "POST" });
      if (!res.ok) throw new Error("Training request failed");
      const data: TrainResponse = await res.json();

      // Simulate a beautiful incremental terminal stream of logs!
      const logs = data.trainingLog || [];
      for (let i = 0; i < logs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setConsoleLogs((prev) => [...prev, logs[i]]);
        setActiveLogIndex(i);
      }

      onTrainComplete(data);
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `❌ CRITICAL FAILURE: ${err.message}`]);
    } finally {
      setTraining(false);
    }
  };

  const modelNames = [
    "Logistic Regression",
    "Decision Tree",
    "Random Forest",
    "Gradient Boosting",
    "XGBoost",
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-[#e2e8f0] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Train & Compare Estimators
          </h1>
          <p className="text-sm text-[#64748b]">
            Execute the complete data preparation and training pipeline. Automatically trains five candidate algorithms and registers the champion based on F1 Score optimization.
          </p>
        </div>
      </div>

      {/* Control Block and Terminal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Actions panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-slate-700" />
              Pipeline Controls
            </h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Triggers numerical scaling, one-hot category encoding, 80/20 train/test splits, 5-fold cross-validation, and parallel model fitting on execution workers.
            </p>
            <button
              onClick={startTraining}
              disabled={training}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm text-white transition-all ${
                training
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#3b82f6] hover:bg-blue-600 shadow-md shadow-blue-500/10"
              }`}
            >
              <Play className={`h-4 w-4 ${training ? "animate-spin" : ""}`} />
              {training ? "Executing ML Run..." : "Run ML Training Pipeline"}
            </button>
          </div>

          {trainResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-amber-100 bg-amber-50 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Champion Selected</h4>
                  <p className="text-lg font-bold text-slate-900">{trainResults.bestModelName}</p>
                </div>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Automatically selected by evaluating all models against historical testing splits. The champion model is promoted to real-time production inference.
              </p>
            </motion.div>
          )}
        </div>

        {/* Console logs terminal */}
        <div className="lg:col-span-3 rounded-xl bg-slate-950 border border-slate-900 p-4 font-mono text-xs text-slate-300 shadow-lg min-h-[220px] max-h-[300px] overflow-y-auto flex flex-col justify-between">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1.5 text-slate-500 border-b border-slate-900 pb-2 mb-2">
              <Terminal className="h-4 w-4" />
              <span>Pipeline Logs Consolidation</span>
            </div>
            {consoleLogs.length === 0 && !training && (
              <span className="text-slate-600 block italic py-6 text-center">Pipeline idle. Click training button to execute.</span>
            )}
            {consoleLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5 py-0.5">
                <span className="text-slate-600 font-bold select-none">&gt;</span>
                <span className={log.startsWith("🏆") ? "text-amber-400 font-bold" : log.includes("❌") ? "text-rose-500" : "text-slate-300"}>{log}</span>
              </div>
            ))}
          </div>
          {training && (
            <div className="text-[10px] text-slate-500 text-right animate-pulse pt-2">
              Executing fitting iterations...
            </div>
          )}
        </div>
      </div>

      {/* Estimators comparison grid */}
      {trainResults && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden"
        >
          <div className="border-b border-[#e2e8f0] bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-800">Architecture Evaluation Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e2e8f0]">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">Model Architecture</th>
                  <th className="px-6 py-3">Accuracy</th>
                  <th className="px-6 py-3">Precision</th>
                  <th className="px-6 py-3">Recall</th>
                  <th className="px-6 py-3">F1-Score</th>
                  <th className="px-6 py-3">ROC-AUC</th>
                  <th className="px-6 py-3">CV Mean F1</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs text-slate-700">
                {modelNames.map((name) => {
                  const m = trainResults.modelsComparison[name];
                  if (!m) return null;
                  const isBest = name === trainResults.bestModelName;

                  return (
                    <tr
                      key={name}
                      className={
                        isBest
                          ? "bg-amber-50/50 font-medium text-slate-900 border-l-2 border-amber-500"
                          : "hover:bg-slate-50"
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-semibold flex items-center gap-1.5">
                        {isBest && <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                        {name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{(m.accuracy * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4">{(m.precision * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4">{(m.recall * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold">{(m.f1Score * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4">{(m.rocAuc * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4">{(m.cvMeanF1 * 100).toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isBest
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isBest ? "Champion" : "Candidate"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
