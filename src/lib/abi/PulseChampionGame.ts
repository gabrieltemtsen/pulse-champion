export const PulseChampionGameAbi = [
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "currentRoundId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "roundActive", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "getCurrentRound", stateMutability: "view", inputs: [], outputs: [
    { type: "tuple", components: [
      { type: "uint256", name: "id" },
      { type: "uint64", name: "startTime" },
      { type: "uint64", name: "endTime" },
      { type: "uint256", name: "prizePool" },
      { type: "address[3]", name: "topPlayers" },
      { type: "uint256[3]", name: "topScores" },
      { type: "bool", name: "settled" },
      { type: "uint256", name: "totalPlayers" },
    ]}
  ] },
  { type: "function", name: "getRound", stateMutability: "view", inputs: [{ type: "uint256", name: "id" }], outputs: [
    { type: "tuple", components: [
      { type: "uint256", name: "id" },
      { type: "uint64", name: "startTime" },
      { type: "uint64", name: "endTime" },
      { type: "uint256", name: "prizePool" },
      { type: "address[3]", name: "topPlayers" },
      { type: "uint256[3]", name: "topScores" },
      { type: "bool", name: "settled" },
      { type: "uint256", name: "totalPlayers" },
    ]}
  ] },
  { type: "function", name: "getTop3", stateMutability: "view", inputs: [{ type: "uint256", name: "id" }], outputs: [ { type: "address[3]" }, { type: "uint256[3]" } ] },
  { type: "function", name: "totalScores", stateMutability: "view", inputs: [{ type: "uint256" }, { type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "lastWorkedHour", stateMutability: "view", inputs: [{ type: "uint256" }, { type: "address" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "startRound", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "fundCurrentRound", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "work", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "settleRound", stateMutability: "nonpayable", inputs: [{ type: "uint256", name: "id" }], outputs: [] },
] as const;
