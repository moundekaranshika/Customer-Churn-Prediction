import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RefreshCw, BarChart2, CheckCircle2, TrendingUp } from "lucide-react";
import { EDAData } from "../types";

export default function EDA() {
  const [data, setData] = useState<EDAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEDA = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/data/eda");
      if (!res.ok) throw new Error("Could not fetch descriptive stats");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEDA();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-slate-600 animate-spin" />
        <span className="text-sm font-medium text-slate-600">Calculating descriptive statistics from IBM Telco Churn dataset...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-rose-800">EDA Load Error</h3>
        <p className="text-sm text-rose-600">{error || "Data is missing."}</p>
        <button onClick={fetchEDA} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition">
          Retry Computation
        </button>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  // Format Pie Chart Data for Churn vs Stay
  const ratioData = [
    { name: "Retained Customers", value: data.stayCount },
    { name: "Churned Customers", value: data.churnCount },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Exploratory Data Analysis (EDA)
          </h1>
          <p className="text-sm text-[#64748b]">
            Interactive descriptive metrics tracking multi-dimensional churn correlations across 1,000 active customer rows.
          </p>
        </div>
        <button
          onClick={fetchEDA}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition bg-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-Analyze Dataset
        </button>
      </div>

      {/* EDA Top line Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Base Size</span>
          <div className="text-3xl font-extrabold text-[#0f172a]">{data.totalCustomers} Accounts</div>
          <p className="text-xs text-slate-500">Continuous clean IBM records</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Churn Volume</span>
          <div className="text-3xl font-extrabold text-rose-600">{data.churnCount} Accounts</div>
          <p className="text-xs text-rose-500">Proactively tagged exiting contracts</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Churn Rate</span>
          <div className="text-3xl font-extrabold text-emerald-600">{data.churnRate}%</div>
          <p className="text-xs text-emerald-500">Average retention score of total base</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Contract Type correlation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Churn Rate By Contract Commitment</h3>
            <p className="text-xs text-[#64748b]">Month-to-month holds maximum vulnerability compared to multi-year locks.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.churnByContract} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="contract" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Churn Rate"]} />
                <Bar dataKey="rate" name="Churn Probability" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Tenure Distribution Stacked Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Tenure Distribution & Exit Lifespans</h3>
            <p className="text-xs text-[#64748b]">Churn decreases exponentially as tenancy approaches mature cohorts.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.tenureDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="count" name="Active Pool" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="churned" name="Churn Volume" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 3: Monthly Charges Stacked Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Billing Charge Range Density</h3>
            <p className="text-xs text-[#64748b]">Aggregating subscribers by billing volume indicates high prices compound churn rate.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chargesByChurn} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="stay" name="Retained" fill="#3b82f6" stackId="a" />
                <Bar dataKey="churn" name="Churned" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 4: Service Churn Rate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Service Adoption vs Churn Probability</h3>
            <p className="text-xs text-[#64748b]">Churn rate of subscribers who actively adopt specific add-on services.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.servicesUsage} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="service" type="category" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Churn Rate when Subscribed"]} />
                <Bar dataKey="activeChurnRate" name="Churn Risk" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 5: Payment Method Pie & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-6"
        >
          <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Billing Method Churn Sensitivity</h3>
              <p className="text-xs text-[#64748b] mt-1">Automatic payments (Credit Card, Bank Transfer) display outstanding loyalty, while Electronic Check is a severe focal vulnerability.</p>
            </div>
            <div className="space-y-2">
              {data.paymentMethods.map((pm, i) => (
                <div key={pm.method} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-700 font-medium">{pm.method}</span>
                  </div>
                  <span className="font-bold text-rose-600">{pm.churnRate}% Churn</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(val) => [`${val} customers`]} />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
