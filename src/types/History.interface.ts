// Generated by https://quicktype.io
export interface HistoryArchive extends Array<HistoryObject> {}

export interface HistoryObject {
  grossAmount: number;
  currentAmount: number;
  totalYield: number;
  dailyYield: number;
  timestamp: number;
}