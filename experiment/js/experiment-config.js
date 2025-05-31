// Experiment Configuration
const EXPERIMENT_CONFIG = {
  // Number of trials in the experiment
  totalTrials: 30, // Using 30 trials for the experiment
  
  // DataPipe experiment ID
  dataPipeId: "MQLEEvIblJiX", // KEEP THIS THE SAME
  
  // Talker metadata (useful for analysis)
  talkerMetadata: {
    "ZHAA": { gender: "F", language: "Arabic" },
    "BWC": { gender: "M", language: "Mandarin" },
    "LXC": { gender: "F", language: "Mandarin" },
    "NCC": { gender: "F", language: "Mandarin" },
    "ASI": { gender: "M", language: "Hindi" },
    "RRBI": { gender: "M", language: "Hindi" },
    "TNI": { gender: "F", language: "Hindi" },
    "HJK": { gender: "F", language: "Korean" },
    "YKWK": { gender: "M", language: "Korean" },
    "EBVS": { gender: "M", language: "Spanish" },
    "ERMS": { gender: "M", language: "Spanish" },
    "MBMPS": { gender: "F", language: "Spanish" },
    "NJS": { gender: "F", language: "Spanish" },
    "HQTV": { gender: "M", language: "Vietnamese" },
    "PNV": { gender: "F", language: "Vietnamese" }
  },
  
  // DataPipe API Configuration
  dataPipe: {
    apiUrl: 'https://pipe.jspsych.org/api/data/',
    conditionApiUrl: 'https://pipe.jspsych.org/api/condition/'
  },
  
  // Condition names mapping (for DataPipe condition assignment)
  conditionNames: {
    0: "single-talker",
    1: "multi-talker-same",
    2: "multi-talker-different",
    3: "multi-talker-random-other"
  }
};

// ——— Experiment Parameters ———
const AVAILABLE_TRANSCRIPTS_COUNT = 30; // Changed from 35 to 34
const TRIAL_COUNT = 30;       
const ATTENTION_CHECK_COUNT = 2; 

// ——— Speaker List ———
const SPEAKERS = [
  "ZHAA","BWC","LXC","NCC","ASI","RRBI","TNI","HJK","YKWK",
  "EBVS","ERMS","MBMPS","NJS","HQTV","PNV"
];

// ——— GitHub Repository URLs ———
const GITHUB_BASE_RAW = 'https://raw.githubusercontent.com/Nathan-Roll1/PerceptualAdaptation/main/';
const AUDIO_BASE = GITHUB_BASE_RAW + 'audio/'; 
const TEXT_JSON_BASE = GITHUB_BASE_RAW + 'text/'; 
const STATIC_AUDIO_BASE = GITHUB_BASE_RAW + 'static_audio/'; 

// Practice (pre-experiment) files:
// Hard-coded sentence data for practice trials
const PRACTICE_STIMULI_INFO = [
  {
    audio: STATIC_AUDIO_BASE + 'hippos_practice.mp3',
    id: 'hippos_practice',
    sentence_data: {
        original_sentence: "Wandering hippos shed their belongings.",
        blanked_sentence: "Wandering hippos shed ____.",
        actual: "their belongings"
    }
  },
  {
    audio: STATIC_AUDIO_BASE + 'crime_practice.mp3',
    id: 'crime_practice',
    sentence_data: {
        original_sentence: "I can't remember the last time I ate a granola bar.",
        blanked_sentence: "I can't remember the last ____ I ate a granola bar.",
        actual: "crime"
    }
  }
];

// Attention-check files:
// Hard-coded sentence data for attention checks
const ATTENTION_STIMULI_INFO = [
  {
    audio: STATIC_AUDIO_BASE + 'attention_cat.mp3',
    id: 'attention_A',
    sentence_data: {
        original_sentence: "ATTENTION_CAT", // Example
        blanked_sentence: "Despite his eager grin, the ____ fell asleep.",
        actual: "cat" // The word they should type
    }
  },
  {
    audio: STATIC_AUDIO_BASE + 'attention_rebel.mp3',
    id: 'attention_B',
    sentence_data: {
        original_sentence: "ATTENTION_REBEL", // Example
        blanked_sentence: "The ____ ate the last granola bar.",
        actual: "rebel"
    }
  }
];