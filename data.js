// data.js
window.DashboardData = {
  hostels: [
    { name: "Ruby Hostel", usage: 93000, saved: 18.2, score: 92 },
    { name: "Emerald Hostel", usage: 101000, saved: -18, score: 65, warning: true },
    { name: "Sapphire Hostel", usage: 76000, saved: 15.7, score: 88 },
    { name: "Diamond Hostel", usage: 85000, saved: 8.4, score: 78 },
    { name: "Pearl Hostel", usage: 69000, saved: 10.6, score: 82 }
  ],
  blocks: [
    { name: "AS Block", usage: 52000, saved: 11.8, score: 85 },
    { name: "IB Block", usage: 47000, saved: 9.2, score: 81 },
    { name: "Learning Center", usage: 68000, saved: 5.4, score: 75 },
    { name: "Mechanical Block", usage: 61000, saved: -12, score: 58, warning: true },
    { name: "Sunflower Block", usage: 43000, saved: 14.1, score: 89 },
    { name: "Research Block", usage: 39000, saved: 13.9, score: 91 }
  ],
  kpis: {
    totalUsage: "781,000",
    totalUsageTrend: -8.4,
    waterSaved: "142,500",
    waterSavedTrend: 12.6,
    efficiencyScore: 87,
    monitoredLocations: 11,
    hostelCount: 5,
    blockCount: 6
  },
  sustainability: {
    goal: 20,
    current: 14.2,
    remaining: 5.8
  }
};
