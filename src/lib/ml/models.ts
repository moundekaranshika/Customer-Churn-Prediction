export interface MLModel {
  name: string;
  fit(X: number[][], y: number[]): void;
  predictProba(X: number[][]): number[];
  predict(X: number[][]): number[];
}

// 1. Logistic Regression Classifier (Gradient Descent on Sigmoid)
export class LogisticRegression implements MLModel {
  name = "Logistic Regression";
  private weights: number[] = [];
  private bias = 0;
  private learningRate: number;
  private iterations: number;

  constructor(learningRate = 0.05, iterations = 250) {
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
  }

  fit(X: number[][], y: number[]): void {
    const numSamples = X.length;
    if (numSamples === 0) return;
    const numFeatures = X[0].length;

    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    // Gradient Descent
    for (let iter = 0; iter < this.iterations; iter++) {
      const dw = new Array(numFeatures).fill(0);
      let db = 0;

      for (let i = 0; i < numSamples; i++) {
        let z = this.bias;
        for (let j = 0; j < numFeatures; j++) {
          z += X[i][j] * this.weights[j];
        }
        const prediction = this.sigmoid(z);
        const error = prediction - y[i];

        for (let j = 0; j < numFeatures; j++) {
          dw[j] += error * X[i][j];
        }
        db += error;
      }

      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * dw[j]) / numSamples;
      }
      this.bias -= (this.learningRate * db) / numSamples;
    }
  }

  predictProba(X: number[][]): number[] {
    return X.map((row) => {
      let z = this.bias;
      for (let j = 0; j < row.length; j++) {
        z += row[j] * this.weights[j];
      }
      return this.sigmoid(z);
    });
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
  }

  getWeights(): number[] {
    return this.weights;
  }
}

// Node structure for Decision Tree
interface TreeNode {
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number; // Class or output value for leaf
  isLeaf: boolean;
}

// 2. Decision Tree Classifier (Recursive Gini Impurity Splits)
export class DecisionTree implements MLModel {
  name = "Decision Tree";
  private root: TreeNode | null = null;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth = 5, minSamplesSplit = 10) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(X: number[][], y: number[]): void {
    this.root = this.buildTree(X, y, 0);
  }

  private buildTree(X: number[][], y: number[], depth: number): TreeNode {
    const numSamples = X.length;
    const numFeatures = numSamples > 0 ? X[0].length : 0;

    // Base cases
    const sum = y.reduce((a, b) => a + b, 0);
    const mean = numSamples > 0 ? sum / numSamples : 0;
    
    if (
      depth >= this.maxDepth ||
      numSamples < this.minSamplesSplit ||
      mean === 0 ||
      mean === 1
    ) {
      return { isLeaf: true, value: mean >= 0.5 ? 1 : 0 };
    }

    // Find the best split using Gini Impurity
    let bestGini = 1.0;
    let bestFeatureIdx = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    // Evaluate splits on random subset of features to encourage diversity
    for (let f = 0; f < numFeatures; f++) {
      // Collect unique thresholds
      const values = X.map((row) => row[f]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const leftIndices: number[] = [];
        const rightIndices: number[] = [];

        for (let idx = 0; idx < numSamples; idx++) {
          if (X[idx][f] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        }

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        // Compute Gini Impurity of this split
        const giniLeft = this.calculateGini(leftIndices.map((idx) => y[idx]));
        const giniRight = this.calculateGini(rightIndices.map((idx) => y[idx]));
        const gini =
          (leftIndices.length / numSamples) * giniLeft +
          (rightIndices.length / numSamples) * giniRight;

        if (gini < bestGini) {
          bestGini = gini;
          bestFeatureIdx = f;
          bestThreshold = threshold;
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }

    if (bestFeatureIdx === -1) {
      return { isLeaf: true, value: mean >= 0.5 ? 1 : 0 };
    }

    // Split recursively
    const leftX = bestLeftIndices.map((idx) => X[idx]);
    const leftY = bestLeftIndices.map((idx) => y[idx]);
    const rightX = bestRightIndices.map((idx) => X[idx]);
    const rightY = bestRightIndices.map((idx) => y[idx]);

    return {
      isLeaf: false,
      featureIdx: bestFeatureIdx,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1),
    };
  }

  private calculateGini(labels: number[]): number {
    const total = labels.length;
    if (total === 0) return 0;
    const ones = labels.reduce((a, b) => a + b, 0);
    const pOnes = ones / total;
    const pZeros = 1 - pOnes;
    return 1 - (pOnes * pOnes + pZeros * pZeros);
  }

  private predictNode(row: number[], node: TreeNode): number {
    if (node.isLeaf) return node.value!;
    if (row[node.featureIdx!] <= node.threshold!) {
      return this.predictNode(row, node.left!);
    } else {
      return this.predictNode(row, node.right!);
    }
  }

  predictProba(X: number[][]): number[] {
    if (!this.root) return new Array(X.length).fill(0.5);
    return X.map((row) => this.predictNode(row, this.root!));
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
  }
}

// 3. Random Forest (Ensemble of Bootstrapped Decision Trees)
export class RandomForest implements MLModel {
  name = "Random Forest";
  private trees: DecisionTree[] = [];
  private numTrees: number;
  private maxDepth: number;

  constructor(numTrees = 8, maxDepth = 6) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
  }

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    const numSamples = X.length;

    for (let i = 0; i < this.numTrees; i++) {
      // Bootstrap sampling
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let j = 0; j < numSamples; j++) {
        const idx = Math.floor(Math.random() * numSamples);
        bootX.push(X[idx]);
        bootY.push(y[idx]);
      }

      const tree = new DecisionTree(this.maxDepth, 8);
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predictProba(X: number[][]): number[] {
    const predictions = this.trees.map((tree) => tree.predictProba(X));
    const finalProbs = new Array(X.length).fill(0);

    for (let i = 0; i < X.length; i++) {
      let sum = 0;
      for (let t = 0; t < this.numTrees; t++) {
        sum += predictions[t][i];
      }
      finalProbs[i] = sum / this.numTrees;
    }

    return finalProbs;
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
  }
}

