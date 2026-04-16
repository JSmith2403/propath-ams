/**
 * Centralised maturation calculation (Khamis-Roche method).
 *
 * This is the SINGLE source of truth for all maturation outputs.
 * Used by: MaturationTab, AthleteCard, ReportTab.
 *
 * Coefficients: 1995 erratum (Pediatrics, 95:457, 1995).
 * Units: coefficients are in inches (height, mid-parent stature) and pounds (weight).
 * All inputs are converted from metric before applying the formula.
 *
 * Parental height corrections (applied silently before calculation):
 *   Mother: reported height minus 0.8 cm
 *   Father: reported height minus 1.25 cm
 */

// ── Unit conversions ─────────────────────────────────────────────────────────
const CM_TO_IN = 1 / 2.54;
const KG_TO_LB = 2.20462;
const IN_TO_CM = 2.54;

// ── Standard error of estimate (in inches) ───────────────────────────────────
const SEE_IN = { Male: 0.83, Female: 0.67 };

// ── 1995 Erratum coefficients ────────────────────────────────────────────────
// Each row: [age, intercept, stature, weight, midParent]
// Stature and mid-parent in inches; weight in pounds.

const FEMALE_COEFFICIENTS = [
  [4.0,  -8.13250, 1.24768, -0.01944, 0.44774],
  [4.5,  -6.47656, 1.22177, -0.01852, 0.41381],
  [5.0,  -5.13582, 1.19932, -0.01753, 0.38467],
  [5.5,  -4.13791, 1.17880, -0.01648, 0.36039],
  [6.0,  -3.51039, 1.15866, -0.01540, 0.34105],
  [6.5,  -3.14322, 1.13737, -0.01429, 0.32672],
  [7.0,  -2.87645, 1.11342, -0.01318, 0.31748],
  [7.5,  -2.66291, 1.08525, -0.01209, 0.31340],
  [8.0,  -2.45559, 1.05135, -0.01102, 0.31457],
  [8.5,  -2.20728, 1.01018, -0.01000, 0.32105],
  [9.0,  -1.87098, 0.96020, -0.00904, 0.33291],
  [9.5,  -1.06330, 0.89989, -0.00817, 0.35025],
  [10.0,  0.33468, 0.82771, -0.00740, 0.37312],
  [10.5,  1.97366, 0.74213, -0.00674, 0.40161],
  [11.0,  3.50436, 0.67173, -0.00614, 0.42042],
  [11.5,  4.57747, 0.64150, -0.00552, 0.41686],
  [12.0,  4.84365, 0.64452, -0.00489, 0.39490],
  [12.5,  4.27869, 0.67386, -0.00427, 0.35850],
  [13.0,  3.21417, 0.72260, -0.00366, 0.31163],
  [13.5,  1.83456, 0.78383, -0.00307, 0.25826],
  [14.0,  0.32425, 0.85062, -0.00250, 0.20235],
  [14.5, -1.13224, 0.91605, -0.00197, 0.14787],
  [15.0, -2.35055, 0.97319, -0.00148, 0.09880],
  [15.5, -3.10326, 1.01514, -0.00104, 0.05909],
  [16.0, -3.17885, 1.03496, -0.00066, 0.03272],
  [16.5, -2.41657, 1.02573, -0.00034, 0.02364],
  [17.0, -0.65579, 0.98054, -0.00010, 0.03584],
  [17.5,  2.26429, 0.89246,  0.00006, 0.07327],
];

const MALE_COEFFICIENTS = [
  [4.0,  -10.25670, 1.23812, -0.00872, 0.50286],
  [4.5,  -10.71900, 1.15964, -0.00745, 0.52887],
  [5.0,  -11.02130, 1.10674, -0.00648, 0.53919],
  [5.5,  -11.15560, 1.07480, -0.00578, 0.53691],
  [6.0,  -11.11380, 1.05923, -0.00529, 0.52513],
  [6.5,  -11.02210, 1.05542, -0.00499, 0.50692],
  [7.0,  -10.99840, 1.05877, -0.00481, 0.48538],
  [7.5,  -11.02140, 1.06467, -0.00472, 0.46361],
  [8.0,  -11.06960, 1.06853, -0.00468, 0.44449],
  [8.5,  -11.12200, 1.06572, -0.00463, 0.43171],
  [9.0,  -11.15710, 1.05166, -0.00453, 0.42776],
  [9.5,  -11.14050, 1.02174, -0.00433, 0.43593],
  [10.0, -11.03800, 0.97135, -0.00400, 0.45932],
  [10.5, -10.82860, 0.89589, -0.00348, 0.50101],
  [11.0, -10.49170, 0.81239, -0.00291, 0.54781],
  [11.5, -10.00650, 0.74134, -0.00242, 0.58409],
  [12.0,  -9.35220, 0.68325, -0.00201, 0.60927],
  [12.5,  -8.60550, 0.63869, -0.00167, 0.62279],
  [13.0,  -7.86320, 0.60818, -0.00139, 0.62407],
  [13.5,  -7.13480, 0.59228, -0.00116, 0.61253],
  [14.0,  -6.42990, 0.59151, -0.00098, 0.58762],
  [14.5,  -5.75780, 0.60643, -0.00083, 0.54875],
  [15.0,  -5.12820, 0.63757, -0.00070, 0.49536],
  [15.5,  -4.50920, 0.68548, -0.00059, 0.42687],
  [16.0,  -3.92920, 0.75069, -0.00048, 0.34271],
  [16.5,  -3.48730, 0.83375, -0.00037, 0.24231],
  [17.0,  -3.28300, 0.93520, -0.00025, 0.12510],
  [17.5,  -3.41560, 1.05558, -0.00010, -0.00950],
];

