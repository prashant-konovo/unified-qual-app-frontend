export type RewardStatus = "Credited" | "Not Credited";

export interface Interview {
  account: string;
  client: string;
  date: string;
  duration: string;
  id: string;
  meetingLink?: string;
  moderator: string;
  participantId: string;
  participantName: string;
  project: string;
  rewardPoints: number;
  rewardStatus: RewardStatus;
  status: "Upcoming" | "Completed" | "Invalidated";
  timeRange: string;
  title: string;
  topic: string;
}