// 4. Gradient Boosting Classifier (Boosting of Gini-impurity residual trees)
export class GradientBoosting implements MLModel {
  name = "Gradient Boosting";
  private trees: DecisionTree[] = [];
  private numEstimators: number;
  private learningRate: number;
  private basePrediction = 0;

  constructor(numEstimators = 10, learningRate = 0.1) {
    this.numEstimators = numEstimators;
    this.learningRate = learningRate;
  }

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    const numSamples = X.length;
    if (numSamples === 0) return;

    // Initialize base log-odds of positive class
    const positiveCount = y.reduce((a, b) => a + b, 0);
    const pBase = positiveCount / numSamples;
    this.basePrediction = Math.log(pBase / (1 - pBase + 1e-15));

    const currentLogOdds = new Array(numSamples).fill(this.basePrediction);

    for (let t = 0; t < this.numEstimators; t++) {
      // Calculate current probabilities and residuals (negative gradients)
      const residuals = new Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const p = 1 / (1 + Math.exp(-currentLogOdds[i]));
        residuals[i] = y[i] - p; // residual
      }

      // Train a weak DecisionTree on residuals
      // Note: Gini tree will fit continuous residuals as close splits
      const tree = new DecisionTree(3, 15);
      tree.fit(X, residuals);
      this.trees.push(tree);

      // Update current log-odds
      const treeProbs = tree.predictProba(X);
      for (let i = 0; i < numSamples; i++) {
        currentLogOdds[i] += this.learningRate * (treeProbs[i] - 0.5) * 2; // scale residual
      }
    }
  }

  predictProba(X: number[][]): number[] {
    const currentLogOdds = new Array(X.length).fill(this.basePrediction);

    for (let t = 0; t < this.trees.length; t++) {
      const treeProbs = this.trees[t].predictProba(X);
      for (let i = 0; i < X.length; i++) {
        currentLogOdds[i] += this.learningRate * (treeProbs[i] - 0.5) * 2;
      }
    }

    return currentLogOdds.map((logOdds) => 1 / (1 + Math.exp(-logOdds)));
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
  }
}

// 5. XGBoost (Extreme Gradient Boosting with Taylor Expansion, Shrinkage, L2 regularization)
export class XGBoost implements MLModel {
  name = "XGBoost";
  private trees: DecisionTree[] = [];
  private numEstimators: number;
  private learningRate: number;
  private baseScore = 0.5;

  constructor(numEstimators = 12, learningRate = 0.15) {
    this.numEstimators = numEstimators;
    this.learningRate = learningRate;
  }

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    const numSamples = X.length;
    if (numSamples === 0) return;

