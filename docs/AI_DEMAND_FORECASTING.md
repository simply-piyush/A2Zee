# AI Demand Forecasting & Fair-Share Workforce Allocation Engine
## Mathematical Foundations & Algorithmic Design
**Ministry of Cooperation | National Council for Cooperative Training (NCCT)**  
**Problem Statement ID:** 26089  

---

## 1. Objectives

1. **Demand Surge Forecasting:** Predict seasonal and weekly fluctuations in household repair requests (e.g., electrical breakdowns during heatwaves, plumbing issues during monsoons, deep-cleaning/carpentry before festivals).
2. **Equitable Fair-Share Dispatch:** Prevent "winner-take-all" algorithmic bias (common on private platforms where the top 5% of workers receive 80% of jobs), ensuring sustainable income distribution across all cooperative member workers.

---

## 2. Predictive Demand Forecasting Model

### 2.1 Model Architecture
We utilize an ensemble time-series regression model combining **Facebook Prophet** (for multi-seasonal trend decomposition) with **LightGBM** (incorporating weather variables and calendar events).

$$\hat{y}(t) = g(t) + s(t) + h(t) + \beta X_t + \epsilon_t$$

Where:
- $g(t)$: Non-periodic piecewise linear growth trend.
- $s(t)$: Periodic weekly and annual seasonal variations.
- $h(t)$: Holiday / festival effects (e.g., Diwali home renovation surge, Holi, Eid).
- $X_t$: Exogenous regressors:
  - Temperature & Heat Index (triggers air conditioning & electrical repairs).
  - Rainfall / Monsoon severity (triggers plumbing & waterproofing demand).
  - Municipal power outage indicators.

### 2.2 Demand Output Aggregation
For each postal ward $w$ and service trade $k$, the model forecasts daily demand $D_{w, k}(t+7)$ 7 days in advance, prompting the Cooperative Federation to notify societies:
```
IF Projected Demand > Active Worker Capacity * 1.3:
    Trigger "Reserve Worker Mobilization Alert" to Primary Society Secretary
```

---

## 3. Fair-Share Gig Allocation Algorithm

Unlike private aggregators that optimize solely for fastest arrival (often overloading a few workers while starving others), **SahakarSeva** computes a **Multi-Objective Cooperative Fitness Score** $S(w, j)$ for matching worker $w$ to gig $j$:

$$S(w, j) = w_1 \cdot \text{DistanceNorm}(w, j) + w_2 \cdot \text{FairnessDeficit}(w) + w_3 \cdot \text{SkillTierMatch}(w, j) + w_4 \cdot \text{RatingScore}(w)$$

### Weights Calibration:
- $w_1 = 0.35$ (Geo-Proximity weight to ensure rapid response time under 30 mins)
- $w_2 = 0.35$ (**Fairness Deficit weight:** Workers who have completed fewer gigs this week receive higher dispatch priority)
- $w_3 = 0.15$ (Appropriate NCCT skill tier match)
- $w_4 = 0.15$ (Customer satisfaction score)

### Fairness Deficit Formulation:
$$\text{FairnessDeficit}(w) = \max\left(0, \frac{\bar{G}_{\text{society}} - G_w}{\bar{G}_{\text{society}} + 1}\right)$$

Where:
- $G_w$: Number of gigs assigned to worker $w$ in the last 7 rolling days.
- $\bar{G}_{\text{society}}$: Average gigs completed across all active workers in that society.

### Benefits of the Cooperative Dispatch:
1. Prevents worker exhaustion and burnout.
2. Ensures young apprentices paired with seniors gain active on-the-job training hours.
3. Stabilizes median household income across all member families in the cooperative.
