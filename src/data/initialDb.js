import { up } from "../lib/utils";
import { UNITS } from "../constants";

const SEED_FAMILIES = [
  ["Fruit", ["Apple", "Banana", "Orange"], "2026-08-20T09:00:00"],
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
  ["Art Kits", ["Paint", "Canvas", "Brush"], "2026-09-26T14:50:00"],
  // One Product per Unit for the read-only Fixed column; names are unique across all Product Families and Products.
  ["Fixed", UNITS.map((_, i) => `Fixed${String(i + 1).padStart(2, "0")}`), "2026-09-27T09:00:00"],
];
// Data preset, chosen on the launcher page before the modal opens:
// "full"  = dummy data everywhere; "empty" = Product Families only, with no Mappings and nothing scheduled.
export const DATA_PRESETS = [
  { value: "full", label: "Dummy data" },
  { value: "empty", label: "No Mapping / Schedule" },
];
export function initialDb(preset = "full") {
  // "blank" (URL ?data=blank only): no Product Families either, for testing the empty Product Family tab.
  if (preset === "blank") return { ...initialDb("empty"), families: [] };
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
        activityType: "Alpha",
        category: ["Category A", "Category B"],
        links: { "Category A": ["ART KITS", "AUTO", "BABY"], "Category B": ["OFFICE", "PET CARE"] },
        families: ["ART KITS", "AUTO", "BABY", "OFFICE", "PET CARE"],
        createdAt: "2026-09-01T09:00:00",
        updatedAt: "2026-09-01T09:00:00",
      },
      {
        id: 2,
        type: "T/X",
        code: null,
        activityType: null,
        category: null,
        links: null,
        families: ["BEAUTY", "BOOKS", "CLOTHES"],
        createdAt: "2026-09-05T10:30:00",
        updatedAt: "2026-09-12T11:00:00",
      },
      {
        id: 3,
        type: "X",
        code: "PREP",
        activityType: null,
        category: null,
        links: null,
        families: ["FRUIT"],
        createdAt: "2026-09-08T09:00:00",
        updatedAt: "2026-09-08T09:00:00",
      },
    ],
    nextMappingId: 6,
    // Unit schedule: Type T/X Product Family per Unit per month. key = "YYYY-M" (0-based month)
    schedules: [
      { unit: "123A", key: "2026-8", family: "BEAUTY" },
      { unit: "456B", key: "2026-9", family: "BOOKS" },
      { unit: "789C", key: "2026-10", family: "CLOTHES" },
    ],
    // Activity Type schedule: Type O Product Families per Activity Type + Category per month (one or more per month)
    activitySchedules: [
      { activityType: "Alpha", category: "Category A", key: "2026-8", family: "ART KITS" },
      { activityType: "Alpha", category: "Category B", key: "2026-8", family: "PET CARE" },
      { activityType: "Alpha", category: "Category B", key: "2026-9", family: "OFFICE" },
      { activityType: "Alpha", category: "Category A", key: "2026-10", family: "AUTO" },
    ],
    // Fixed per Unit (read-only, does not vary by month): its own Product from the unmapped FIXED Product Family, never shared between Units.
    fixed: Object.fromEntries(UNITS.map((unit, i) => [unit, [{ kind: "product", name: up(`Fixed${String(i + 1).padStart(2, "0")}`) }]])),
    hiddenUnits: [],
    changedMappings: [],
    changedFamilies: [],
    changedUnits: [],
    changedActivityRows: [],
    tabDots: [],
  };
}