/**
 * Get interpolated (or extrapolated) coefficients for a given age.
 * Returns { intercept, stature, weight, midParent, extrapolated }.
 */
function getCoefficients(sex, age) {
  const table = sex === 'Female' ? FEMALE_COEFFICIENTS : MALE_COEFFICIENTS;

  // Exact match
  const exact = table.find(r => r[0] === age);
  if (exact) return { intercept: exact[1], stature: exact[2], weight: exact[3], midParent: exact[4], extrapolated: false };

  // Below minimum age
  if (age < 4.0) return null;

  // Above 19.0 — out of range
  if (age > 19.0) return null;

  // Extrapolation for 17.5 to 19.0: linear trend from last 3 points (16.5, 17.0, 17.5)
  if (age > 17.5) {
    const p0 = table[table.length - 3]; // 16.5
    const p1 = table[table.length - 2]; // 17.0
    const p2 = table[table.length - 1]; // 17.5

    // Linear extrapolation from last 3 points using least-squares slope
    const coeffs = {};
    for (let ci = 1; ci <= 4; ci++) {
      const x = [p0[0], p1[0], p2[0]];
      const y = [p0[ci], p1[ci], p2[ci]];
      const xMean = (x[0] + x[1] + x[2]) / 3;
      const yMean = (y[0] + y[1] + y[2]) / 3;
      const num = x.reduce((s, xi, i) => s + (xi - xMean) * (y[i] - yMean), 0);
      const den = x.reduce((s, xi) => s + (xi - xMean) ** 2, 0);
      const slope = den === 0 ? 0 : num / den;
      const intercept = yMean - slope * xMean;
      const names = ['', 'intercept', 'stature', 'weight', 'midParent'];
      coeffs[names[ci]] = intercept + slope * age;
    }
    return { ...coeffs, extrapolated: true };
  }

  // Interpolation between two nearest half-year values
  let lower = null;
  let upper = null;
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i][0] <= age && table[i + 1][0] > age) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }
  if (!lower || !upper) return null;

  const t = (age - lower[0]) / (upper[0] - lower[0]);
  return {
    intercept: lower[1] + t * (upper[1] - lower[1]),
    stature:   lower[2] + t * (upper[2] - lower[2]),
    weight:    lower[3] + t * (upper[3] - lower[3]),
    midParent: lower[4] + t * (upper[4] - lower[4]),
    extrapolated: false,
  };
}

/**
 * Calculate decimal age from DOB and measurement date.
 */
export function calcAgeDecimal(dob, measureDate) {
  if (!dob || !measureDate) return null;
  const age = (new Date(measureDate) - new Date(dob)) / (365.25 * 86400000);
  return age > 0 ? age : null;
}

/**
 * Calculate age in years and months.
 */
export function calcAgeYM(dob, measureDate) {
  if (!dob || !measureDate) return null;
  const d1 = new Date(dob);
  const d2 = new Date(measureDate);
  let y = d2.getFullYear() - d1.getFullYear();
  let m = d2.getMonth() - d1.getMonth();
  if (d2.getDate() < d1.getDate()) m--;
  if (m < 0) { y--; m += 12; }
  return { years: y, months: m };
}

/**
 * Core maturation calculation.
 *
 * @param {object} params
 * @param {number} params.height        - Athlete height in cm
 * @param {number} params.weight        - Athlete weight in kg
 * @param {number} params.motherHeight  - Mother's reported height in cm
 * @param {number} params.fatherHeight  - Father's reported height in cm
 * @param {string} params.dob           - Date of birth
 * @param {string} params.measureDate   - Date of measurement
 * @param {string} params.sex           - 'Male' or 'Female'
 *
 * @returns {object|null} All maturation outputs, or null if inputs are insufficient.
 *   Includes `extrapolated: true` if age is between 17.5 and 19.0.
 *   Returns `outOfRange: 'below'|'above'` if age is outside 4.0-19.0.
 */
