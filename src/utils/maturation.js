/**
 * Centralised maturation calculation (Khamis-Roche method).
 *
 * This is the SINGLE source of truth for all maturation outputs.
 * Used by: MaturationTab, AthleteCard, ReportTab.
 *
 * Parental height corrections (applied silently):
 *   Mother: reported height minus 0.8 cm
 *   Father: reported height minus 1.25 cm
 */

const SEE = { Male: 2.1, Female: 1.7 };

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
 * @param {string} params.dob           - Date of birth (ISO string or parseable)
 * @param {string} params.measureDate   - Date of measurement
 * @param {string} params.sex           - 'Male' or 'Female'
 *
 * @returns {object|null} All maturation outputs, or null if inputs are insufficient.
 */
export function calculateMaturation({ height, weight, motherHeight, fatherHeight, dob, measureDate, sex }) {
  const s = parseFloat(height);
  const b = parseFloat(weight);
  const mRaw = parseFloat(motherHeight);
  const fRaw = parseFloat(fatherHeight);

  // Validate required inputs
  if ([s, b, mRaw, fRaw].some(v => isNaN(v) || v <= 0)) return null;
  if (!dob || !measureDate) return null;

  const ageDecimal = calcAgeDecimal(dob, measureDate);
  if (!ageDecimal || ageDecimal <= 0) return null;

  const sexNorm = (sex || 'Male').trim();

  // Apply parental height corrections (silent)
  const mCorrected = mRaw - 0.8;
  const fCorrected = fRaw - 1.25;

  // Mid-parent height
  const midParent = sexNorm === 'Female'
    ? (fCorrected + mCorrected - 13) / 2
    : (fCorrected + mCorrected + 13) / 2;

  // Khamis-Roche PAH
  const a = ageDecimal;
  const pah = sexNorm === 'Female'
    ? (0.369 * s) + (0.271 * fCorrected) + (0.306 * mCorrected) + (0.037 * b) - (0.009 * a * a) + 8.96
    : (0.378 * s) + (0.308 * fCorrected) + (0.270 * mCorrected) + (0.054 * b) - (0.016 * a * a) + 12.13;

  if (!pah || pah <= 0) return null;

  const pahPct = (s / pah) * 100;
  const remainingGrowth = pah - s;

  // PHV proximity
  let stage;
  if (pahPct < 88) stage = 'Pre-PHV';
  else if (pahPct <= 95) stage = 'Circa-PHV';
  else stage = 'Post-PHV';

  // Confidence intervals
  const see = SEE[sexNorm] || SEE.Male;
  const ci50 = {
    low:  parseFloat((pah - see * 0.674).toFixed(1)),
    high: parseFloat((pah + see * 0.674).toFixed(1)),
  };
  const ci90 = {
    low:  parseFloat((pah - see * 1.645).toFixed(1)),
    high: parseFloat((pah + see * 1.645).toFixed(1)),
  };

  const ageYM = calcAgeYM(dob, measureDate);

  return {
    pah:             parseFloat(pah.toFixed(1)),
    pahPct:          parseFloat(pahPct.toFixed(1)),
    remainingGrowth: parseFloat(remainingGrowth.toFixed(1)),
    midParent:       parseFloat(midParent.toFixed(1)),
    stage,
    ci50,
    ci90,
    ageDecimal,
    ageYM,
    height:   s,
    sex:      sexNorm,
  };
}

/**
 * Get the most recent maturation inputs for an athlete from their phase2 data.
 * Scans all maturation entries to find the latest height, weight, and parent heights.
 *
 * @param {object} athlete - Full athlete object with phase2 data
 * @returns {object} { height, weight, motherHeight, fatherHeight, measureDate, sex, dob }
 */
export function getMostRecentMaturationInputs(athlete) {
  const entries = [...(athlete.phase2?.maturation?.entries || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (entries.length === 0) return null;

  // Find most recent values for each field (they may come from different entries)
  let height = null;
  let weight = null;
  let motherHeight = null;
  let fatherHeight = null;
  let measureDate = null;

  for (const entry of entries) {
    const h = entry.standingHeight ?? entry.stature ?? null;
    if (height === null && h != null) {
      height = h;
      measureDate = entry.date; // measurement date comes from the height entry
    }
    if (weight === null && entry.bodyMass != null) weight = entry.bodyMass;
    if (motherHeight === null && entry.motherHeight != null) motherHeight = entry.motherHeight;
    if (fatherHeight === null && entry.fatherHeight != null) fatherHeight = entry.fatherHeight;

    // Stop early if we have everything
    if (height != null && weight != null && motherHeight != null && fatherHeight != null) break;
  }

  if (!height || !weight || !motherHeight || !fatherHeight) return null;

  const sex = entries[0]?.sex || athlete.gender || 'Male';
  const dob = athlete.dob;

  return { height, weight, motherHeight, fatherHeight, measureDate, sex, dob };
}

/**
 * Convenience: calculate maturation for an athlete using their most recent data.
 *
 * @param {object} athlete - Full athlete object
 * @returns {object|null} Maturation result or null
 */
export function calculateAthleteMaturation(athlete) {
  const inputs = getMostRecentMaturationInputs(athlete);
  if (!inputs) return null;
  return calculateMaturation(inputs);
}
