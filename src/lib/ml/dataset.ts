import { CustomerData, EDAData } from "../../types";

// Seedable random number generator for reproducible dataset generation
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  between(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  choice<T>(arr: T[], weights?: number[]): T {
    if (!weights) {
      return arr[Math.floor(this.next() * arr.length)];
    }
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * sum;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  }
}

export function generateIBMDataset(size = 1000): CustomerData[] {
  const rng = new SeededRandom(12345); // Set fixed seed for consistent training
  const dataset: CustomerData[] = [];

  const genders = ["Male", "Female"];
  const yesNo = ["Yes", "No"];
  const internetServices = ["Fiber optic", "DSL", "No"];
  const contracts = ["Month-to-month", "One year", "Two year"];
  const paymentMethods = [
    "Electronic check",
    "Mailed check",
    "Bank transfer (automatic)",
    "Credit card (automatic)",
  ];

  for (let i = 0; i < size; i++) {
    const gender = rng.choice(genders);
    const SeniorCitizen = rng.choice([0, 1], [0.85, 0.15]);
    const Partner = rng.choice(yesNo, [0.48, 0.52]);
    const Dependents = rng.choice(yesNo, [0.3, 0.7]);
    
    // Tenure is highly bimodal in Telco dataset (lots of short-term and lots of long-term customers)
    const tenure = Math.floor(rng.choice([
      rng.between(1, 12),
      rng.between(13, 60),
      rng.between(61, 72)
    ], [0.4, 0.3, 0.3]));

    const PhoneService = rng.choice(yesNo, [0.9, 0.1]);
    const MultipleLines = PhoneService === "No" 
      ? "No phone service" 
      : rng.choice(["No", "Yes"], [0.6, 0.4]);

    const InternetService = rng.choice(internetServices, [0.45, 0.35, 0.2]);

    let OnlineSecurity = "No internet service";
    let OnlineBackup = "No internet service";
    let DeviceProtection = "No internet service";
    let TechSupport = "No internet service";
    let StreamingTV = "No internet service";
    let StreamingMovies = "No internet service";
    let MonthlyCharges = rng.between(18.5, 25.0);

    if (InternetService !== "No") {
      const isFiber = InternetService === "Fiber optic";
      OnlineSecurity = rng.choice(yesNo, isFiber ? [0.75, 0.25] : [0.6, 0.4]);
      OnlineBackup = rng.choice(yesNo, [0.55, 0.45]);
      DeviceProtection = rng.choice(yesNo, [0.55, 0.45]);
      TechSupport = rng.choice(yesNo, isFiber ? [0.75, 0.25] : [0.55, 0.45]);
      StreamingTV = rng.choice(yesNo, [0.5, 0.5]);
      StreamingMovies = rng.choice(yesNo, [0.5, 0.5]);
      
      // Calculate realistic MonthlyCharges based on active services
      let base = isFiber ? 70 : 45;
      if (OnlineSecurity === "Yes") base += 10;
      if (OnlineBackup === "Yes") base += 8;
      if (DeviceProtection === "Yes") base += 8;
      if (TechSupport === "Yes") base += 10;
      if (StreamingTV === "Yes") base += 12;
      if (StreamingMovies === "Yes") base += 12;
      MonthlyCharges = rng.between(base - 5, base + 5);
    }

    const Contract = rng.choice(contracts, [0.55, 0.22, 0.23]);
    const PaperlessBilling = rng.choice(yesNo, [0.6, 0.4]);
    const PaymentMethod = rng.choice(paymentMethods, [0.35, 0.22, 0.21, 0.22]);

    // Total charges correlates strongly with monthly charges * tenure
    const TotalCharges = parseFloat((MonthlyCharges * tenure * rng.between(0.98, 1.02)).toFixed(2));

    dataset.push({
      gender,
      SeniorCitizen,
      Partner,
      Dependents,
      tenure: tenure === 0 ? 1 : tenure,
      PhoneService,
      MultipleLines,
      InternetService,
      OnlineSecurity,
      OnlineBackup,
      DeviceProtection,
      TechSupport,
      StreamingTV,
      StreamingMovies,
      Contract,
      PaperlessBilling,
      PaymentMethod,
      MonthlyCharges: parseFloat(MonthlyCharges.toFixed(2)),
      TotalCharges: isNaN(TotalCharges) ? 0 : TotalCharges,
    });
  }

  return dataset;
}

