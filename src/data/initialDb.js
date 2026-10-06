import { up } from "../lib/utils";

const SEED_FAMILIES = [
  ["Fruit", ["Apple", "Banana", "Orange"], "2026-08-20T09:00:00"],
  ["Machines", ["Lathe", "Drill Press"], "2026-08-25T11:00:00"],
  [
    "Gadgets",
    ["Radio", "Battery", "Charger", "Speaker", "Headphones", "Cable", "Adapter", "Power Bank", "Router", "Modem"],
    "2026-09-02T14:00:00",
  ],
  ["Prep Kit", ["Prep Ration Pack"], "2026-09-08T10:00:00"],
  ["Writing", ["Pen", "Notebook", "Highlighter"], "2026-09-18T09:30:00"],
  ["Toys", ["Puzzle", "Building Blocks", "Action Figure"], "2026-09-12T10:00:00"],
  ["Decor", ["Chair", "Desk", "Lamp"], "2026-09-22T15:20:00"],
  ["Beauty", ["Shampoo", "Lotion", "Perfume"], "2026-09-14T11:30:00"],
  ["Sports", ["Football", "Tennis Racket", "Yoga Mat"], "2026-09-16T13:00:00"],
  ["Books", ["Novel", "Textbook", "Comic"], "2026-09-19T15:45:00"],
  [
    "Food",
    [
      "Rice",
      "Flour",
      "Sugar",
      "Salt",
      "Cooking Oil",
      "Pasta",
      "Canned Beans",
      "Cereal",
      "Milk",
      "Eggs",
      "Bread",
      "Butter",
      "Cheese",
      "Yogurt",
      "Coffee",
      "Tea",
      "Honey",
      "Peanut Butter",
      "Jam",
      "Spices",
    ],
    "2026-09-11T08:40:00",
  ],
  ["Hardware", ["Hammer", "Screwdriver", "Wrench", "Nails", "Screws"], "2026-09-13T09:15:00"],
  ["Clothes", ["T-Shirt", "Jeans", "Jacket", "Socks"], "2026-09-06T10:05:00"],
  ["Footwear", ["Sneakers", "Boots", "Sandals"], "2026-09-07T14:20:00"],
  ["Cookware", ["Pot", "Pan", "Knife Set", "Cutting Board"], "2026-09-09T11:10:00"],
  ["Garden", ["Shovel", "Watering Can", "Plant Pot"], "2026-09-17T13:35:00"],
  ["Auto", ["Motor Oil", "Wiper Blades", "Car Battery"], "2026-09-21T09:50:00"],
  ["Pet Care", ["Dog Food", "Cat Litter", "Pet Leash"], "2026-09-03T15:00:00"],
  ["Office", ["Stapler", "Paper Clips", "Folder"], "2026-09-04T10:45:00"],
  ["Wellness", ["Vitamins", "First Aid Kit", "Thermometer"], "2026-09-23T08:25:00"],
  ["Baby", ["Diapers", "Baby Wipes", "Baby Formula"], "2026-09-24T09:05:00"],
  ["Music", ["Guitar", "Keyboard", "Drum Sticks"], "2026-09-25T12:15:00"],
  ["Art Kits", ["Paint Set", "Canvas", "Brushes"], "2026-09-26T14:50:00"],
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
    return { ...d, mappings: [], nextMappingId: 1, schedules: [], projectSchedules: [], fixed: {} };
  }
  return {
    families: SEED_FAMILIES.map(([name, products, at]) => ({ name: up(name), products: products.map(up), createdAt: at, updatedAt: at })),
    // A Cycle O Mapping keeps its own Product Family links per Personnel (links), so the same Personnel can sit in several Project Types independently.
    mappings: [
      {
        id: 1,
        cycle: "O",
        code: null,
        projectType: "Alpha",
        personnel: ["Category A", "Category B"],
        links: { "Category A": ["FRUIT"], "Category B": ["GADGETS"] },
        families: ["FRUIT", "GADGETS"],
        createdAt: "2026-09-01T09:00:00",
        updatedAt: "2026-09-01T09:00:00",
      },
      {
        id: 2,
        cycle: "T",
        code: null,
        projectType: null,
        personnel: null,
        links: null,
        families: ["MACHINES", "WRITING"],
        createdAt: "2026-09-05T10:30:00",
        updatedAt: "2026-09-05T10:30:00",
      },
      {
        id: 3,
        cycle: "X",
        code: "PREP",
        projectType: null,
        personnel: null,
        links: null,
        families: ["PREP KIT"],
        createdAt: "2026-09-10T08:15:00",
        updatedAt: "2026-09-10T08:15:00",
      },
      {
        id: 4,
        cycle: "X",
        code: null,
        projectType: null,
        personnel: null,
        links: null,
        families: ["TOYS", "SPORTS", "BOOKS"],
        createdAt: "2026-09-12T11:00:00",
        updatedAt: "2026-09-12T11:00:00",
      },
      {
        id: 5,
        cycle: "O",
        code: null,
        projectType: "Bravo",
        personnel: ["Category A", "Category C"],
        links: { "Category A": ["FOOD"], "Category C": ["BEAUTY"] },
        families: ["FOOD", "BEAUTY"],
        createdAt: "2026-09-14T09:00:00",
        updatedAt: "2026-09-14T09:00:00",
      },
    ],
    nextMappingId: 6,
    // Household schedule: Cycle T Product Family per Household per month. key = "YYYY-M" (0-based month)
    schedules: [
      { household: "123A", key: "2026-8", family: "MACHINES" },
      { household: "456B", key: "2026-9", family: "WRITING" },
      { household: "789C", key: "2026-10", family: "MACHINES" },
    ],
    // Project Type schedule: Cycle O Product Families per Project Type + Personnel per month (one or more per month)
    projectSchedules: [
      { projectType: "Alpha", personnel: "Category A", key: "2026-8", family: "FRUIT" },
      { projectType: "Alpha", personnel: "Category B", key: "2026-8", family: "GADGETS" },
      { projectType: "Alpha", personnel: "Category B", key: "2026-9", family: "GADGETS" },
      { projectType: "Bravo", personnel: "Category A", key: "2026-10", family: "FOOD" },
    ],
    // Fixed per Household (does not vary by month): a Product Family (chip) or a Product (plain text) that is not mapped to Cycle O or T.
    fixed: {
      "123A": [{ kind: "product", name: "HAMMER" }],
      "456B": [{ kind: "family", name: "CLOTHES" }],
    },
    hiddenHouseholds: [],
    changedMappings: [],
    changedFamilies: [],
    changedHouseholds: [],
    changedProjectRows: [],
    tabDots: [],
  };
}
