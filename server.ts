import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MLPipeline, Preprocessor } from "./src/lib/ml/pipeline";
import { calculateSHAP } from "./src/lib/ml/models";
import { computeEDAData } from "./src/lib/ml/dataset";
import { CustomerData, PredictionResponse } from "./src/types";

import dotenv from "dotenv";
dotenv.config();

// Initialize the shared ML Pipeline singleton
const pipeline = new MLPipeline();
// Lazy run pipeline to have a baseline champion loaded on boot
pipeline.run();

// Initialize Gemini SDK with safety checks and custom user agent as requested
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("GEMINI_API_KEY not configured. Running AI features in rules-based heuristic fallback mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES FIRST ---

  // 1. Exploratory Data Analysis Endpoint
  app.get("/api/data/eda", (req, res) => {
    try {
      const edaData = computeEDAData(pipeline.getDataset());
      res.json(edaData);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to compute EDA metrics", details: err.message });
    }
  });

  // 2. Training Pipeline Execution Endpoint
  app.post("/api/pipeline/train", (req, res) => {
    try {
      const trainResults = pipeline.run();
      res.json(trainResults);
    } catch (err: any) {
      res.status(500).json({ error: "Pipeline execution failed", details: err.message });
    }
  });

  // 3. Customer Churn Real-time Inference & SHAP Endpoint
  app.post("/api/pipeline/predict", (req, res) => {
    try {
      const customerData: CustomerData = req.body;
      const model = pipeline.getChampion();
      const preprocessor = pipeline.getPreprocessor();
      const dataset = pipeline.getDataset();

      // Engineer input customer
      const engineeredInput = pipeline.engineerFeatures([customerData])[0];
      const processedRecord = preprocessor.transform([engineeredInput])[0];

      // Predict Churn raw probability
      const prob = model.predictProba([processedRecord])[0];
      const isChurn = prob >= 0.5;

      // Classify risk tiers
      let riskLevel: "Low" | "Medium" | "High" | "Critical" = "Low";
      if (prob > 0.75) riskLevel = "Critical";
      else if (prob > 0.5) riskLevel = "High";
      else if (prob > 0.25) riskLevel = "Medium";

      // Compute Local SHAP Feature Attributions
      // We pass a subset of processed training data as the background baseline
      const engineeredTrain = pipeline.engineerFeatures(dataset.slice(0, 100));
      const backgroundProcessed = preprocessor.transform(engineeredTrain);
      const featureNames = preprocessor.getFeatureOrder();

      const shapValues = calculateSHAP(model, processedRecord, featureNames, backgroundProcessed);

      // Clean local features for dashboard
      const formattedShap = shapValues.map((s) => ({
        feature: s.feature,
        originalValue: s.originalValue,
        impact: parseFloat(s.impact.toFixed(4)),
        direction: (s.impact > 0 ? "Increases Risk" : "Decreases Risk") as "Increases Risk" | "Decreases Risk",
      }));

      // Dynamic Retention Suggestions
      const suggestions: string[] = [];
      if (isChurn) {
        if (customerData.Contract === "Month-to-month") {
          suggestions.push("Offer a 1-year contract bundle with a 15% discount incentive to stabilize retention.");
        }
        if (customerData.TechSupport !== "Yes" && customerData.InternetService !== "No") {
          suggestions.push("Provide 3 months of complimentary Technical Support to guide onboarding & service setups.");
        }
        if (customerData.OnlineSecurity !== "Yes" && customerData.InternetService !== "No") {
          suggestions.push("Bundle complimentary Online Security tools into their active service package.");
        }
        if (customerData.PaymentMethod === "Electronic check") {
          suggestions.push("Incentivize automatic billing via ACH/Bank transfer with a one-time $10 account credit.");
        }
        if (customerData.MonthlyCharges > 85) {
          suggestions.push("Proactively match competitor pricing by offering an immediate $12 high-tier loyalty discount.");
        }
        if (suggestions.length === 0) {
          suggestions.push("Initiate proactive direct Customer Success manager outreach to discover pain points.");
        }
      } else {
        suggestions.push("Customer is stable. Target for loyalty renewal check-in or high-margin service cross-sell.");
      }

      const responsePayload: PredictionResponse = {
        prediction: isChurn ? "Likely to Churn" : "Likely to Stay",
        confidenceScore: parseFloat((isChurn ? prob : 1 - prob).toFixed(4)),
        rawChurnProbability: parseFloat(prob.toFixed(4)),
        riskLevel,
        topContributingFeatures: formattedShap.slice(0, 6),
        retentionSuggestions: suggestions,
      };

      res.json(responsePayload);
    } catch (err: any) {
      res.status(500).json({ error: "Inference calculation failed", details: err.message });
    }
  });

  // 4. Gemini AI-Powered Deep-dive Explanation and Customer Consultation Endpoint
  app.post("/api/pipeline/explain-ai", async (req, res) => {
    try {
      const { customerData, predictionResult } = req.body;
      if (!customerData || !predictionResult) {
        return res.status(400).json({ error: "Missing customer details or prediction stats in request." });
      }

      const shapSummary = predictionResult.topContributingFeatures
        .map((s: any) => `* Feature: ${s.feature} (Value: ${s.originalValue}) -> Shifted Risk by ${Math.abs(s.impact * 100).toFixed(1)}% (${s.direction})`)
        .join("\n");

      const prompt = `
        You are a Principal Machine Learning and Retention Specialist at Amazon with elite expertise in predictive analytics.
        Provide a professional, executive-ready explanation of why a telecom customer is predicted to churn or stay, and draft a high-impact retention strategy.

        CUSTOMER DETAILS:
        - Contract: ${customerData.Contract}
        - Tenure: ${customerData.tenure} months
        - Internet Service: ${customerData.InternetService}
        - Monthly Charges: $${customerData.MonthlyCharges}
        - Total Charges: $${customerData.TotalCharges}
        - Tech Support Subscribed: ${customerData.TechSupport}
        - Payment Method: ${customerData.PaymentMethod}

        PREDICTION METRICS:
        - Model Assessment: ${predictionResult.prediction}
        - Risk Probability of Churning: ${(predictionResult.rawChurnProbability * 100).toFixed(1)}%
        - Overall Risk Category: ${predictionResult.riskLevel}

        LOCAL FEATURE IMPACTS (SHAP):
        ${shapSummary}

        Please generate a beautifully formatted JSON object response exactly adhering to this schema:
        {
          "summary": "1-2 sentence executive summary of the prediction.",
          "narrativeReason": "A cohesive, professional 2-3 paragraph explanation of WHY the customer is behaving this way based on their specific features and SHAP metrics.",
          "topDrivers": [
            {
              "driver": "Name of feature",
              "impact": "Description of why it is positive or negative for this client"
            }
          ],
          "amazonGradeActionPlan": [
            "Specific, highly actionable retention discount or service bundle action with projected business impact"
          ]
        }
      `;

      if (ai) {
        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const jsonText = geminiResponse.text?.trim() || "{}";
        const explanation = JSON.parse(jsonText);
        res.json(explanation);
      } else {
        // High-quality rules-based dynamic fallback when Gemini API key is missing
        const isChurn = predictionResult.prediction === "Likely to Churn";
        const fallback = {
          summary: `Our champion predictive model identifies this customer as ${
            isChurn ? "an active high-churn risk" : "a highly stable subscriber"
          } with a churn probability of ${(predictionResult.rawChurnProbability * 100).toFixed(1)}%.`,
          narrativeReason: isChurn
            ? `This customer's short tenure (${customerData.tenure} months) and lack of supporting security or technical assistance features creates immediate usage friction. Month-to-month contracts exacerbate this risk, offering zero friction to exit.`
            : `With stable account variables and established tenancy (${customerData.tenure} months), this subscriber exhibits robust loyalty. However, keeping them on automatic billing continues to be a high priority.`,
          topDrivers: predictionResult.topContributingFeatures.slice(0, 3).map((s: any) => ({
            driver: s.feature,
            impact: `${s.direction === "Increases Risk" ? "Drives churn probability up" : "Reduces churn probability"} based on value of ${s.originalValue}.`,
          })),
          amazonGradeActionPlan: isChurn
            ? [
                `Migrate from Month-to-Month to a 12-Month contract by applying an immediate $10 promotional bill credit.`,
                `Deploy a proactive Customer Support call to assist with Tech Support services and configuration of security utilities.`,
                `Offer a direct $5 discount for upgrading payment methods to automatic paperless Bank Transfer.`
              ]
            : [
                `Customer is stable. Maintain standard automated marketing communications.`,
                `Target for high-tier cross-selling programs (Streaming bundles/device protection trials).`
              ],
        };
        res.json(fallback);
      }
    } catch (err: any) {
      res.status(500).json({ error: "Failed to generate AI explanation", details: err.message });
    }
  });

  // --- VITE DEV AND PRODUCTION MIDDLEWARES ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Customer Churn Predictor Server running on http://localhost:${PORT}`);
  });
}

startServer();
