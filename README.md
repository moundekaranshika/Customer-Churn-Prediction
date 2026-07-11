# End-to-End Customer Churn Prediction Platform (IBM Telco Churn)
**Designed & Engineered by Senior Machine Learning Engineer**

This repository contains a production-ready, portfolio-grade Machine Learning system for predicting subscriber churn and generating automated proactive retention actions. It features an end-to-end data preparation, model-training, evaluation, and explainability pipeline using high-fidelity predictive modeling paired with SHAP analysis and generative customer loyalty recovery strategies.

---

## 🚀 Key Platform Features

1. **Modular ML Pipeline**: Fully reproducible data pipeline including loading, cleaning, median imputation for numeric features, One-Hot categorical encoding, standard feature scaling, and feature engineering.
2. **Business-Driven Feature Engineering**:
   - `TotalServices`: Aggregates the quantity of active services.
   - `AvgChargesPerService`: Quantifies individual service cost density.
   - `TenureGroup`: Discretizes client lifespan into structural intervals.
   - `ChargesTenureRatio`: Detects monthly billing fluctuations relative to subscription duration.
3. **Multi-Model Training Engine**: Automatically trains, cross-validates, and compares five high-performing classification architectures:
   - Logistic Regression (Baseline)
   - Decision Trees (Rule-based split analysis)
   - Random Forests (Ensemble bagging)
   - Gradient Boosting (Ensemble sequential boosting)
   - XGBoost (Extreme Gradient Boosting with custom regularization)
4. **Auto-Model Selector**: Evaluates model precision, recall, accuracy, and F1 scores, automatically promoting the champion classifier to production based on F1 Score optimization.
5. **Shapley Additive Explanations (SHAP)**: Computes local feature importance per prediction to extract direct drivers of churn risk (e.g. month-to-month contracts, lack of tech support).
6. **Polished Dashboard Interface**: Implemented via a full-stack interactive dashboard.

---

## 📂 Project Structure

```bash
├── requirements.txt      # Python dependencies
├── train.py              # Modular model training, evaluation & serialization pipeline
├── predict.py            # Local inference, SHAP explainer, & retention advisory script
├── server.ts             # Express backend serving real-time analytics & model routing
├── src/
│   ├── App.tsx           # React Dashboard Router & Shell Navigation
│   ├── types.ts          # Strongly typed TS declarations
│   ├── lib/
│   │   └── ml/
│   │       ├── dataset.ts   # High-fidelity IBM Telco Dataset generation/simulator
│   │       ├── models.ts    # Mathematical classification models (Logistic, DT, XGBoost)
│   │       └── pipeline.ts  # Cleaning, scaling, feature scaling, & model evaluation
│   └── components/       # Pages: Home, EDA, TrainModel, Predictions, CustomerInsights, etc.
└── models/
    └── churn_prediction_artifacts.joblib # Serialized model pipeline
```

---

## 🛠️ Python Local Installation and Execution

### Prerequisite
Make sure Python 3.8+ is installed on your machine.

### Step 1: Install Dependencies
Create a virtual environment and install the required modules:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 2: Run Training Pipeline
Train all five models, compare metrics, select the champion model, and serialize it to the `models/` directory:
```bash
python train.py
```

### Step 3: Run Inference & Explanation Check
Perform model inference and local SHAP explanations for a sample customer:
```bash
python predict.py
```

---

## 📊 Deployment Guide

This predictive platform is engineered for cloud scalability. Below are the steps to deploy this system in common cloud environments:

### Option A: AWS Elastic Beanstalk / ECS (Dockerized)
1. **Containerize**: Create a `Dockerfile` at the root:
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   EXPOSE 8501
   ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
   ```
2. **Build and Push**:
   ```bash
   docker build -t churn-predictor .
   aws ecr get-login-password --region us-east-1 | docker login ...
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/churn-predictor:latest
   ```
3. **Deploy to ECS**: Launch an ECS service using AWS Fargate with your container image. Configure an Application Load Balancer to route traffic.

### Option B: Google Cloud Run
1. **Build Container Image**: Build directly using Google Cloud Build:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/churn-predictor
   ```
2. **Deploy on Cloud Run**:
   ```bash
   gcloud run deploy churn-predictor \
     --image gcr.io/YOUR_PROJECT_ID/churn-predictor \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8501
   ```

---

## 🔬 Mathematical Formulations

- **Logistic Regression Probability Estimation**:
  $$p = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X_1 + \dots + \beta_n X_n)}}$$
- **Decision Tree Node Splitting Criteria (Gini Impurity)**:
  $$I_G(t) = 1 - \sum_{i=1}^{C} p_i^2$$
- **SHAP Value Representation (Shapley Values)**:
  $$\phi_i(v) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|! (|N| - |S| - 1)!}{|N|!} \left[ v(S \cup \{i\}) - v(S) \right]$$
