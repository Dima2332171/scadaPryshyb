export interface requestData {
  date: string,
  data: [requestTimeBlock]
}

export interface requestTimeBlock {
  startTime?: any,
  endTime?: any,

  priorityGrid?: boolean,
  chargeFromGrid?: number,
  dischargeToGrid?: number,

  imbalances?: boolean,

  priorityPv?: boolean,
  pv?: number,

  priorityBess?: boolean,
  bess1Charge?: number,
  bess1Discharge?: number,
  bess2Charge?: number,
  bess2Discharge?: number,
}

