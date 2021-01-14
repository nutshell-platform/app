// This file governs the ncu utility that does auto upgrades
module.exports = {
  // "upgrade": false,
  "reject": [
    "history", // History of router v5 is nto yet compatible with history v5
    "react", // Managed by expo
    "react-dom", // Managed by expo
    "react-native", // Managed by expo
    "react-native-web", // managed by expo
  ]
}