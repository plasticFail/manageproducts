import { up } from "../lib/utils";
import { UNITS } from "../constants";

const SEED_FAMILIES = [
  ["Fruits", ["Apple", "Banana", "Orange"], "2026-08-20T09:00:00"],
  ["Machines", ["Lathe", "Drill"], "2026-08-25T11:00:00"],
  [
    "Gadgets",
    ["Radio", "Battery", "Charger", "Speaker", "Headphone", "Cable", "Adapter", "Powerbank", "Router", "Modem"],
    "2026-09-02T14:00:00",
  ],
  ["Writing", ["Pen", "Notebook", "Highlighter"], "2026-09-18T09:30:00"],
  ["Toys", ["Puzzle", "Block", "Figure"], "2026-09-12T10:00:00"],
  ["Decor", ["Chair", "Desk", "Lamp"], "2026-09-22T15:20:00"],
  ["Beauty", ["Shampoo", "Lotion", "Perfume"], "2026-09-14T11:30:00"],
  ["Sports", ["Football", "Racket", "Mat"], "2026-09-16T13:00:00"],
  ["Books", ["Novel", "Textbook", "Comic"], "2026-09-19T15:45:00"],
  [
    "Food",
    [
      "Rice",
      "Flour",
      "Sugar",
      "Salt",
      "Oil",
      "Pasta",
      "Bean",
      "Cereal",
      "Milk",
      "Egg",
      "Bread",
      "Butter",
      "Cheese",
      "Yogurt",
      "Coffee",
      "Tea",
      "Honey",
      "Peanut",
      "Jam",
      "Spice",
    ],
    "2026-09-11T08:40:00",
  ],
  ["Hardware", ["Hammer", "Screwdriver", "Wrench", "Nail", "Screw"], "2026-09-13T09:15:00"],
  ["Clothes", ["Shirt", "Trouser", "Jacket", "Sock"], "2026-09-06T10:05:00"],
  ["Footwear", ["Sneaker", "Boot", "Sandal"], "2026-09-07T14:20:00"],
  ["Cookware", ["Pot", "Pan", "Knife", "Board"], "2026-09-09T11:10:00"],
  ["Garden", ["Shovel", "Sprinkler", "Planter"], "2026-09-17T13:35:00"],
  ["Auto", ["Tire", "Wiper", "Coolant"], "2026-09-21T09:50:00"],
  ["Pet Care", ["Kibble", "Litter", "Leash"], "2026-09-03T15:00:00"],
  ["Office", ["Stapler", "Clip", "Folder"], "2026-09-04T10:45:00"],
  ["Wellness", ["Vitamin", "Bandage", "Thermometer"], "2026-09-23T08:25:00"],
  ["Baby", ["Diaper", "Wipe", "Formula"], "2026-09-24T09:05:00"],
  ["Music", ["Guitar", "Keyboard", "Drumstick"], "2026-09-25T12:15:00"],
  ["Art Kits", ["Watercolor", "Canvas", "Brush"], "2026-09-26T14:50:00"],
  ["Cars", ["Sedan", "Hatchback", "Pickup"], "2026-09-28T10:10:00"],
  ["Paint", ["Primer", "Enamel", "Varnish"], "2026-09-29T11:20:00"],
  ["Mall", ["Voucher", "Kiosk", "Trolley"], "2026-09-30T13:40:00"],
  ["Zoo", ["Ticket", "Plush", "Keychain"], "2026-10-01T09:30:00"],
  // One Product per Unit for the read-only Fixed column; names are unique across all Product Families and Products.
  // SAVE1, SAVE2, SAVE5 and SAVE6 are extras beyond the one FIXED Product per Unit; the O/T/X Mappings give them to Units.
  ["Fixed", [...UNITS.map((_, i) => `Fixed${i + 1}`), "Save1", "Save2", "Save5", "Save6"], "2026-09-27T09:00:00"],
];
const TX_FAMILIES = ["CARS", "BEAUTY", "BOOKS", "CLOTHES", "HARDWARE", "PAINT", "DECOR", "MUSIC", "MACHINES", "TOYS", "FOOTWEAR"];
const UNIT_ORDER = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const SCHEDULED_UNITS = ["123", "140", "142", "112", "134"];
// [Activity Type, Category, [Jul, Aug, Sep, Oct, Nov, Dec]] with the Product Families scheduled in each month
const ACTIVITY_PLAN = [
  ["FA", "F", [["FRUITS"], ["MALL", "GARDEN"], ["SPORTS"], ["FRUITS", "MALL"], ["GARDEN"], ["SPORTS", "FRUITS"]]],
  ["HA", "H", [["OFFICE"], ["WRITING"], ["ZOO", "OFFICE"], ["WRITING"], ["OFFICE", "ZOO"], ["WRITING"]]],
  ["SW", "H", [["PET CARE"], ["GADGETS"], ["COOKWARE", "PET CARE"], ["GADGETS"], ["PET CARE", "COOKWARE"], ["GADGETS"]]],
  ["SW", "T", [["WELLNESS"], ["ART KITS", "BABY"], ["WELLNESS"], ["BABY"], ["ART KITS", "WELLNESS"], ["BABY"]]],
];
// Data preset, chosen on the launcher page before the modal opens:
// "full"  = dummy data everywhere; "empty" = Product Families only, with no Mappings and nothing scheduled.
export const DATA_PRESETS = [
  { value: "full", label: "Dummy data" },
  { value: "empty", label: "No Mapping / Schedule" },
  { value: "faf", label: "FA · F Schedule cleared" },
];
export function initialDb(preset = "full") {
  // "blank" (URL ?data=blank only): no Product Families either, for testing the empty Product Family tab.
  if (preset === "blank") return { ...initialDb("empty"), families: [] };
  // "faf" = dummy data with the Schedule of the FA · F Activity Type row cleared (every month empty).
  if (preset === "faf") {
    const d = initialDb("full");
    return { ...d, activitySchedules: d.activitySchedules.filter((x) => !(x.activityType === "FA" && x.category === "F")) };
  }
  if (preset === "empty") {
    const d = initialDb("full");
    return { ...d, mappings: [], nextMappingId: 1, schedules: [], activitySchedules: [], fixed: {} };
  }
  return {
    families: SEED_FAMILIES.map(([name, products, at]) => ({ name: up(name), products: products.map(up), createdAt: at, updatedAt: at })),
    // A Type O Mapping keeps its own Product Family links per Category (links), so the same Category can sit in several Activity Types independently.
    mappings: [
      {
        id: 1,
        type: "O",
        code: null,
        activityType: "FA",
        category: ["F"],
        links: { "F": ["FRUITS", "MALL", "GARDEN", "SPORTS"] },
        families: ["FRUITS", "MALL", "GARDEN", "SPORTS"],
        createdAt: "2026-09-01T09:00:00",
        updatedAt: "2026-09-01T09:00:00",
      },
      {
        id: 2,
        type: "O",
        code: null,
        activityType: "HA",
        category: ["H"],
        links: { "H": ["OFFICE", "WRITING", "ZOO"] },
        families: ["OFFICE", "WRITING", "ZOO"],
        createdAt: "2026-09-02T09:00:00",
        updatedAt: "2026-09-02T09:00:00",
      },
      {
        id: 3,
        type: "O",
        code: null,
        activityType: "SW",
        category: ["H", "T"],
        links: { "H": ["PET CARE", "GADGETS", "COOKWARE"], "T": ["WELLNESS", "ART KITS", "BABY"] },
        families: ["PET CARE", "GADGETS", "COOKWARE", "WELLNESS", "ART KITS", "BABY"],
        createdAt: "2026-09-03T09:00:00",
        updatedAt: "2026-09-03T09:00:00",
      },
      {
        id: 4,
        type: "T/X",
        code: null,
        activityType: null,
        category: null,
        links: null,
        families: ["CARS", "BEAUTY", "BOOKS", "CLOTHES", "HARDWARE", "PAINT", "DECOR", "MUSIC", "MACHINES", "TOYS", "FOOTWEAR"],
        createdAt: "2026-09-05T10:30:00",
        updatedAt: "2026-09-12T11:00:00",
      },
      {
        id: 5,
        type: "X",
        code: "PREP",
        activityType: "PREP",
        category: null,
        links: null,
        families: ["FOOD"],
        createdAt: "2026-09-08T09:00:00",
        updatedAt: "2026-09-08T09:00:00",
      },
      // O/T/X Codes: not scheduled; each Unit links Products from the FIXED Product Family (the SAVE extras; the FIXED1..7 per Unit are left as they are).
      // Created first, so they sit below the other rows (newest first).
      {
        id: 6,
        type: "O/T/X",
        code: "ABC",
        activityType: "ABC",
        category: null,
        units: ["111", "145"],
        links: { "111": ["SAVE1"], "145": ["SAVE2"] },
        families: [],
        createdAt: "2026-08-28T09:00:00",
        updatedAt: "2026-08-28T09:00:00",
      },
      {
        id: 7,
        type: "O/T/X",
        code: "DEF",
        activityType: "DEF",
        category: null,
        units: ["112", "123"],
        links: { "112": ["SAVE5"], "123": ["SAVE6"] },
        families: [],
        createdAt: "2026-08-29T09:00:00",
        updatedAt: "2026-08-29T09:00:00",
      },
    ],
    nextMappingId: 8,
    // Unit schedule (Type T/X): 5 Units carry Product Families, Jul to Dec 2026. A Unit never repeats a Product Family across its months, and in any month
    // the five Units hold different ones (the six families rotate by Unit). key = "YYYY-M" (0-based month). Some months are left empty on purpose.
    schedules: SCHEDULED_UNITS.flatMap((unit, i) =>
      [6, 7, 8, 9, 10, 11].flatMap((m, j) => ((i + j) % 4 === 3 ? [] : [{ unit, key: `2026-${m}`, family: TX_FAMILIES[(i + j) % TX_FAMILIES.length] }])),
    ),
    // Activity Type schedule (Type O): Product Families per Activity Type + Category per month (one or more per month), Jul to Dec 2026.
    // The same Product Family never sits in two consecutive months of a row.
    activitySchedules: ACTIVITY_PLAN.flatMap(([activityType, category, months]) =>
      months.flatMap((families, j) => families.map((family) => ({ activityType, category, key: `2026-${6 + j}`, family }))),
    ),
    // Fixed per Unit (read-only, does not vary by month): its own Product from the unmapped FIXED Product Family, never shared between Units.
    fixed: Object.fromEntries([...UNITS].sort(UNIT_ORDER).map((unit, i) => [unit, [{ kind: "product", name: up(`Fixed${i + 1}`) }]])), // FIXED1 for the first row (ascending Unit), FIXED2 for the second, ...
    hiddenUnits: [],
    changedMappings: [],
    changedFamilies: [],
    changedUnits: [],
    changedActivityRows: [],
    tabDots: [],
  };
}
