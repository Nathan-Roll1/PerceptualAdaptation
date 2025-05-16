// Experiment Configuration
const EXPERIMENT_CONFIG = {
  // Number of trials in the experiment
  totalTrials: 10, // Change to 60 for the full experiment
  
  // DataPipe experiment ID
  dataPipeId: "MQLEEvIblJiX",
  
  // Audio file paths for single-talker condition (organized by talker)
  singleTalkerFiles: [
    // Talker 005 (repeat files to reach totalTrials)
    [
      "audio/ALL_005_M_CMN_25.0_1.wav",
      "audio/ALL_005_M_CMN_25.0_2.wav",
      "audio/ALL_005_M_CMN_25.0_3.wav",
      "audio/ALL_005_M_CMN_25.0_1.wav",
      "audio/ALL_005_M_CMN_25.0_2.wav",
      "audio/ALL_005_M_CMN_25.0_3.wav",
      "audio/ALL_005_M_CMN_25.0_1.wav",
      "audio/ALL_005_M_CMN_25.0_2.wav",
      "audio/ALL_005_M_CMN_25.0_3.wav",
      "audio/ALL_005_M_CMN_25.0_1.wav",
    ],
    // Talker 011
    [
      "audio/ALL_011_F_CMN_21.0_1.wav",
      "audio/ALL_011_F_CMN_21.0_2.wav",
      "audio/ALL_011_F_CMN_21.0_3.wav",
      "audio/ALL_011_F_CMN_21.0_1.wav",
      "audio/ALL_011_F_CMN_21.0_2.wav",
      "audio/ALL_011_F_CMN_21.0_3.wav",
      "audio/ALL_011_F_CMN_21.0_1.wav",
      "audio/ALL_011_F_CMN_21.0_2.wav",
      "audio/ALL_011_F_CMN_21.0_3.wav",
      "audio/ALL_011_F_CMN_21.0_1.wav",
    ],
    // Talker 012
    [
      "audio/ALL_012_M_CMN_22.0_1.wav",
      "audio/ALL_012_M_CMN_22.0_2.wav",
      "audio/ALL_012_M_CMN_22.0_3.wav",
      "audio/ALL_012_M_CMN_22.0_1.wav",
      "audio/ALL_012_M_CMN_22.0_2.wav",
      "audio/ALL_012_M_CMN_22.0_3.wav",
      "audio/ALL_012_M_CMN_22.0_1.wav",
      "audio/ALL_012_M_CMN_22.0_2.wav",
      "audio/ALL_012_M_CMN_22.0_3.wav",
      "audio/ALL_012_M_CMN_22.0_1.wav",
    ],
    // Talker 016
    [
      "audio/ALL_016_M_CMN_22.0_1.wav",
      "audio/ALL_016_M_CMN_22.0_2.wav",
      "audio/ALL_016_M_CMN_22.0_3.wav",
      "audio/ALL_016_M_CMN_22.0_1.wav",
      "audio/ALL_016_M_CMN_22.0_2.wav",
      "audio/ALL_016_M_CMN_22.0_3.wav",
      "audio/ALL_016_M_CMN_22.0_1.wav",
      "audio/ALL_016_M_CMN_22.0_2.wav",
      "audio/ALL_016_M_CMN_22.0_3.wav",
      "audio/ALL_016_M_CMN_22.0_1.wav",
    ],
    // Talker 020
    [
      "audio/ALL_020_M_CMN_22.0_1.wav",
      "audio/ALL_020_M_CMN_22.0_2.wav",
      "audio/ALL_020_M_CMN_22.0_3.wav",
      "audio/ALL_020_M_CMN_22.0_1.wav",
      "audio/ALL_020_M_CMN_22.0_2.wav",
      "audio/ALL_020_M_CMN_22.0_3.wav",
      "audio/ALL_020_M_CMN_22.0_1.wav",
      "audio/ALL_020_M_CMN_22.0_2.wav",
      "audio/ALL_020_M_CMN_22.0_3.wav",
      "audio/ALL_020_M_CMN_22.0_1.wav",
    ],
    // Talker 030
    [
      "audio/ALL_030_F_CMN_23.0_1.wav",
      "audio/ALL_030_F_CMN_23.0_2.wav",
      "audio/ALL_030_F_CMN_23.0_3.wav",
      "audio/ALL_030_F_CMN_23.0_1.wav",
      "audio/ALL_030_F_CMN_23.0_2.wav",
      "audio/ALL_030_F_CMN_23.0_3.wav",
      "audio/ALL_030_F_CMN_23.0_1.wav",
      "audio/ALL_030_F_CMN_23.0_2.wav",
      "audio/ALL_030_F_CMN_23.0_3.wav",
      "audio/ALL_030_F_CMN_23.0_1.wav",
    ],
    // Talker 033
    [
      "audio/ALL_033_M_CMN_25.0_1.wav",
      "audio/ALL_033_M_CMN_25.0_2.wav",
      "audio/ALL_033_M_CMN_25.0_3.wav",
      "audio/ALL_033_M_CMN_25.0_1.wav",
      "audio/ALL_033_M_CMN_25.0_2.wav",
      "audio/ALL_033_M_CMN_25.0_3.wav",
      "audio/ALL_033_M_CMN_25.0_1.wav",
      "audio/ALL_033_M_CMN_25.0_2.wav",
      "audio/ALL_033_M_CMN_25.0_3.wav",
      "audio/ALL_033_M_CMN_25.0_1.wav",
    ]
  ],
  
  // Audio file paths for multiple-talker condition (distributed evenly across talkers)
  multipleTalkerFiles: [
    // Mix of different talkers
    "audio/ALL_005_M_CMN_25.0_1.wav",
    "audio/ALL_011_F_CMN_21.0_1.wav",
    "audio/ALL_012_M_CMN_22.0_1.wav",
    "audio/ALL_016_M_CMN_22.0_1.wav",
    "audio/ALL_020_M_CMN_22.0_1.wav",
    "audio/ALL_030_F_CMN_23.0_1.wav",
    "audio/ALL_033_M_CMN_25.0_1.wav",
    "audio/ALL_005_M_CMN_25.0_2.wav",
    "audio/ALL_011_F_CMN_21.0_2.wav",
    "audio/ALL_012_M_CMN_22.0_2.wav",
  ],
  
  // Talker metadata (useful for analysis)
  talkerMetadata: {
    "005": { gender: "M", language: "CMN", age: 25 },
    "011": { gender: "F", language: "CMN", age: 21 },
    "012": { gender: "M", language: "CMN", age: 22 },
    "016": { gender: "M", language: "CMN", age: 22 },
    "020": { gender: "M", language: "CMN", age: 22 },
    "030": { gender: "F", language: "CMN", age: 23 },
    "033": { gender: "M", language: "CMN", age: 25 }
  },
  
  // DataPipe API Configuration
  dataPipe: {
    apiUrl: 'https://pipe.jspsych.org/api/data/'
  }
};