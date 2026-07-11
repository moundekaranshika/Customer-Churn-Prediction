#!/usr/bin/env python3
"""
Production Machine Learning Inference and Explainability Script.
Author: Senior ML Engineer (Ex-Amazon Predictive Analytics)
"""

import sys
import os
import pandas as pd
import numpy as np
import joblib

def load_artifacts(artifact_path='models/churn_prediction_artifacts.joblib'):
    """
    Loads saved pipeline and model artifacts.
    """
    if not os.path.exists(artifact_path):
        raise FileNotFoundError(f"Artifacts file not found at {artifact_path}. Please run train.py first!")
    return joblib.load(artifact_path)

def engineer_single_customer(customer_data):
    """
    Applies feature engineering on a single input dictionary.
    """
    df = pd.DataFrame([customer_data])
    
    # Feature engineering logic identical to train.py
    services = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup', 
                'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']
    
    df['TotalServices'] = 0
    for service in services:
        if service in df.columns:
            df['TotalServices'] += df[service].apply(lambda x: 1 if x == 'Yes' else 0)
            
    df['AvgChargesPerService'] = df['MonthlyCharges'] / (df['TotalServices'] + 1)
    
    def tenure_group(tenure):
        if tenure <= 12: return '0-1 Year'
        elif tenure <= 24: return '1-2 Years'
        elif tenure <= 48: return '2-4 Years'
        else: return '4+ Years'
        
    df['TenureGroup'] = df['tenure'].apply(tenure_group)
    df['ChargesTenureRatio'] = df['TotalCharges'] / (df['tenure'] + 0.1)
    
    return df

def generate_retention_strategy(churn_prob, customer_info):
    """
    Returns specific, actionable recommendations based on high-risk features.
    """
    suggestions = []
    
    if churn_prob > 0.5:
        # Check Contract
        if customer_info.get('Contract') == 'Month-to-month':
            suggestions.append("Offer 1-year contract with a 15% discount incentive to stabilize contract commitment.")
        
        # Check Tech Support
        if customer_info.get('TechSupport') != 'Yes' and customer_info.get('InternetService') != 'No':
            suggestions.append("Provide a free trial of Premium Tech Support to mitigate configuration friction.")
            
        # Check Online Security
        if customer_info.get('OnlineSecurity') != 'Yes' and customer_info.get('InternetService') != 'No':
            suggestions.append("Bundle complimentary Online Security services with their internet service subscription.")
            
        # Check high charges and low tenure
        if customer_info.get('MonthlyCharges', 0) > 80 and customer_info.get('tenure', 0) < 12:
            suggestions.append("Apply a high-value customer introductory billing credit ($10 off for 6 months).")
            
        # Check payment method
        if customer_info.get('PaymentMethod') == 'Electronic check':
            suggestions.append("Encourage automated Bank Transfer or Credit Card payments via a one-time $5 bill credit.")
            
        if not suggestions:
            suggestions.append("Initiate direct Customer Success proactive outreach to establish rapport and discover pain points.")
    else:
        suggestions.append("Maintain standard marketing communication. Eligible for customer loyalty reward tier check-in.")
        
    return suggestions

