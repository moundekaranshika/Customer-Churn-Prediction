import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home as HomeIcon,
  BarChart3,
  Cpu,
  Eye,
  ShieldAlert,
  LineChart,
  Brain,
  Menu,
  X,
  User,
  Activity,
} from "lucide-react";

// Components
import Home from "./components/Home";
import EDA from "./components/EDA";
import TrainModel from "./components/TrainModel";
import Predictions from "./components/Predictions";
import CustomerInsights from "./components/CustomerInsights";
import ModelPerformance from "./components/ModelPerformance";
import ExplainPrediction from "./components/ExplainPrediction";

// Types
import { CustomerData, PredictionResponse, TrainResponse } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Global Pipeline & ML States
  const [trainResults, setTrainResults] = useState<TrainResponse | null>(null);
  const [bestModelName, setBestModelName] = useState<string>("XGBoost");
  
  const [predictionCustomer, setPredictionCustomer] = useState<CustomerData | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  const handleTrainComplete = (results: TrainResponse) => {
    setTrainResults(results);
    setBestModelName(results.bestModelName);
  };

  const handlePredictComplete = (result: PredictionResponse, customer: CustomerData) => {
    setPredictionResult(result);
    setPredictionCustomer(customer);
  };

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "eda", label: "EDA", icon: BarChart3 },
    { id: "train", label: "Train Model", icon: Cpu },
    { id: "predictions", label: "Predictions", icon: Eye },
    { id: "insights", label: "Customer Insights", icon: ShieldAlert },
    { id: "performance", label: "Model Performance", icon: LineChart },
    { id: "explain", label: "Explain Prediction", icon: Brain },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} bestModelName={bestModelName} />;
      case "eda":
        return <EDA />;
      case "train":
        return <TrainModel onTrainComplete={handleTrainComplete} trainResults={trainResults} />;
      case "predictions":
        return (
          <Predictions
            onPredictComplete={handlePredictComplete}
            predictionResult={predictionResult}
            predictionCustomer={predictionCustomer}
            onNavigate={setCurrentPage}
          />
        );
      case "insights":
        return <CustomerInsights />;
      case "performance":
        return <ModelPerformance trainResults={trainResults} />;
      case "explain":
        return (
          <ExplainPrediction
            predictionResult={predictionResult}
            predictionCustomer={predictionCustomer}
          />
        );
      default:
        return <Home onNavigate={setCurrentPage} bestModelName={bestModelName} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar navigation */}
      <div
        className={`bg-[#0f172a] text-[#f8fafc] h-full flex flex-col justify-between border-r border-slate-800 transition-all duration-300 z-30 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo / Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 mb-10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Activity className="h-5 w-5 text-blue-500 flex-shrink-0 animate-pulse" />
              {sidebarOpen && (
                <span className="font-extrabold text-lg tracking-tight text-blue-500 whitespace-nowrap">
                  ChurnNexus AI
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/50 transition"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#3b82f6] text-white font-bold shadow-md shadow-blue-500/10"
                      : "text-slate-300 opacity-70 hover:opacity-100 hover:bg-slate-800/40"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Technical Footer */}
        {sidebarOpen && (
          <div className="p-6 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1 overflow-hidden opacity-60">
            <div className="font-medium text-slate-400">System Version 2.4.0-prod</div>
            <div>IBM Telco Dataset Config</div>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header bar */}
        <header className="h-16 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-8 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-500 hover:text-slate-800 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="text-sm font-medium text-slate-500">
              Portfolio / <span className="font-semibold text-slate-900">{navItems.find((n) => n.id === currentPage)?.label || "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900">Senior ML Engineer</div>
              <div className="text-[10px] text-[#64748b]">Amazon Web Services</div>
            </div>
            <div className="w-9 h-9 bg-[#e2e8f0] rounded-full flex items-center justify-center border border-slate-300/40">
              <User className="h-4.5 w-4.5 text-slate-600" />
            </div>
          </div>
        </header>

        {/* Primary Page Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f1f5f9]">
          <div className="max-w-6xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
