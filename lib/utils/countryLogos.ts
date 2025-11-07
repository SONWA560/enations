// Utility functions for country logos using @aliimam/logos
// This package provides country flag SVGs

// Map country names to ISO codes for the logo package
export const countryCodeMap: Record<string, string> = {
  "Algeria": "dz",
  "Angola": "ao",
  "Benin": "bj",
  "Botswana": "bw",
  "Burkina Faso": "bf",
  "Burundi": "bi",
  "Cameroon": "cm",
  "Cape Verde": "cv",
  "Central African Republic": "cf",
  "Chad": "td",
  "Comoros": "km",
  "Congo": "cg",
  "DR Congo": "cd",
  "Djibouti": "dj",
  "Egypt": "eg",
  "Equatorial Guinea": "gq",
  "Eritrea": "er",
  "Eswatini": "sz",
  "Ethiopia": "et",
  "Gabon": "ga",
  "Gambia": "gm",
  "Ghana": "gh",
  "Guinea": "gn",
  "Guinea-Bissau": "gw",
  "Ivory Coast": "ci",
  "Kenya": "ke",
  "Lesotho": "ls",
  "Liberia": "lr",
  "Libya": "ly",
  "Madagascar": "mg",
  "Malawi": "mw",
  "Mali": "ml",
  "Mauritania": "mr",
  "Mauritius": "mu",
  "Morocco": "ma",
  "Mozambique": "mz",
  "Namibia": "na",
  "Niger": "ne",
  "Nigeria": "ng",
  "Rwanda": "rw",
  "Sao Tome and Principe": "st",
  "Senegal": "sn",
  "Seychelles": "sc",
  "Sierra Leone": "sl",
  "Somalia": "so",
  "South Africa": "za",
  "South Sudan": "ss",
  "Sudan": "sd",
  "Tanzania": "tz",
  "Togo": "tg",
  "Tunisia": "tn",
  "Uganda": "ug",
  "Zambia": "zm",
  "Zimbabwe": "zw"
};

export function getCountryCode(countryName: string): string {
  return countryCodeMap[countryName] || "un"; // un for unknown
}

// Returns the CDN URL for the country flag
export function getCountryFlagUrl(countryName: string): string {
  const code = getCountryCode(countryName);
  // Using the package's CDN or direct import path
  return `https://flagcdn.com/w160/${code}.png`;
}
