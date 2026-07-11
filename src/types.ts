export interface CustomerData {
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  cvMeanF1: number;
}

export interface ConfusionMatrix {
  trueNegative: number; // Stayed, Predicted Stayed
  falsePositive: number; // Stayed, Predicted Churn
  falseNegative: number; // Churned, Predicted Stayed
  truePositive: number; // Churned, Predicted Churn
}

export interface ShapContribution {
  feature: string;
  originalValue: string | number;
  impact: number; // positive increases churn, negative decreases churn
  direction: "Increases Risk" | "Decreases Risk";
}

export interface PredictionResponse {
  prediction: "Likely to Churn" | "Likely to Stay";
  confidenceScore: number;
  rawChurnProbability: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  topContributingFeatures: ShapContribution[];
  retentionSuggestions: string[];
}

export interface TrainResponse {
  status: string;
  bestModelName: string;
  modelsComparison: Record<string, Omit<ModelMetrics, "name">>;
  confusionMatrix: ConfusionMatrix;
  featureImportances: Array<{ feature: string; importance: number }>;
  cvScores: Record<string, number[]>;
  trainingLog: string[];
}

export interface EDAData {
  totalCustomers: number;
  churnRate: number;
  churnCount: number;
  stayCount: number;
  churnByContract: Array<{ contract: string; stay: number; churn: number; rate: number }>;
  tenureDistribution: Array<{ range: string; count: number; churned: number }>;
  chargesByChurn: Array<{ range: string; stay: number; churn: number }>;
  servicesUsage: Array<{ service: string; activeCount: number; activeChurnRate: number }>;
  paymentMethods: Array<{ method: string; count: number; churnRate: number }>;
}

export interface SegmentSummary {
  segmentName: string;
  size: number;
  churnRate: number;
  avgMonthlyCharges: number;
  avgTenure: number;
  revenueAtRisk: number;
}