// Churn logic based on actual ML correlation (for simulating labels or training target)
export function determineChurnLabel(cust: CustomerData, seedOffset = 0): "Yes" | "No" {
  // Let's implement a logistic function with realistic beta weights!
  let logOdds = -1.2; // Base log-odds (corresponds to ~23% churn baseline)

  // Contract: Month-to-month represents huge churn risk
  if (cust.Contract === "Month-to-month") logOdds += 1.8;
  if (cust.Contract === "Two year") logOdds -= 1.5;
  if (cust.Contract === "One year") logOdds -= 0.6;

  // Tenure: More tenure lowers churn risk significantly
  logOdds -= (cust.tenure / 12) * 0.45;

  // InternetService: Fiber optic has higher churn (due to higher prices, technical issues)
  if (cust.InternetService === "Fiber optic") logOdds += 0.8;
  if (cust.InternetService === "No") logOdds -= 0.9;

  // TechSupport & OnlineSecurity: Lack of support increases churn
  if (cust.TechSupport === "No") logOdds += 0.55;
  if (cust.OnlineSecurity === "No") logOdds += 0.45;

  // PaymentMethod: Electronic Check has higher churn
  if (cust.PaymentMethod === "Electronic check") logOdds += 0.6;

  // SeniorCitizen: higher risk
  if (cust.SeniorCitizen === 1) logOdds += 0.3;

  // Monthly charges
  if (cust.MonthlyCharges > 85) logOdds += 0.4;
  if (cust.MonthlyCharges < 35) logOdds -= 0.3;

  // Convert log-odds to probability
  const prob = 1 / (1 + Math.exp(-logOdds));

  // Determine label using deterministic threshold or weighted seeded logic
  // To have fully reproducible labels, we'll use a hashing of customer properties
  const keyStr = `${cust.gender}-${cust.tenure}-${cust.MonthlyCharges}-${cust.Contract}-${cust.PaymentMethod}-${seedOffset}`;
  let hash = 0;
  for (let idx = 0; idx < keyStr.length; idx++) {
    hash = (hash << 5) - hash + keyStr.charCodeAt(idx);
    hash |= 0;
  }
  const normalizedHash = Math.abs(hash % 1000) / 1000;

  return normalizedHash < prob ? "Yes" : "No";
}

export function computeEDAData(customers: CustomerData[]): EDAData {
  const totalCustomers = customers.length;
  
  // Tag each customer with churn
  const taggedCustomers = customers.map(c => ({
    ...c,
    Churn: determineChurnLabel(c)
  }));

  const churnCount = taggedCustomers.filter(c => c.Churn === "Yes").length;
  const stayCount = totalCustomers - churnCount;
  const churnRate = parseFloat(((churnCount / totalCustomers) * 100).toFixed(2));

  // Churn by Contract
  const contracts = ["Month-to-month", "One year", "Two year"];
  const churnByContract = contracts.map(contract => {
    const sub = taggedCustomers.filter(c => c.Contract === contract);
    const cCount = sub.filter(c => c.Churn === "Yes").length;
    const sCount = sub.length - cCount;
    return {
      contract,
      stay: sCount,
      churn: cCount,
      rate: sub.length > 0 ? parseFloat(((cCount / sub.length) * 100).toFixed(1)) : 0
    };
  });

  // Tenure Distribution (Bucketed)
  const tenureRanges = [
    { label: "1-12 Mo", min: 1, max: 12 },
    { label: "13-24 Mo", min: 13, max: 24 },
    { label: "25-36 Mo", min: 25, max: 36 },
    { label: "37-48 Mo", min: 37, max: 48 },
    { label: "49-60 Mo", min: 49, max: 60 },
    { label: "61-72 Mo", min: 61, max: 72 },
  ];
  const tenureDistribution = tenureRanges.map(range => {
    const sub = taggedCustomers.filter(c => c.tenure >= range.min && c.tenure <= range.max);
    const churned = sub.filter(c => c.Churn === "Yes").length;
    return {
      range: range.label,
      count: sub.length,
      churned
    };
  });

  // Monthly Charges Bucketed
  const chargeRanges = [
    { label: "$0-30", min: 0, max: 30 },
    { label: "$30-60", min: 30, max: 60 },
    { label: "$60-90", min: 60, max: 90 },
    { label: "$90-120", min: 90, max: 120 }
  ];
  const chargesByChurn = chargeRanges.map(range => {
    const sub = taggedCustomers.filter(c => c.MonthlyCharges >= range.min && c.MonthlyCharges < range.max);
    const churn = sub.filter(c => c.Churn === "Yes").length;
    return {
      range: range.label,
      stay: sub.length - churn,
      churn
    };
  });

  // Services Usage and Churn correlation
  const services = [
    { label: "TechSupport", field: "TechSupport" as keyof CustomerData },
    { label: "OnlineSecurity", field: "OnlineSecurity" as keyof CustomerData },
    { label: "OnlineBackup", field: "OnlineBackup" as keyof CustomerData },
    { label: "DeviceProtection", field: "DeviceProtection" as keyof CustomerData },
    { label: "StreamingTV", field: "StreamingTV" as keyof CustomerData },
    { label: "StreamingMovies", field: "StreamingMovies" as keyof CustomerData }
  ];
  const servicesUsage = services.map(srv => {
    const activeSub = taggedCustomers.filter(c => c[srv.field] === "Yes");
    const activeChurn = activeSub.filter(c => c.Churn === "Yes").length;
    return {
      service: srv.label,
      activeCount: activeSub.length,
      activeChurnRate: activeSub.length > 0 ? parseFloat(((activeChurn / activeSub.length) * 100).toFixed(1)) : 0
    };
  });

  // Payment Methods
  const pMethods = [
    "Electronic check",
    "Mailed check",
    "Bank transfer (automatic)",
    "Credit card (automatic)"
  ];
  const paymentMethods = pMethods.map(method => {
    const sub = taggedCustomers.filter(c => c.PaymentMethod === method);
    const churn = sub.filter(c => c.Churn === "Yes").length;
    return {
      method,
      count: sub.length,
      churnRate: sub.length > 0 ? parseFloat(((churn / sub.length) * 100).toFixed(1)) : 0
    };
  });

  return {
    totalCustomers,
    churnRate,
    churnCount,
    stayCount,
    churnByContract,
    tenureDistribution,
    chargesByChurn,
    servicesUsage,
    paymentMethods
  };
}
