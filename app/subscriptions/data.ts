export interface Subscription {
  aeConsent: boolean;
  aeReporting: string;
  businessType: string;
  company: string;
  createdAt: string;
  csUser: string;
  currency: string;
  id: string;
  markets: string[];
  panels: string[];
  phone: string;
  plan: string;
  pmContact: string;
  salesContact: string;
  salesforceAccount: string;
  serviceType: string;
  shortCode: string;
  skipSfValidation: boolean;
}

export const mockSubscriptions: Subscription[] = [
  {
    id: "sub_1",
    company: "Acme Corp",
    shortCode: "ACM",
    plan: "Enterprise",
    currency: "USD",
    phone: "+1 555-0192",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    salesforceAccount: "Acme Global",
    markets: ["US", "CA"],
    panels: ["Tech", "Finance"],
    csUser: "Sarah Jenkins",
    salesContact: "Mike Ross",
    pmContact: "Alex Vance",
    serviceType: "Full Service",
    businessType: "B2B",
    aeReporting: "Quarterly",
    aeConsent: true,
    skipSfValidation: false,
  },
  {
    id: "sub_2",
    company: "Globex Industries",
    shortCode: "GLB",
    plan: "Growth",
    currency: "EUR",
    phone: "+44 20 7123 4567",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    salesforceAccount: "Globex EU",
    markets: ["UK", "DE"],
    panels: ["Healthcare"],
    csUser: "Tom Hanks",
    salesContact: "Jane Doe",
    pmContact: "Chris Evans",
    serviceType: "Self Serve",
    businessType: "B2C",
    aeReporting: "Monthly",
    aeConsent: false,
    skipSfValidation: true,
  },
  {
    id: "sub_3",
    company: "Initech",
    shortCode: "INI",
    plan: "Pro",
    currency: "USD",
    phone: "+1 555-9876",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    salesforceAccount: "Initech LLC",
    markets: ["US"],
    panels: ["Software"],
    csUser: "Peter Gibbons",
    salesContact: "Bill Lumbergh",
    pmContact: "Michael Bolton",
    serviceType: "Full Service",
    businessType: "B2B",
    aeReporting: "Annually",
    aeConsent: true,
    skipSfValidation: false,
  },
];
