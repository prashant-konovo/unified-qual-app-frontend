export interface CrowdAttribute {
  choices: string[];
  id: string;
  name: string;
}

export interface Crowd {
  attributes: CrowdAttribute[];
  country: string;
  description: string;
  expectedCompletes: number;
  id: string;
  members: number;
  name: string;
  panels: string[];
  professions: string[];
  specialties: string[];
  subscription: string;
  type: "Profile" | "Custom" | "Employee";
}

export const mockCrowds: Crowd[] = [
  {
    id: "crwd_01HX",
    name: "Enterprise IT Decision Makers",
    description: "Senior IT leaders at companies with 1000+ employees",
    members: 1450,
    expectedCompletes: 300,
    subscription: "Acme Global (Enterprise)",
    type: "Profile",
    country: "US",
    professions: ["IT Management", "CTO", "CIO"],
    specialties: ["Cloud Infrastructure", "Cybersecurity"],
    panels: ["Tech Base"],
    attributes: [
      { id: "attr_1", name: "Company Size", choices: ["1000-5000", "5000+"] },
      { id: "attr_2", name: "Budget Authority", choices: ["Yes"] },
    ],
  },
  {
    id: "crwd_02PQ",
    name: "Beta Testers - New Dashboard",
    description: "Internal employees signed up for Q2 beta program",
    members: 85,
    expectedCompletes: 85,
    subscription: "Internal Research (Pro)",
    type: "Employee",
    country: "Global",
    professions: ["All"],
    specialties: ["All"],
    panels: ["Internal R&D"],
    attributes: [
      {
        id: "attr_3",
        name: "Department",
        choices: ["Engineering", "Product", "Design"],
      },
    ],
  },
  {
    id: "crwd_03ZL",
    name: "Millennial Retail Shoppers",
    description: "Frequent online shoppers aged 25-40 in Europe",
    members: 12_400,
    expectedCompletes: 1500,
    subscription: "Globex EU (Growth)",
    type: "Custom",
    country: "EU",
    professions: ["Any"],
    specialties: ["Any"],
    panels: ["Consumer Consumer Panel"],
    attributes: [
      { id: "attr_4", name: "Age", choices: ["25-30", "31-40"] },
      {
        id: "attr_5",
        name: "Shopping Frequency",
        choices: ["Weekly", "Daily"],
      },
    ],
  },
  {
    id: "crwd_04BN",
    name: "Healthcare Administrators",
    description: "Hospital admin staff managing procurement",
    members: 520,
    expectedCompletes: 120,
    subscription: "MedTech Innovations (Enterprise)",
    type: "Profile",
    country: "US",
    professions: ["Healthcare Administration"],
    specialties: ["Procurement", "Operations"],
    panels: ["Healthcare Network"],
    attributes: [
      { id: "attr_6", name: "Facility Type", choices: ["Hospital", "Clinic"] },
    ],
  },
];
