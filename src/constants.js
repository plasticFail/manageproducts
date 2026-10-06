export const PROJECT_TYPES = ["Alpha", "Bravo", "Charlie"];
export const PERSONNEL_LIST = ["Category A", "Category B", "Category C", "Category D"];
export const PERSONNEL_BY_PROJECT_TYPE = { Alpha: PERSONNEL_LIST, Bravo: PERSONNEL_LIST, Charlie: PERSONNEL_LIST };
export const HOUSEHOLDS = [
  "123A",
  "456B",
  "789C",
  "234D",
  "345E",
  "567F",
  "678G",
  "890H",
  "901J",
  "112K",
  "223L",
  "334M",
  "445N",
  "556P",
  "667Q",
  "778R",
];
export const VISIBLE_MONTHS = 6;
// Year (and Month) column width in the Schedule for All Households tables
const YEAR_COL_W = 180;
const CYCLE_FILTERS = ["All", "O", "T", "X"];
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = 2026;
const YEAR_OPTIONS = ["2025", "2026", "2027", "2028", "2029", "2030"];

// Type X Mappings with one of these Codes keep their Product Families out of the Schedule (not offered in Fixed).
export const NOT_SCHEDULED_CODES = ["PREP"];
