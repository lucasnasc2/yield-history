export interface HistoryArchive extends Array<HistoryObject> {}

export interface HistoryObject {
  /** Gross amount */
  gross: number;
  /** Current amount */
  am: number;
  /** Total yield sum */
  ty: number;
  /** Daily yield */
  dy: number;
  /** Creation in utc timestamp */
  ts: number;
}

export interface DepositArchive extends Array<DepositObject> {}

export interface DepositObject {
  /** Deposit amount */
  am: number;
  /** Payout start date in utc timestamp */
  s: number;
  /** Deposit creation date in utc timestamp */
  ts: number;
  /** Payout state of the deposit */
  b: Boolean;
}
