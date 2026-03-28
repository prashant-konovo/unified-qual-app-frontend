export interface CalendarEvent {
  end: string;
  id: string;
  meetingLink?: string;
  moderator: string;
  /** Backend ObjectID – present for persisted events, undefined for in-flight local events. */
  moderatorId?: string;
  participant?: string;
  project?: string;
  start: string; // ISO datetime e.g. "2026-03-12T08:45"
  type: "availability" | "interview";
}

export const TIMEZONES = [
  { label: "IST (UTC+5:30)", value: "Asia/Kolkata" },
  { label: "EST (UTC-5)", value: "America/New_York" },
  { label: "PST (UTC-8)", value: "America/Los_Angeles" },
  { label: "GMT (UTC+0)", value: "Europe/London" },
  { label: "CET (UTC+1)", value: "Europe/Berlin" },
  { label: "AEST (UTC+10)", value: "Australia/Sydney" },
];