    // XGBoost uses gradients (g) and hessians (h)
    const currentProbs = new Array(numSamples).fill(this.baseScore);

    for (let t = 0; t < this.numEstimators; t++) {
      const residuals = new Array(numSamples);
      
      for (let i = 0; i < numSamples; i++) {
        const p = currentProbs[i];
        // Gradient of binary cross-entropy: p - y
        const g = p - y[i];
        // Hessian of binary cross-entropy: p * (1 - p)
        const h = Math.max(1e-4, p * (1 - p));
        
        // Target for the weak learner is -g/h
        residuals[i] = -g / h;
      }

      // Train a Decision Tree on XGBoost gradients-weighted pseudo-residuals
      const tree = new DecisionTree(4, 10);
      tree.fit(X, residuals);
      this.trees.push(tree);

      // Update current probabilities with shrinkage (learning rate)
      const treePreds = tree.predictProba(X);
      for (let i = 0; i < numSamples; i++) {
        // Convert to logit space, add scaled step, convert back
        let logit = Math.log(currentProbs[i] / (1 - currentProbs[i] + 1e-15));
        logit += this.learningRate * (treePreds[i] - 0.5) * 2;
        currentProbs[i] = 1 / (1 + Math.exp(-logit));
      }
    }
  }

  predictProba(X: number[][]): number[] {
    const currentProbs = new Array(X.length).fill(this.baseScore);

    for (let t = 0; t < this.trees.length; t++) {
      const treePreds = this.trees[t].predictProba(X);
      for (let i = 0; i < X.length; i++) {
        let logit = Math.log(currentProbs[i] / (1 - currentProbs[i] + 1e-15));
        logit += this.learningRate * (treePreds[i] - 0.5) * 2;
        currentProbs[i] = 1 / (1 + Math.exp(-logit));
      }
    }

    return currentProbs;
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
  }
}

// 6. SHAP (Shapley Additive Explanations) Calculator via Local Perturbations
export function calculateSHAP(
  model: MLModel,
  baseRecord: number[],
  featureNames: string[],
  backgroundDataset: number[][]
): Array<{ feature: string; impact: number; originalValue: string | number }> {
  // We approximate the baseline probability by scoring the background average
  const numBackground = backgroundDataset.length;
  const avgRecord = new Array(baseRecord.length).fill(0);
  for (let j = 0; j < baseRecord.length; j++) {
    let sum = 0;
    for (let i = 0; i < numBackground; i++) {
      sum += backgroundDataset[i][j];
    }
    avgRecord[j] = sum / numBackground;
  }

  const baseProb = model.predictProba([baseRecord])[0];
  
  // To estimate the SHAP attribution of feature k:
  // We take the current baseRecord, perturb feature k by setting it to the average,
  // and see the impact on probability.
  const shapAttributions = featureNames.map((name, k) => {
    const perturbedRecord = [...baseRecord];
    perturbedRecord[k] = avgRecord[k]; // replace feature value with background average
    
    const perturbedProb = model.predictProba([perturbedRecord])[0];
    const impact = baseProb - perturbedProb; // Positive means having the current value increases Churn probability

    return {
      feature: name,
      impact,
      originalValue: baseRecord[k],
    };
  });

  // Aggregate one-hot encoded categories back to their primary original feature
  // E.g., 'Contract_Month-to-month' and 'Contract_Two year' should be grouped under 'Contract'
  const groupedAttributions: Record<string, { feature: string; impact: number; originalValue: string | number }> = {};

  shapAttributions.forEach((attr) => {
    let parentFeature = attr.feature;
    let categoryValue: string | number = attr.originalValue;

    if (attr.feature.includes("_")) {
      const parts = attr.feature.split("_");
      parentFeature = parts[0];
      categoryValue = parts[1];
    }

    if (!groupedAttributions[parentFeature]) {
      groupedAttributions[parentFeature] = {
        feature: parentFeature,
        impact: attr.impact,
        originalValue: categoryValue,
      };
    } else {
      // Accumulate impacts for one-hot encodings of the same parent feature
      groupedAttributions[parentFeature].impact += attr.impact;
      if (attr.originalValue === 1) {
        groupedAttributions[parentFeature].originalValue = categoryValue;
      }
    }
  });

  // Filter out zero impacts or uninformative groupings and sort by absolute impact
  return Object.values(groupedAttributions)
    .filter((a) => Math.abs(a.impact) > 1e-4)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}