export function calculateMaturation({ height, weight, motherHeight, fatherHeight, dob, measureDate, sex }) {
  const heightCm = parseFloat(height);
  const weightKg = parseFloat(weight);
  const mRaw = parseFloat(motherHeight);
  const fRaw = parseFloat(fatherHeight);

  // Validate required inputs
  if ([heightCm, weightKg, mRaw, fRaw].some(v => isNaN(v) || v <= 0)) return null;
  if (!dob || !measureDate) return null;

  const ageDecimal = calcAgeDecimal(dob, measureDate);
  if (!ageDecimal || ageDecimal <= 0) return null;

  const sexNorm = (sex || 'Male').trim();

  // Age range checks
  if (ageDecimal < 4.0) return { outOfRange: 'below', ageDecimal, ageYM: calcAgeYM(dob, measureDate) };
  if (ageDecimal > 19.0) return { outOfRange: 'above', ageDecimal, ageYM: calcAgeYM(dob, measureDate) };

  // Apply parental height corrections (silent, in cm)
  const mCorrectedCm = mRaw - 0.8;
  const fCorrectedCm = fRaw - 1.25;

  // Mid-parent height (in cm, using corrected values)
  const midParentCm = sexNorm === 'Female'
    ? (fCorrectedCm + mCorrectedCm - 13) / 2
    : (fCorrectedCm + mCorrectedCm + 13) / 2;

  // Convert to imperial for the Khamis-Roche formula
  const statureIn = heightCm * CM_TO_IN;
  const weightLb = weightKg * KG_TO_LB;
  const midParentIn = midParentCm * CM_TO_IN;

  // Get age-specific coefficients
  const coeffs = getCoefficients(sexNorm, Math.round(ageDecimal * 2) / 2 <= 17.5
    ? ageDecimal : ageDecimal);
  if (!coeffs) return null;

  // Khamis-Roche formula: PAH (inches) = intercept + (stature_coeff * stature_in) + (weight_coeff * weight_lb) + (midparent_coeff * midparent_in)
  const pahIn = coeffs.intercept
    + (coeffs.stature * statureIn)
    + (coeffs.weight * weightLb)
    + (coeffs.midParent * midParentIn);

  // Convert PAH back to cm
  const pahCm = pahIn * IN_TO_CM;
  if (!pahCm || pahCm <= 0) return null;

  const pahPct = (heightCm / pahCm) * 100;
  const remainingGrowth = pahCm - heightCm;

  // PHV proximity
  let stage;
  if (pahPct < 88) stage = 'Pre-PHV';
  else if (pahPct <= 95) stage = 'Circa-PHV';
  else stage = 'Post-PHV';

  // Confidence intervals (SEE is in inches, convert margin to cm)
  const seeIn = SEE_IN[sexNorm] || SEE_IN.Male;
  const ci50 = {
    low:  parseFloat((pahCm - seeIn * IN_TO_CM * 0.674).toFixed(1)),
    high: parseFloat((pahCm + seeIn * IN_TO_CM * 0.674).toFixed(1)),
  };
  const ci90 = {
    low:  parseFloat((pahCm - seeIn * IN_TO_CM * 1.645).toFixed(1)),
    high: parseFloat((pahCm + seeIn * IN_TO_CM * 1.645).toFixed(1)),
  };

  const ageYM = calcAgeYM(dob, measureDate);

  return {
    pah:             parseFloat(pahCm.toFixed(1)),
    pahPct:          parseFloat(pahPct.toFixed(1)),
    remainingGrowth: parseFloat(remainingGrowth.toFixed(1)),
    midParent:       parseFloat(midParentCm.toFixed(1)),
    stage,
    ci50,
    ci90,
    ageDecimal,
    ageYM,
    height:      heightCm,
    sex:         sexNorm,
    extrapolated: coeffs.extrapolated,
  };
}

/**
 * Get the most recent maturation inputs for an athlete from their phase2 data.
 * Scans all maturation entries to find the latest height, weight, and parent heights.
 */
export function getMostRecentMaturationInputs(athlete) {
  const entries = [...(athlete.phase2?.maturation?.entries || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (entries.length === 0) return null;

  let height = null;
  let weight = null;
  let motherHeight = null;
  let fatherHeight = null;
  let measureDate = null;

  for (const entry of entries) {
    const h = entry.standingHeight ?? entry.stature ?? null;
    if (height === null && h != null) {
      height = h;
      measureDate = entry.date;
    }
    if (weight === null && entry.bodyMass != null) weight = entry.bodyMass;
    if (motherHeight === null && entry.motherHeight != null) motherHeight = entry.motherHeight;
    if (fatherHeight === null && entry.fatherHeight != null) fatherHeight = entry.fatherHeight;

    if (height != null && weight != null && motherHeight != null && fatherHeight != null) break;
  }

  if (!height || !weight || !motherHeight || !fatherHeight) return null;

  const sex = entries[0]?.sex || athlete.gender || 'Male';
  const dob = athlete.dob;

  return { height, weight, motherHeight, fatherHeight, measureDate, sex, dob };
}

/**
 * Convenience: calculate maturation for an athlete using their most recent data.
 */
export function calculateAthleteMaturation(athlete) {
  const inputs = getMostRecentMaturationInputs(athlete);
  if (!inputs) return null;
  return calculateMaturation(inputs);
}