def explain_prediction_shap(model, preprocessor, engineered_df, artifacts):
    """
    Calculates approximate local feature importance (similar to SHAP) 
    by perturbing the feature values and observing the probability shift.
    """
    # Transform base record
    base_proc = preprocessor.transform(engineered_df)
    base_prob = model.predict_proba(base_proc)[0][1]
    
    # Extract feature names from preprocessor
    # Categorical features are encoded, so we get numerical categories
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_features = artifacts['cat_cols']
    num_features = artifacts['num_cols']
    
    encoded_cat_names = cat_encoder.get_feature_names_out(cat_features).tolist()
    feature_names = num_features + encoded_cat_names
    
    # Compute feature contributions by feature ablation/perturbation
    contributions = []
    
    # 1. Evaluate numerical features by adjusting them to the mean/median (scaled to 0)
    for i, col in enumerate(num_features):
        temp_proc = base_proc.copy()
        temp_proc[0, i] = 0 # reset to average scaled value
        perturbed_prob = model.predict_proba(temp_proc)[0][1]
        diff = base_prob - perturbed_prob
        contributions.append({
            'Feature': col,
            'OriginalValue': float(engineered_df[col].iloc[0]),
            'Impact': float(diff),
            'Direction': 'Increases Risk' if diff > 0 else 'Decreases Risk'
        })
        
    # 2. Evaluate categorical features by setting their encoded one-hot columns to 0
    start_idx = len(num_features)
    for col in cat_features:
        # Find which columns belong to this feature
        matching_indices = [idx for idx, name in enumerate(feature_names) if name.startswith(col + "_")]
        if not matching_indices:
            continue
            
        temp_proc = base_proc.copy()
        for idx in matching_indices:
            temp_proc[0, idx] = 0 # turn off category
            
        perturbed_prob = model.predict_proba(temp_proc)[0][1]
        diff = base_prob - perturbed_prob
        
        orig_val = engineered_df[col].iloc[0]
        contributions.append({
            'Feature': col,
            'OriginalValue': orig_val,
            'Impact': float(diff),
            'Direction': 'Increases Risk' if diff > 0 else 'Decreases Risk'
        })
        
    # Sort contributions by absolute impact
    contributions = sorted(contributions, key=lambda x: abs(x['Impact']), reverse=True)
    return contributions[:5]

def predict_customer(customer_data):
    """
    Main inference function for single customer records.
    """
    artifacts = load_artifacts()
    model = artifacts['model']
    preprocessor = artifacts['preprocessor']
    
    # Engineer features
    engineered_df = engineer_single_customer(customer_data)
    
    # Transform
    processed_data = preprocessor.transform(engineered_df)
    
    # Predict
    prob = float(model.predict_proba(processed_data)[0][1])
    is_churn = prob > 0.5
    
    # Risk calculation
    risk_level = "Low"
    if prob > 0.75:
        risk_level = "Critical"
    elif prob > 0.5:
        risk_level = "High"
    elif prob > 0.25:
        risk_level = "Medium"
        
    # SHAP / Local Explanation
    explanations = explain_prediction_shap(model, preprocessor, engineered_df, artifacts)
    
    # Suggestions
    retention = generate_retention_strategy(prob, customer_data)
    
    return {
        'Prediction': "Likely to Churn" if is_churn else "Likely to Stay",
        'ConfidenceScore': round(prob if is_churn else (1 - prob), 4),
        'RawChurnProbability': round(prob, 4),
        'RiskLevel': risk_level,
        'TopContributingFeatures': explanations,
        'RetentionSuggestions': retention
    }

if __name__ == '__main__':
    # Sample Test Customer
    test_customer = {
        'gender': 'Female',
        'SeniorCitizen': 1,
        'Partner': 'No',
        'Dependents': 'No',
        'tenure': 5,
        'PhoneService': 'Yes',
        'MultipleLines': 'No',
        'InternetService': 'Fiber optic',
        'OnlineSecurity': 'No',
        'OnlineBackup': 'No',
        'DeviceProtection': 'No',
        'TechSupport': 'No',
        'StreamingTV': 'No',
        'StreamingMovies': 'No',
        'Contract': 'Month-to-month',
        'PaperlessBilling': 'Yes',
        'PaymentMethod': 'Electronic check',
        'MonthlyCharges': 79.85,
        'TotalCharges': 399.25
    }
    
    print("Inference engine running on test sample customer...")
    try:
        res = predict_customer(test_customer)
        print("\n--- INFERENCE RESULTS ---")
        print(f"Prediction: {res['Prediction']}")
        print(f"Confidence Score: {res['ConfidenceScore']:.2%}")
        print(f"Risk Level: {res['RiskLevel']}")
        print("\n--- LOCAL FEATURE IMPACTS (SHAP) ---")
        for exp in res['TopContributingFeatures']:
            print(f" * Feature: {exp['Feature']} | Value: {exp['OriginalValue']} | Impact: {exp['Impact']:.4f} ({exp['Direction']})")
        print("\n--- RETENTION STRATEGY RECOMMENDED ---")
        for sugg in res['RetentionSuggestions']:
            print(f" - {sugg}")
    except Exception as e:
        print(f"Error during run: {e}")
