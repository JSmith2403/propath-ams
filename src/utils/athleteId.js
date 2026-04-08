/**
 * Builds a unique athlete ID from name and date of birth.
 * Format: FullNameDDMMYY (spaces removed, hyphens kept)
 * Example: "Khalid Al-Mansouri" + "2003-08-15" → "KhalidAl-Mansouri150803"
 */
export function buildAthleteId(name, dob) {
  if (!name || !dob) return '';
  const parts = dob.split('-');
  const yyyy = parts[0] || '';
  const mm = parts[1] || '';
  const dd = parts[2] || '';
  const yy = yyyy.slice(2);
  return name.replace(/ /g, '') + dd + mm + yy;
}
