// Shuffle helper function
function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

// Random choice helper
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Enhanced audio loading constants
const MAX_AUDIO_RETRIES = 3;
const AUDIO_RETRY_DELAY = 1000; // 1 second between retries
const MAX_AUDIO_LOAD_TIME = 10000; // 10 seconds max to load audio
const FALLBACK_TIMER_DELAY = 8000; // 8 seconds before allowing skip (reduced from 15)

// Simple audio playback using HTML5 Audio (no Web Audio API)
function loadAndPlayAudio(audioSrc, onPlay, onEnded) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioSrc);
    let playAttempted = false;
    let hasEnded = false;
    
    // Set a timeout for the entire operation
    const timeout = setTimeout(() => {
      audio.pause();
      audio.src = '';
      reject(new Error('Audio operation timeout'));
    }, MAX_AUDIO_LOAD_TIME);
    
    // Handle successful play
    const handlePlay = () => {
      if (!playAttempted) {
        playAttempted = true;
        if (onPlay) onPlay();
      }
    };
    
    // Handle audio end
    const handleEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        clearTimeout(timeout);
        if (onEnded) onEnded();
        resolve();
      }
    };
    
    // Handle errors
    const handleError = (error) => {
      clearTimeout(timeout);
      audio.pause();
      audio.src = '';
      reject(error || new Error('Audio playback failed'));
    };
    
    // Set up event listeners
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('error', (e) => handleError(new Error('Audio error: ' + (audio.error?.message || 'Unknown'))));
    
    // Attempt to play
    audio.play()
      .then(() => {
        console.log('Audio play() promise resolved for:', audioSrc);
      })
      .catch(error => {
        handleError(new Error('Play failed: ' + error.message));
      });
  });
}

// Enhanced audio loading with retry logic
async function loadAndPlayAudioWithRetry(audioSrc, onPlay, onEnded, retryCount = 0) {
  try {
    await loadAndPlayAudio(audioSrc, onPlay, onEnded);
  } catch (error) {
    if (retryCount < MAX_AUDIO_RETRIES) {
      console.warn(`Audio load failed (attempt ${retryCount + 1}/${MAX_AUDIO_RETRIES}), retrying...`, error);
      await new Promise(resolve => setTimeout(resolve, AUDIO_RETRY_DELAY));
      return loadAndPlayAudioWithRetry(audioSrc, onPlay, onEnded, retryCount + 1);
    } else {
      throw error;
    }
  }
}

// Timer helper functions
const FULL_ARC = 283;                   // 2πr
function setTimerColor(t) {             // t in sec
  const displayTime = Math.max(0, t); // Don't use negative values for color calculation
  const hue = 220 - (220-0)*(1-displayTime/15);   // blue→red (changed from /11 to /15)
  document.documentElement.style.setProperty('--timer-color', `hsl(${hue},80%,50%)`);
}

function updateTimerDisplay(t, timerElements) {
  const { donutSegment, timerTextEl, timerSrTextEl } = timerElements;
  const displayTime = Math.max(0, t); // Don't show negative numbers
  if (donutSegment) donutSegment.style.strokeDashoffset = FULL_ARC*(1-displayTime/15); // changed from /11 to /15
  if (timerTextEl) timerTextEl.textContent = displayTime;
  setTimerColor(displayTime);
  updateScreenReaderTimer(displayTime, timerSrTextEl);
}

function updateScreenReaderTimer(seconds, srTextElement) {
  if (srTextElement) {
    srTextElement.textContent = `${seconds} seconds remaining`;
  }
}

// Function to load sentence JSON data (blanked_sentence, actual content) for MAIN TRIALS
async function loadSentenceJson(jsonUrl) {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${jsonUrl}: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || typeof data.original_sentence !== 'string') {
        console.warn('Invalid sentence JSON structure from:', jsonUrl, data);
        return {
            original_sentence: "Error loading sentence.",
            error: true
        };
    }
    return data;
  } catch (error) {
    console.error('Error loading sentence JSON:', jsonUrl, error);
    return {
        original_sentence: "Error loading sentence.",
        error: true
    };
  }
}

function groupSpeakersByBackground() {
  const groups = {};
  Object.entries(EXPERIMENT_CONFIG.talkerMetadata).forEach(([code, meta]) => {
    const bg = meta.language; 
    groups[bg] ??= [];
    groups[bg].push(code);
  });
  return groups;
}

function normalizeString(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,""); 
}

function parseAudioFilename(audioUrl) {
  const filename = audioUrl.split('/').pop(); 
  const parts = filename.replace(/\.(wav|mp3)$/i, '').split('_');
  
  if (parts.length >= 2 && SPEAKERS.includes(parts[0].toUpperCase())) { 
    const speaker = parts[0];
    const transcriptId = parts[1];
    return { speaker, transcriptId, type: 'main' };
  } else if (parts.length === 2 && parts[0].toLowerCase() === 'attention') { 
    return { speaker: null, transcriptId: parts[1], type: 'attention', attentionId: filename.replace(/\.(wav|mp3)$/i, '') };
  } else if (parts.length === 1 && (filename.includes('enchilada') || filename.includes('reindeer'))) { 
     return { speaker: null, transcriptId: filename.replace(/\.(wav|mp3)$/i, ''), type: 'practice' };
  }
  console.warn("Could not parse filename:", filename);
  return null;
}

let practiceStimuliData = [];

async function loadPracticeStimuliData() {
  practiceStimuliData = PRACTICE_STIMULI_INFO.map(info => ({
    audio: info.audio,
    id: info.id,
    sentence_data: info.sentence_data 
  }));
  console.log('Loaded practice stimuli data from config:', practiceStimuliData);
}

// NEW: Function to show strike warning
function showStrikeWarning(strikeType, strikesRemaining) {
  console.log(`Showing strike warning: ${strikeType}, ${strikesRemaining} strikes remaining`);
  
  const strikeWarning = document.createElement('div');
  strikeWarning.className = 'strike-warning';
  strikeWarning.innerHTML = `
    <div class="strike-icon">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <div class="strike-message">
      <strong>${strikeType}</strong><br>
      ${strikesRemaining === 1 ? 'You have one more strike left.' : strikesRemaining === 0 ? 'No strikes remaining!' : 'You have ' + strikesRemaining + ' more strikes left.'}
    </div>
  `;
  
  // Add to the body as a fixed overlay
  document.body.appendChild(strikeWarning);
  
  // Animate in
  setTimeout(() => strikeWarning.classList.add('show'), 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    strikeWarning.classList.remove('show');
    setTimeout(() => strikeWarning.remove(), 500);
  }, 3000);
  
  // Return a promise that resolves when the warning is done
  return new Promise(resolve => {
    setTimeout(resolve, 3500); // 3 seconds display + 0.5 seconds fade out
  });
}

const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const practiceScreen = document.getElementById('practice-screen');
const practiceCompleteScreen = document.getElementById('practice-complete-screen');
const trialScreen = document.getElementById('trial-screen');
const exitSurveyScreen = document.getElementById('exit-survey-screen');
const scoreScreen = document.getElementById('score-screen');
const completionScreen = document.getElementById('completion-screen');
const paymentScreen = document.getElementById('payment-screen');
const terminationScreen = document.getElementById('termination-screen');

const startButton = document.getElementById('start-button');
const practiceButton = document.getElementById('practice-button');
const continueToExperimentButton = document.getElementById('continue-to-experiment-button');
const nextButton = document.getElementById('next-button');
const submitSurveyButton = document.getElementById('submit-survey-button');
const paymentButton = document.getElementById('payment-button'); 
const exitButton = document.getElementById('exit-button'); 

const currentTrialSpan = document.getElementById('current-trial');
const totalTrialsSpan = document.getElementById('total-trials');
const progressBar = document.getElementById('progress-bar');
const blankedSentenceDisplay = document.getElementById('blanked-sentence-display');
const typedResponseInput = document.getElementById('typed-response-input');
const audioIndicator = document.getElementById('audio-indicator');
const audioStatus = document.getElementById('audio-status');
const trialFeedback = document.getElementById('trial-feedback'); 

const practiceCurrentTrialSpan = document.getElementById('practice-current-trial');

const timerSvg = document.getElementById('timer-svg');
const donutSegment = document.getElementById('donut-segment');
const timerText = document.getElementById('timer-text');
const timerSrText = document.getElementById('timer-sr-text');
const mainTimerElements = { donutSegment, timerTextEl: timerText, timerSrTextEl: timerSrText };

const headphoneWarning = document.getElementById('headphone-warning');
const browserWarning = document.getElementById('browser-warning');

const firstLanguageInput = document.getElementById('first-language');
const englishLearningTimeContainer = document.getElementById('english-learning-time-container');
const englishLearningTimeInput = document.getElementById('english-learning-time');
const englishLearningCountryInput = document.getElementById('english-learning-country');
const otherLanguagesInput = document.getElementById('other-languages-input');

let activeTimer = null;
let timerShouldStop = false; // Flag to prevent timer race conditions

let experimentState = {
  participantId: null,
  condition: null,
  // Speaker assignments for different conditions
  trainingSpeaker: null,
  testingSpeaker: null,
  trainingSpeakers: null,
  testingSpeakers: null,
  currentTrial: 0,
  totalEffectiveTrials: TRIAL_COUNT + ATTENTION_CHECK_COUNT, 
  stimuli: [], 
  responses: [],
  audioPlayedThisTrial: false,
  audioPlaying: false,
  startTime: null,
  trialStartTime: null,
  filename: null,
  completedPractice: false,
  useHeadphones: null,
  useChrome: null,
  surveyData: {
    firstLanguage: '',
    englishLearningTime: '',
    englishLearningCountry: '',
    otherLanguages: [],
    gender: ''
  },
  totalCorrect: 0,
  accuracy: 0,
  currentActualSentence: '', // Changed from currentActualWord
  strikes: 0, // NEW: track strikes
  terminated: false, // NEW: track if experiment was terminated early
  failedAttentionChecks: 0, // NEW: track failed attention checks separately
  processingTrial: false // NEW: prevent duplicate trial processing
};

let practiceState = {
  currentPracticeIndex: 0, 
  practiceComplete: false,
  currentActualSentence: '', // Changed from currentActualWord
  audioHasFinished: false
};

const CONDITIONS = {
  0: "single-single-same",
  1: "single-single-diff-same-variety",
  2: "single-single-diff-diff-variety",
  3: "single-multi-excl-single",
  4: "multi-multi-all-random",
  5: "multi-excl-single-single"
};

async function handleTimeout() {
  // CRITICAL: Clear timer immediately to prevent any further ticks
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  
  const isPractice = !experimentState.completedPractice;
  
  if (isPractice) {
    const trialNum = practiceState.currentPracticeIndex + 1;
    const responseInputEl = document.getElementById(`practice-typed-response-${trialNum}`);
    const statusEl = document.getElementById(`practice-audio-status-${trialNum}`);
    
    if (responseInputEl) responseInputEl.disabled = true;
    
    // Show timeout warning for practice
    if (statusEl) {
      statusEl.textContent = '⏰ Time\'s up! Try to respond within 15 seconds.';
      statusEl.style.color = '#dc3545'; // Red color for warning
    }
    
    const nextBtn = document.getElementById('practice-next-button');
    const beginBtn = document.getElementById('begin-experiment-button');
    if (practiceState.currentPracticeIndex === 0 && nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.replace('btn-secondary', 'btn-primary');
    } else if (practiceState.currentPracticeIndex === 1 && beginBtn) {
        beginBtn.disabled = false;
        beginBtn.classList.replace('btn-secondary', 'btn-primary');
    }

  } else {
    // Main experiment - always count as timeout
    if (typedResponseInput) typedResponseInput.disabled = true;
    
    // Log timeout for debugging
    console.log(`Timeout on trial ${experimentState.currentTrial + 1}`);
    
    if (!experimentState.processingTrial) {
      await nextTrial("TIMEOUT_AUTOADVANCE");
    }
  }
}

function nextPractice() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  
  // Hide and clean up the current trial
  const currentTrialEl = document.getElementById(`practice-trial-${practiceState.currentPracticeIndex + 1}`);
  if (currentTrialEl) {
    currentTrialEl.style.display = 'none';
  }

  if (practiceState.currentPracticeIndex === 0) {
    practiceState.currentPracticeIndex = 1;
    practiceCurrentTrialSpan.textContent = practiceState.currentPracticeIndex + 1;
    startPracticeTrial(practiceState.currentPracticeIndex);
  } else {
    showPracticeComplete();
  }
}

function startPracticeTrial(practiceIndex) {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }

  const trialNum = practiceIndex + 1;
  const currentPracticeStimulus = practiceStimuliData[practiceIndex];
  
  if (!currentPracticeStimulus || !currentPracticeStimulus.sentence_data) {
    console.error("Practice stimulus data not found or invalid for index:", practiceIndex);
    const statusEl = document.getElementById(`practice-audio-status-${trialNum}`);
    if (statusEl) {
      statusEl.textContent = "Error: Could not load practice trial. Click next to continue.";
      statusEl.style.color = '#dc3545';
    }
    // Enable next button to allow progression
    const nextBtn = document.getElementById('practice-next-button');
    const beginBtn = document.getElementById('begin-experiment-button');
    const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
    if (targetButton) {
      targetButton.disabled = false;
      targetButton.classList.replace('btn-secondary', 'btn-primary');
    }
    return;
  }
  
  practiceState.currentActualSentence = normalizeString(currentPracticeStimulus.sentence_data.original_sentence);

  const responseInputEl = document.getElementById(`practice-typed-response-${trialNum}`);
  const statusEl = document.getElementById(`practice-audio-status-${trialNum}`);
  const indicatorEl = document.getElementById(`practice-audio-indicator-${trialNum}`);
  
  const timerElements = {
    donutSegment: document.getElementById(`practice-donut-segment-${trialNum}`),
    timerTextEl: document.getElementById(`practice-timer-text-${trialNum}`),
    timerSrTextEl: document.getElementById(`practice-timer-sr-text-${trialNum}`)
  };

  const nextBtn = document.getElementById('practice-next-button');
  const beginBtn = document.getElementById('begin-experiment-button');

  document.getElementById(`practice-trial-${trialNum}`).style.display = 'block';
  
  responseInputEl.value = '';
  responseInputEl.disabled = false;
  responseInputEl.focus();

  nextBtn.disabled = true;
  nextBtn.classList.replace('btn-primary', 'btn-secondary');
  beginBtn.disabled = true;
  beginBtn.classList.replace('btn-primary', 'btn-secondary');

  if (trialNum === 1) {
    nextBtn.style.display = 'block';
    beginBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'none';
    beginBtn.style.display = 'block';
  }

  statusEl.textContent = 'Preparing practice audio...';
  statusEl.style.color = '';
  indicatorEl.classList.remove('playing');
  indicatorEl.classList.add('stopped');

  if (timerElements.donutSegment) timerElements.donutSegment.style.strokeDashoffset = 0;
  if (timerElements.timerTextEl) timerElements.timerTextEl.textContent = '15';
  updateScreenReaderTimer(15, timerElements.timerSrTextEl);
  setTimerColor(15);

  practiceState.audioHasFinished = false;
  let audioLoadFailed = false;
  let fallbackTimer = null;

  // Set up fallback timer for practice
  fallbackTimer = setTimeout(() => {
    if (!practiceState.audioHasFinished && !audioLoadFailed) {
      console.warn('Practice fallback timer triggered');
      audioLoadFailed = true;
      statusEl.textContent = 'Audio loading timeout. You may type your response or continue.';
      statusEl.style.color = '#dc3545';
      
      // Stop audio indicator animation
      indicatorEl.classList.replace('playing', 'stopped');
      
      const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
      if (targetButton) {
        targetButton.disabled = false;
        targetButton.classList.replace('btn-secondary', 'btn-primary');
      }
      
      practiceState.audioHasFinished = true;
    }
  }, FALLBACK_TIMER_DELAY);

  setTimeout(() => {
    loadAndPlayAudioWithRetry(
      currentPracticeStimulus.audio,
      () => { 
        indicatorEl.classList.replace('stopped', 'playing');
        statusEl.textContent = `Playing practice ${trialNum} of 2...`;
        statusEl.style.color = '';
      },
      () => { 
        clearTimeout(fallbackTimer);
        indicatorEl.classList.replace('playing', 'stopped');
        statusEl.textContent = 'Type everything that you heard. It doesn\'t have to make sense!';
        statusEl.style.color = '';
        practiceState.audioHasFinished = true;
        
        const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
        if (responseInputEl.value.trim().length > 0 && targetButton) {
          targetButton.disabled = false;
          targetButton.classList.replace('btn-secondary', 'btn-primary');
        }

        let countdown = 15;
        updateTimerDisplay(countdown, timerElements);
        timerShouldStop = false; // Reset the flag
        activeTimer = setInterval(() => {
          if (timerShouldStop) {
            clearInterval(activeTimer);
            activeTimer = null;
            return;
          }
          countdown--;
          if (countdown >= 0) {
            updateTimerDisplay(countdown, timerElements);
          }
          if (countdown <= -1) {
            clearInterval(activeTimer);
            activeTimer = null;
            timerShouldStop = true; // Prevent any further execution
            handleTimeout();
          }
        }, 1000);
      }
    ).catch(error => {
      clearTimeout(fallbackTimer);
      console.error('Error playing practice audio:', error);
      audioLoadFailed = true;
      statusEl.textContent = 'Audio could not be loaded. You may continue to the next trial.';
      statusEl.style.color = '#dc3545';
      practiceState.audioHasFinished = true;
      
      const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
      if (targetButton) {
        targetButton.disabled = false;
        targetButton.classList.replace('btn-secondary', 'btn-primary');
      }
    });
  }, 500);

  responseInputEl.removeEventListener('input', handlePracticeInput);
  responseInputEl.addEventListener('input', function(e) {
    handlePracticeInput(e);
  });

  responseInputEl.onkeyup = function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
      if (!targetButton.disabled && (practiceState.audioHasFinished || audioLoadFailed)) {
        targetButton.click();
      }
    }
  };
}

function handlePracticeInput(event) {
    const trialNum = practiceState.currentPracticeIndex + 1;
    const responseInputEl = document.getElementById(`practice-typed-response-${trialNum}`);
    const nextBtn = document.getElementById('practice-next-button');
    const beginBtn = document.getElementById('begin-experiment-button');
    
    // Auto-format: lowercase and remove punctuation except apostrophes
    const cursorPos = responseInputEl.selectionStart;
    responseInputEl.value = responseInputEl.value.toLowerCase().replace(/[^\w\s']/g, '');
    responseInputEl.setSelectionRange(cursorPos, cursorPos);
    
    const typedValue = normalizeString(responseInputEl.value);
    const targetButton = (trialNum === 1) ? nextBtn : beginBtn;
    
    if (typedValue.length > 0 && practiceState.audioHasFinished) {
        if (targetButton) {
            targetButton.disabled = false;
            targetButton.classList.replace('btn-secondary', 'btn-primary');
        }
    } else {
         if (targetButton) {
            targetButton.disabled = true;
            targetButton.classList.replace('btn-primary', 'btn-secondary');
        }
    }
}

function startPractice() {
  practiceState = {
    currentPracticeIndex: 0,
    practiceComplete: false,
    currentActualSentence: '',
    audioHasFinished: false
  };
  showScreen(practiceScreen);
  practiceCurrentTrialSpan.textContent = 1;
  startPracticeTrial(0);
}

function showScreen(screenToShow) {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  [welcomeScreen, loadingScreen, instructionsScreen, practiceScreen, practiceCompleteScreen, trialScreen, exitSurveyScreen, scoreScreen, completionScreen, paymentScreen, terminationScreen].forEach(screen => {
    if (screen) {
      screen.classList.remove('active');
      screen.style.display = 'none';
    }
  });
  screenToShow.style.display = 'flex'; 
  void screenToShow.offsetWidth;
  screenToShow.classList.add('active');
}

function showScoreScreen() {
  // No longer show accuracy, just thank you message
  showScreen(scoreScreen);
  
  // If backup data exists, show option to download
  if (experimentState.backupDataUrl && experimentState.backupFilename) {
    addBackupDownloadOption();
  }
}

// Function to add backup download option
function addBackupDownloadOption() {
  const scoreCardFooter = document.querySelector('#score-screen .card-footer');
  if (scoreCardFooter && !document.getElementById('backup-download-link')) {
    const downloadLink = document.createElement('a');
    downloadLink.id = 'backup-download-link';
    downloadLink.href = experimentState.backupDataUrl;
    downloadLink.download = experimentState.backupFilename;
    downloadLink.className = 'btn btn-secondary btn-with-icon';
    downloadLink.style.marginTop = '10px';
    downloadLink.style.display = 'block';
    downloadLink.innerHTML = `
      <span>Download Backup Data</span>
      <i class="fas fa-download"></i>
    `;
    downloadLink.onclick = function() {
      console.log('Backup data downloaded by participant');
    };
    scoreCardFooter.appendChild(downloadLink);
  }
}

function decidePaymentCode() {
  const missedTimeouts = experimentState.responses.filter(r => 
    r.normalized_typed_response === "TIMEOUT" || 
    r.normalized_typed_response === "NO_RESPONSE_MANUAL_ADVANCE" || 
    r.normalized_typed_response === ""
  ).length;
  const missedAttentionChecks = experimentState.responses.filter(r => r.is_attention_check && !r.is_correct).length;
  
  // Check if experiment was terminated early (2 strikes before/at trial 16)
  if (experimentState.terminated) {
    console.log("Payment code: Early termination due to strikes");
    return 'C12XODWM';
  }
  
  // Check for issues after the first attention check
  const hasLateIssues = experimentState.responses.some((r, idx) => {
    const trialNum = idx + 1;
    return trialNum > 16 && (
      (r.is_attention_check && !r.is_correct) ||
      (r.time_expired && r.normalized_typed_response === "TIMEOUT")
    );
  });
  
  if (hasLateIssues) {
    console.log("Payment code: Late issues after first attention check");
    return 'CQLDVPU6';
  }
  
  console.log("Payment code: Standard completion");
  return 'C1HPEXYP'; // Standard completion code
}

// NEW: Function to handle early termination
function terminateExperiment() {
  // Guard against duplicate terminations
  if (experimentState.terminated) {
    console.warn("Experiment already terminated, ignoring duplicate call");
    return;
  }
  
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  
  experimentState.terminated = true;
  experimentState.completionTime = new Date().toISOString();
  
  // Calculate current accuracy before termination
  experimentState.totalCorrect = experimentState.responses.filter(r => r.is_correct).length;
  experimentState.accuracy = experimentState.responses.length > 0 ? experimentState.totalCorrect / experimentState.responses.length : 0;
  
  // Save the data even though experiment was terminated
  saveExperimentDataToDataPipe();
  saveExperimentData();
  
  // Show termination screen
  showTerminationScreen();
}

// NEW: Function to show termination screen
function showTerminationScreen() {
  if (!terminationScreen) {
    console.error("Termination screen element not found");
    // Fallback to payment screen
    const paymentCode = decidePaymentCode();
    document.getElementById('payment-code').textContent = paymentCode;
    showScreen(paymentScreen);
    return;
  }
  
  const paymentCode = decidePaymentCode();
  const codeElement = document.getElementById('termination-payment-code');
  if (codeElement) codeElement.textContent = paymentCode;
  
  showScreen(terminationScreen);
}


async function initExperiment() { 
  await loadPracticeStimuliData(); 
  totalTrialsSpan.textContent = experimentState.totalEffectiveTrials;

  // Chrome browser check
  const browserRadios = document.querySelectorAll('input[name="browser-check"]');
  browserRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const useChrome = this.value === 'yes';
      experimentState.useChrome = useChrome;
      browserWarning.classList.toggle('hidden', useChrome);
      updateStartButton();
    });
  });

  const headphoneRadios = document.querySelectorAll('input[name="headphone-check"]');
  headphoneRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const useHeadphones = this.value === 'yes';
      experimentState.useHeadphones = useHeadphones;
      headphoneWarning.classList.toggle('hidden', useHeadphones);
      updateStartButton();
    });
  });

  function updateStartButton() {
    startButton.disabled = !(experimentState.useHeadphones && experimentState.useChrome);
  }

  firstLanguageInput.addEventListener('input', function() {
    const value = this.value.toLowerCase().trim();
    const isEnglish = value === 'english' || value === 'en';
    englishLearningTimeContainer.style.display = isEnglish ? 'none' : 'block';
  });

  // Remove validation-related event listeners for survey inputs
  startButton.addEventListener('click', startExperiment);
  practiceButton.addEventListener('click', startPractice);
  
  const practiceNextButton = document.getElementById('practice-next-button');
  if (practiceNextButton) {
    practiceNextButton.addEventListener('click', () => {
        if (practiceState.audioHasFinished) {
            setTimeout(nextPractice, 100); 
        }
    });
  }
  
  const beginExperimentButton = document.getElementById('begin-experiment-button');
  if (beginExperimentButton) {
    beginExperimentButton.addEventListener('click', () => {
        if (practiceState.audioHasFinished) {
            setTimeout(showPracticeComplete, 100);
        }
    });
  }
  
  continueToExperimentButton.addEventListener('click', beginExperiment);
  nextButton.addEventListener('click', async () => await nextTrial()); 
  submitSurveyButton.addEventListener('click', submitSurvey);
  
  if (paymentButton) { 
    paymentButton.addEventListener('click', function() {
        const completionScreenEl = document.getElementById('completion-screen'); 
        showScreen(completionScreenEl); 
    });
  }
  
  // NEW: Add event listener for termination screen button
  const terminationPaymentBtn = document.getElementById('termination-payment-btn');
  if (terminationPaymentBtn) {
    terminationPaymentBtn.addEventListener('click', function() {
      const paymentCode = decidePaymentCode();
      document.getElementById('payment-code').textContent = paymentCode;
      showScreen(paymentScreen);
    });
  }
  
  showScreen(welcomeScreen);
  loadExperimentState(); 
}

function validateSurvey() {
  // No validation needed - survey can always be submitted
  submitSurveyButton.disabled = false;
}



async function getConditionFromDataPipe() {
  try {
    const response = await fetch(EXPERIMENT_CONFIG.dataPipe.conditionApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "*/*" },
      body: JSON.stringify({ experimentID: EXPERIMENT_CONFIG.dataPipeId }),
    });
    if (!response.ok) throw new Error(`DataPipe API error: ${response.status}`);
    const result = await response.json();
    if (result && typeof result.condition === 'number') return result.condition;
    throw new Error("Invalid condition from DataPipe");
  } catch (error) {
    console.error('Error getting condition from DataPipe:', error);
    return Math.floor(Math.random() * 6); // Updated to 6 conditions
  }
}

async function startExperiment() {
  experimentState.participantId = generateParticipantId();
  experimentState.filename = `${experimentState.participantId}.csv`;
  experimentState.startTime = new Date().toISOString();
  showScreen(loadingScreen);
  
  try {
    const conditionNumber = await getConditionFromDataPipe();
    experimentState.condition = CONDITIONS[conditionNumber];
    
    // Set up speakers based on condition
    if (experimentState.condition === 'single-single-same') {
      // Single speaker for both training and testing
      experimentState.trainingSpeaker = randomChoice(SPEAKERS);
      experimentState.testingSpeaker = experimentState.trainingSpeaker;
    } else if (experimentState.condition === 'single-single-diff-same-variety') {
      // Different speakers, same language variety
      const trainingSpeaker = randomChoice(SPEAKERS);
      const trainingVariety = EXPERIMENT_CONFIG.talkerMetadata[trainingSpeaker].language;
      const sameVarietySpeakers = SPEAKERS.filter(s => 
        s !== trainingSpeaker && 
        EXPERIMENT_CONFIG.talkerMetadata[s].language === trainingVariety
      );
      if (sameVarietySpeakers.length === 0) {
        // Fallback if no other speakers of same variety
        experimentState.testingSpeaker = randomChoice(SPEAKERS.filter(s => s !== trainingSpeaker));
      } else {
        experimentState.testingSpeaker = randomChoice(sameVarietySpeakers);
      }
      experimentState.trainingSpeaker = trainingSpeaker;
    } else if (experimentState.condition === 'single-single-diff-diff-variety') {
      // Different speakers, different language variety
      const trainingSpeaker = randomChoice(SPEAKERS);
      const trainingVariety = EXPERIMENT_CONFIG.talkerMetadata[trainingSpeaker].language;
      const diffVarietySpeakers = SPEAKERS.filter(s => 
        s !== trainingSpeaker && 
        EXPERIMENT_CONFIG.talkerMetadata[s].language !== trainingVariety
      );
      experimentState.trainingSpeaker = trainingSpeaker;
      experimentState.testingSpeaker = randomChoice(diffVarietySpeakers);
    } else if (experimentState.condition === 'single-multi-excl-single') {
      // Single speaker for training, multiple (excluding training speaker) for testing
      experimentState.trainingSpeaker = randomChoice(SPEAKERS);
      experimentState.testingSpeakers = SPEAKERS.filter(s => s !== experimentState.trainingSpeaker);
    } else if (experimentState.condition === 'multi-multi-all-random') {
      // All speakers available for both training and testing
      // No specific assignment needed, will use SPEAKERS directly
    } else if (experimentState.condition === 'multi-excl-single-single') {
      // Multiple speakers (excluding one) for training, the excluded one for testing
      experimentState.testingSpeaker = randomChoice(SPEAKERS);
      experimentState.trainingSpeakers = SPEAKERS.filter(s => s !== experimentState.testingSpeaker);
    }
    
    console.log(`Assigned to condition: ${experimentState.condition} (${conditionNumber})`);
    
    // Log speaker assignments
    if (experimentState.trainingSpeaker) console.log(`Training speaker: ${experimentState.trainingSpeaker}`);
    if (experimentState.testingSpeaker) console.log(`Testing speaker: ${experimentState.testingSpeaker}`);
    if (experimentState.trainingSpeakers) console.log(`Training speakers:`, experimentState.trainingSpeakers);
    if (experimentState.testingSpeakers) console.log(`Testing speakers:`, experimentState.testingSpeakers);
    
    await prepareStimuli();
    saveExperimentState();
    
    // Set condition info in tiny hidden text
    const conditionInfoEl = document.getElementById('condition-info');
    if (conditionInfoEl) {
      conditionInfoEl.textContent = `Condition: ${experimentState.condition}`;
    }
    
    showScreen(instructionsScreen);
  } catch (error) {
    console.error("Error starting experiment:", error);
    alert("Error starting experiment. Please refresh.");
    showScreen(welcomeScreen);
  }
}

function beginExperiment() {
  experimentState.completedPractice = true;
  showScreen(trialScreen);
  startTrial();
}

function showPracticeComplete() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  
  experimentState.completedPractice = true; 
  showScreen(practiceCompleteScreen);
}


async function prepareStimuli() {
  const allTranscriptIds = Array.from({ length: AVAILABLE_TRANSCRIPTS_COUNT }, (_, i) => i); 
  let mainTrialIds = shuffle(allTranscriptIds).slice(0, TRIAL_COUNT); 

  let preliminaryStimuliSetup = []; 

  const cond = experimentState.condition;
  const halfwayPoint = Math.floor(TRIAL_COUNT / 2);
  
  for (let i = 0; i < TRIAL_COUNT; i++) {
    const transcriptId = mainTrialIds[i];
    let speaker;
    const isTrainingPhase = i < halfwayPoint;
    
    if (cond === 'single-single-same') {
      // Same speaker for all trials
      speaker = experimentState.trainingSpeaker;
    } else if (cond === 'single-single-diff-same-variety' || cond === 'single-single-diff-diff-variety') {
      // Training phase: training speaker, Testing phase: testing speaker
      speaker = isTrainingPhase ? experimentState.trainingSpeaker : experimentState.testingSpeaker;
    } else if (cond === 'single-multi-excl-single') {
      // Training: single speaker, Testing: random from multiple (excluding training)
      if (isTrainingPhase) {
        speaker = experimentState.trainingSpeaker;
      } else {
        speaker = randomChoice(experimentState.testingSpeakers);
      }
    } else if (cond === 'multi-multi-all-random') {
      // Random speaker for every trial
      speaker = randomChoice(SPEAKERS);
    } else if (cond === 'multi-excl-single-single') {
      // Training: random from multiple (excluding test speaker), Testing: single test speaker
      if (isTrainingPhase) {
        speaker = randomChoice(experimentState.trainingSpeakers);
      } else {
        speaker = experimentState.testingSpeaker;
      }
    }
    
    const idStr = `${speaker}_${transcriptId}`;
    preliminaryStimuliSetup.push({
      audioUrl: `${AUDIO_BASE}${idStr}.wav`,
      textJsonUrl: `${TEXT_JSON_BASE}${idStr}.json`, 
      isAttentionCheck: false,
      speaker: speaker,
      stimulusId: idStr,
      phase: isTrainingPhase ? 'training' : 'testing'
    });
  }

  // Randomly order the attention checks - first one goes after trial 15, second after trial 30
  let attentionCheckStimuliFromConfig = shuffle(ATTENTION_STIMULI_INFO.slice());
  const firstAttentionCheck = attentionCheckStimuliFromConfig[0];
  const secondAttentionCheck = attentionCheckStimuliFromConfig[1];
  
  const finalStimuliSetup = [];
  let mainTrialCounter = 0;
  for (let i = 0; i < preliminaryStimuliSetup.length; i++) {
    finalStimuliSetup.push(preliminaryStimuliSetup[i]);
    mainTrialCounter++;
    // Insert first attention check after trial 15 (halfway)
    if (mainTrialCounter === halfwayPoint) {
      finalStimuliSetup.push({
        audioUrl: firstAttentionCheck.audio,
        isAttentionCheck: true,
        speaker: 'ATTENTION', 
        stimulusId: firstAttentionCheck.id,
        sentenceData: firstAttentionCheck.sentence_data,
        phase: 'attention'
      });
    }
  }
  // Add second attention check at the very end
  finalStimuliSetup.push({
    audioUrl: secondAttentionCheck.audio,
    isAttentionCheck: true,
    speaker: 'ATTENTION',
    stimulusId: secondAttentionCheck.id,
    sentenceData: secondAttentionCheck.sentence_data,
    phase: 'attention'
  });
  
  console.log('Loading sentence data for main stimuli...');
  const sentenceDataPromises = finalStimuliSetup
    .filter(s => !s.isAttentionCheck) 
    .map(s => loadSentenceJson(s.textJsonUrl).then(data => ({ stimulusId: s.stimulusId, data })));
  
  const loadedMainTrialSentenceDataResults = await Promise.all(sentenceDataPromises);
  const sentenceDataMap = new Map(loadedMainTrialSentenceDataResults.map(r => [r.stimulusId, r.data]));

  experimentState.stimuli = finalStimuliSetup.map(setup => {
    if (!setup.isAttentionCheck) {
      return { ...setup, sentenceData: sentenceDataMap.get(setup.stimulusId) || { error: true, original_sentence: "Error loading." } };
    }
    return setup; 
  });
  
  const errors = experimentState.stimuli.filter(s => s.sentenceData.error && !s.isAttentionCheck);
  if (errors.length > 0) {
      console.error(`Failed to load sentence data for ${errors.length} main stimuli. Examples:`, errors.slice(0,3).map(e => e.textJsonUrl));
  }
  
  // Handle backup stimuli for errors (maintaining condition-appropriate speaker assignment)
  const unusedMainTrialIds = allTranscriptIds.filter(id => !mainTrialIds.includes(id));
  for (let i = 0; i < experimentState.stimuli.length; i++) {
    const stim = experimentState.stimuli[i];
    if (!stim.isAttentionCheck && stim.sentenceData.error && unusedMainTrialIds.length > 0) {
        const backupIdNum = unusedMainTrialIds.shift();
        let backupSpeaker;
        const originalPhase = stim.phase;
        const isTrainingPhase = originalPhase === 'training';
        
        // Assign backup speaker based on condition and phase
        if (cond === 'single-single-same') {
            backupSpeaker = experimentState.trainingSpeaker;
        } else if (cond === 'single-single-diff-same-variety' || cond === 'single-single-diff-diff-variety') {
            backupSpeaker = isTrainingPhase ? experimentState.trainingSpeaker : experimentState.testingSpeaker;
        } else if (cond === 'single-multi-excl-single') {
            backupSpeaker = isTrainingPhase ? experimentState.trainingSpeaker : randomChoice(experimentState.testingSpeakers);
        } else if (cond === 'multi-multi-all-random') {
            backupSpeaker = randomChoice(SPEAKERS);
        } else if (cond === 'multi-excl-single-single') {
            backupSpeaker = isTrainingPhase ? randomChoice(experimentState.trainingSpeakers) : experimentState.testingSpeaker;
        } else {
            // Fallback
            backupSpeaker = randomChoice(SPEAKERS);
        }
        
        const backupIdStr = `${backupSpeaker}_${backupIdNum}`;
        console.warn(`Replacing failed stimulus ${stim.stimulusId} with backup ${backupIdStr}`);
        
        const newAudioUrl = `${AUDIO_BASE}${backupIdStr}.wav`;
        const newTextJsonUrl = `${TEXT_JSON_BASE}${backupIdStr}.json`;
        const newSentenceData = await loadSentenceJson(newTextJsonUrl);

        experimentState.stimuli[i] = {
            audioUrl: newAudioUrl,
            textJsonUrl: newTextJsonUrl, 
            isAttentionCheck: false,
            speaker: backupSpeaker,
            stimulusId: backupIdStr,
            sentenceData: newSentenceData,
            phase: originalPhase
        };
        if (newSentenceData.error) {
            console.error(`Backup stimulus ${backupIdStr} also failed to load text JSON.`);
        }
    }
  }
  console.log(`Prepared ${experimentState.stimuli.length} stimuli with sentence data.`);
}

// Enhanced startTrial with fallback mechanisms
function startTrial() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }

  const currentStimulus = experimentState.stimuli[experimentState.currentTrial];
  if (!currentStimulus || !currentStimulus.sentenceData) {
    console.error("Critical error: Current stimulus or its sentence data is missing for trial", experimentState.currentTrial);
    audioStatus.textContent = "Error loading trial. Advancing to next trial...";
    setTimeout(() => nextTrial("STIMULUS_ERROR"), 2000);
    return;
  }
  
  experimentState.currentActualSentence = normalizeString(currentStimulus.sentenceData.original_sentence);
  currentTrialSpan.textContent = experimentState.currentTrial + 1;
  updateProgressBar();

  experimentState.audioPlayedThisTrial = false;
  experimentState.trialStartTime = new Date().toISOString();

  blankedSentenceDisplay.style.display = 'none';
  typedResponseInput.value = '';
  typedResponseInput.disabled = false;
  typedResponseInput.focus();
  nextButton.disabled = true;
  nextButton.classList.replace('btn-primary', 'btn-secondary');
  audioStatus.textContent = 'Preparing audio...';
  audioIndicator.classList.replace('playing', 'stopped');
  
  donutSegment.style.strokeDashoffset = 0;
  timerText.textContent = '15';
  updateScreenReaderTimer(15, timerSrText);
  setTimerColor(15);

  let audioHasFinished = false;
  let audioLoadFailed = false;
  let fallbackTimer = null;

  // Set up fallback timer that starts immediately
  fallbackTimer = setTimeout(() => {
    if (!audioHasFinished && !audioLoadFailed) {
      console.warn('Fallback timer triggered - allowing user to proceed');
      audioLoadFailed = true;
      audioStatus.textContent = 'Audio loading timeout. You may type your response or skip.';
      audioStatus.style.color = '#dc3545';
      
      // Stop audio indicator animation
      audioIndicator.classList.replace('playing', 'stopped');
      experimentState.audioPlaying = false;
      
      // Enable next button
      nextButton.disabled = false;
      nextButton.classList.replace('btn-secondary', 'btn-primary');
      
      // Start countdown timer
      if (!activeTimer) {
        let countdown = 15;
        updateTimerDisplay(countdown, mainTimerElements);
        timerShouldStop = false; // Reset the flag
        activeTimer = setInterval(() => {
          if (timerShouldStop) {
            clearInterval(activeTimer);
            activeTimer = null;
            return;
          }
          countdown--;
          if (countdown >= 0) {
            updateTimerDisplay(countdown, mainTimerElements);
          }
          if (countdown <= -1) {
            clearInterval(activeTimer);
            activeTimer = null;
            timerShouldStop = true; // Prevent any further execution
            handleTimeout();
          }
        }, 1000);
      }
    }
  }, FALLBACK_TIMER_DELAY);

  typedResponseInput.onkeyup = async function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      if (!nextButton.disabled) {
        await nextButton.click();
      }
    }
  };
  
  typedResponseInput.oninput = function() {
    const cursorPos = this.selectionStart;
    this.value = this.value.toLowerCase().replace(/[^\w\s']/g, '');
    this.setSelectionRange(cursorPos, cursorPos);
    
    if (typedResponseInput.value.trim().length > 0 && (audioHasFinished || audioLoadFailed)) {
      nextButton.disabled = false;
      nextButton.classList.replace('btn-secondary', 'btn-primary');
    } else if (!audioLoadFailed) {
      nextButton.disabled = true;
      nextButton.classList.replace('btn-primary', 'btn-secondary');
    }
  };

  setTimeout(() => {
    loadAndPlayAudioWithRetry(
      currentStimulus.audioUrl,
      () => { 
        audioIndicator.classList.replace('stopped', 'playing');
        audioStatus.textContent = 'Playing audio... You can start typing.';
        audioStatus.style.color = '';
        experimentState.audioPlayedThisTrial = true;
        experimentState.audioPlaying = true;
      },
      () => { 
        clearTimeout(fallbackTimer);
        audioIndicator.classList.replace('playing', 'stopped');
        audioStatus.textContent = 'Type everything that you heard. It doesn\'t have to make sense!';
        audioStatus.style.color = '';
        experimentState.audioPlaying = false;
        audioHasFinished = true;
        
        if (typedResponseInput.value.trim().length > 0) {
          nextButton.disabled = false;
          nextButton.classList.replace('btn-secondary', 'btn-primary');
        }

        let countdown = 15;
        updateTimerDisplay(countdown, mainTimerElements);
        timerShouldStop = false; // Reset the flag
        activeTimer = setInterval(() => {
          if (timerShouldStop) {
            clearInterval(activeTimer);
            activeTimer = null;
            return;
          }
          countdown--;
          if (countdown >= 0) {
            updateTimerDisplay(countdown, mainTimerElements);
          }
          if (countdown <= -1) {
            clearInterval(activeTimer);
            activeTimer = null;
            timerShouldStop = true; // Prevent any further execution
            handleTimeout();
          }
        }, 1000);
      }
    ).catch(error => {
      clearTimeout(fallbackTimer);
      console.error('Error playing audio for trial:', experimentState.currentTrial, currentStimulus.audioUrl, error);
      audioLoadFailed = true;
      
      // Provide clear error message to user
      audioStatus.textContent = 'Audio could not be loaded. You may type what you think you heard or click Next to skip.';
      audioStatus.style.color = '#dc3545';
      audioHasFinished = true;
      experimentState.audioPlayedThisTrial = false;
      
      // Always enable next button on error
      nextButton.disabled = false;
      nextButton.classList.replace('btn-secondary', 'btn-primary');
      
      // Start timer anyway
      let countdown = 15;
      updateTimerDisplay(countdown, mainTimerElements);
      timerShouldStop = false; // Reset the flag
      activeTimer = setInterval(() => {
        if (timerShouldStop) {
          clearInterval(activeTimer);
          activeTimer = null;
          return;
        }
        countdown--;
        if (countdown >= 0) {
          updateTimerDisplay(countdown, mainTimerElements);
        }
        if (countdown <= -1) {
          clearInterval(activeTimer);
          activeTimer = null;
          timerShouldStop = true; // Prevent any further execution
          handleTimeout();
        }
      }, 1000);
    });
  }, 500);
}

async function nextTrial(timeoutReason = null) {
  // Prevent multiple calls for the same trial
  if (experimentState.processingTrial) {
    console.warn("Already processing trial, ignoring duplicate call");
    return;
  }
  experimentState.processingTrial = true;

  // CRITICAL FIX: Clear timer immediately at the start of nextTrial
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }

  const currentStimulus = experimentState.stimuli[experimentState.currentTrial];
  let rawTypedResponse = typedResponseInput.value; 
  let normalizedTypedResponse = normalizeString(rawTypedResponse);
  let timeExpired = false;

  // Check if this was a timeout or other special case
  if (timeoutReason === "TIMEOUT_AUTOADVANCE") {
      normalizedTypedResponse = rawTypedResponse.trim() === "" ? "TIMEOUT" : normalizeString(rawTypedResponse);
      timeExpired = true;
      console.log("Processing timeout for trial", experimentState.currentTrial + 1);
  } else if (timeoutReason === "STIMULUS_ERROR") {
      normalizedTypedResponse = "STIMULUS_ERROR";
      timeExpired = false;
  } else if (rawTypedResponse.trim() === "") {
      normalizedTypedResponse = "NO_RESPONSE_MANUAL_ADVANCE"; 
  }
  
  // For attention checks, compare to the expected word
  // For regular trials, compare to the full sentence
  let isCorrect;
  if (currentStimulus.isAttentionCheck) {
    // For attention checks, still compare to just the expected word
    const expectedWord = normalizeString(currentStimulus.sentenceData.actual);
    isCorrect = normalizedTypedResponse === expectedWord;
  } else {
    // For regular trials, compare to the full sentence
    isCorrect = normalizedTypedResponse === experimentState.currentActualSentence;
  }

  const response = {
    participantId: experimentState.participantId,
    trial_num_overall: experimentState.currentTrial + 1, 
    condition: experimentState.condition,
    stimulus_id: currentStimulus.stimulusId,
    stimulus_audio_url: currentStimulus.audioUrl,
    is_attention_check: currentStimulus.isAttentionCheck,
    speaker: currentStimulus.speaker, 
    phase: currentStimulus.phase || 'unknown',
    original_sentence: currentStimulus.sentenceData.original_sentence || '',
    expected_response: currentStimulus.isAttentionCheck ? currentStimulus.sentenceData.actual : currentStimulus.sentenceData.original_sentence,
    typed_response_raw: rawTypedResponse, 
    normalized_typed_response: normalizedTypedResponse,
    normalized_expected: currentStimulus.isAttentionCheck ? normalizeString(currentStimulus.sentenceData.actual) : experimentState.currentActualSentence,
    is_correct: isCorrect,
    time_expired: timeExpired,
    audio_played_successfully: experimentState.audioPlayedThisTrial,
    trial_start_time: experimentState.trialStartTime,
    trial_end_time: new Date().toISOString(),
  };

  experimentState.responses.push(response);
  
  console.log(`Trial ${experimentState.currentTrial + 1} response:`, {
    stimulus: currentStimulus.stimulusId,
    typed_raw: rawTypedResponse,
    typed_normalized: normalizedTypedResponse,
    expected_normalized: currentStimulus.isAttentionCheck ? normalizeString(currentStimulus.sentenceData.actual) : experimentState.currentActualSentence,
    is_correct: isCorrect,
    timeExpired: timeExpired
  });

  // NEW: Check for strikes
  let strikeWarningPromise = null;
  if (timeExpired) {
    // Timeout strike - counts regardless of whether text was typed
    experimentState.strikes++;
    console.log(`Strike! Timeout on trial ${experimentState.currentTrial + 1}. Total strikes: ${experimentState.strikes}`);
    // Show warning if we're at or before the first attention check (trial 16)
    if (experimentState.currentTrial + 1 <= 16) {
      const remainingStrikes = Math.max(0, 2 - experimentState.strikes);
      strikeWarningPromise = showStrikeWarning('MISSED TIME WINDOW!', remainingStrikes);
    }
  } else if (currentStimulus.isAttentionCheck && !isCorrect) {
    // Failed attention check strike
    experimentState.strikes++;
    experimentState.failedAttentionChecks++;
    console.log(`Strike! Failed attention check on trial ${experimentState.currentTrial + 1}. Total strikes: ${experimentState.strikes}`);
    // Show warning if we're at or before the first attention check (trial 16)
    if (experimentState.currentTrial + 1 <= 16) {
      const remainingStrikes = Math.max(0, 2 - experimentState.strikes);
      strikeWarningPromise = showStrikeWarning('MISSED ATTENTION CHECK!', remainingStrikes);
    }
  }

  experimentState.currentTrial++;
  saveExperimentState();
  
  // Reset processing flag
  experimentState.processingTrial = false;

  // NEW: Check if we should terminate (only if strikes happen up to and including trial 16 - first attention check)
  const isBeforeOrAtFirstAttentionCheck = experimentState.currentTrial <= 16; // Trial 16 is the first attention check
  
  if (isBeforeOrAtFirstAttentionCheck && experimentState.strikes >= 2) {
    console.log("Strike limit reached before/at first attention check. Terminating experiment.");
    // Wait for warning to complete if it's showing
    if (strikeWarningPromise) {
      await strikeWarningPromise;
    }
    terminateExperiment();
  } else if (experimentState.currentTrial >= experimentState.stimuli.length) {
    showExitSurvey();
  } else {
    // Wait for warning to complete before starting next trial
    if (strikeWarningPromise) {
      await strikeWarningPromise;
    }
    startTrial();
  }
}

function showExitSurvey() {
  showScreen(exitSurveyScreen);
  firstLanguageInput.focus();
  submitSurveyButton.disabled = false; // Always enabled
}

function submitSurvey() {
  experimentState.surveyData.firstLanguage = firstLanguageInput.value.trim();
  const isEnglish = experimentState.surveyData.firstLanguage.toLowerCase() === 'english' || 
                   experimentState.surveyData.firstLanguage.toLowerCase() === 'en';
  if (!isEnglish) {
    experimentState.surveyData.englishLearningTime = englishLearningTimeInput.value.trim();
  }
  experimentState.surveyData.englishLearningCountry = englishLearningCountryInput.value.trim();
  
  // Parse comma-separated languages
  const otherLangsValue = otherLanguagesInput.value.trim();
  experimentState.surveyData.otherLanguages = otherLangsValue ? 
    otherLangsValue.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0) : [];
  
  experimentState.surveyData.gender = document.querySelector('input[name="gender"]:checked')?.value || '';
  
  experimentState.completionTime = new Date().toISOString();
  
  experimentState.totalCorrect = experimentState.responses.filter(r => r.is_correct).length;
  experimentState.accuracy = experimentState.responses.length > 0 ? experimentState.totalCorrect / experimentState.responses.length : 0;
  
  console.log('Experiment completed!', { 
      participantId: experimentState.participantId,
      accuracy: experimentState.accuracy 
  });
  saveExperimentDataToDataPipe();
  saveExperimentData(); 
  showScoreScreen();
}

function resetExperiment() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
    timerShouldStop = true; // Stop any pending timer callbacks
  }
  experimentState = { 
    participantId: null, condition: null, currentTrial: 0,
    trainingSpeaker: null, testingSpeaker: null, trainingSpeakers: null, testingSpeakers: null,
    totalEffectiveTrials: TRIAL_COUNT + ATTENTION_CHECK_COUNT, 
    stimuli: [], responses: [], audioPlayedThisTrial: false, audioPlaying: false,
    startTime: null, trialStartTime: null, filename: null, completedPractice: false,
    useHeadphones: null, useChrome: null, surveyData: { firstLanguage: '', englishLearningTime: '', englishLearningCountry: '', otherLanguages: [], gender: '' },
    totalCorrect: 0, accuracy: 0, currentActualSentence: '', strikes: 0, terminated: false, failedAttentionChecks: 0
   };
  
  if (progressBar) { progressBar.style.width = '0%'; progressBar.textContent = '0%'; }
  if (typedResponseInput) typedResponseInput.value = '';
  if (blankedSentenceDisplay) blankedSentenceDisplay.textContent = '';
  document.querySelectorAll('input[name="headphone-check"]').forEach(radio => radio.checked = false);
  document.querySelectorAll('input[name="browser-check"]').forEach(radio => radio.checked = false);
  if(headphoneWarning) headphoneWarning.classList.add('hidden');
  if(browserWarning) browserWarning.classList.add('hidden');
  if(startButton) startButton.disabled = true; 
  
  firstLanguageInput.value = '';
  englishLearningTimeInput.value = '';
  englishLearningCountryInput.value = '';
  otherLanguagesInput.value = '';
  englishLearningTimeContainer.style.display = 'none';
  document.querySelectorAll('input[name="gender"]').forEach(radio => radio.checked = false);

  clearExperimentState();
}

function updateProgressBar() {
  let progress = 0;
  if (experimentState.completedPractice) {
    const trialProgress = experimentState.stimuli.length > 0 ? experimentState.currentTrial / experimentState.stimuli.length : 0;
    progress = 5 + (trialProgress * 85); 
  }
  if (exitSurveyScreen.classList.contains('active')) {
    progress = 90;
  }
  if (scoreScreen.classList.contains('active') || completionScreen.classList.contains('active') || paymentScreen.classList.contains('active')) {
    progress = 100;
  }

  progressBar.style.width = `${Math.min(100, Math.round(progress))}%`;
  progressBar.textContent = `${Math.min(100, Math.round(progress))}%`;
}

function generateParticipantId() {
  return 'participant-' + Math.random().toString(36).substring(2, 15) +
    '-' + new Date().toISOString().replace(/[-:.]/g, '');
}

function saveExperimentState() {
  localStorage.setItem('experimentState', JSON.stringify(experimentState));
}

function loadExperimentState() {
  const savedState = localStorage.getItem('experimentState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      if (parsedState && parsedState.stimuli && parsedState.stimuli.length > 0 && parsedState.currentTrial < parsedState.stimuli.length) {
        if (confirm('Resume previous experiment?')) {
          experimentState = { ...parsedState, audioPlayedThisTrial: false, audioPlaying: false };
          // Ensure strikes are initialized
          if (typeof experimentState.strikes === 'undefined') experimentState.strikes = 0;
          if (typeof experimentState.terminated === 'undefined') experimentState.terminated = false;
          if (typeof experimentState.failedAttentionChecks === 'undefined') experimentState.failedAttentionChecks = 0;
          if (typeof experimentState.useChrome === 'undefined') experimentState.useChrome = null;
          // Ensure new speaker properties are initialized
          if (typeof experimentState.trainingSpeaker === 'undefined') experimentState.trainingSpeaker = null;
          if (typeof experimentState.testingSpeaker === 'undefined') experimentState.testingSpeaker = null;
          if (typeof experimentState.trainingSpeakers === 'undefined') experimentState.trainingSpeakers = null;
          if (typeof experimentState.testingSpeakers === 'undefined') experimentState.testingSpeakers = null;
          
          experimentState.completedPractice = parsedState.completedPractice || (parsedState.currentTrial > 0);
          if (!experimentState.completedPractice && practiceStimuliData.length === 0) {
              loadPracticeStimuliData(); 
          }

          if (experimentState.currentTrial > 0) {
            showScreen(trialScreen);
            startTrial();
          } else if (experimentState.completedPractice) {
            showScreen(trialScreen);
            startTrial();
          } else if (experimentState.participantId) { 
             // Set condition info when showing instructions screen
             const conditionInfoEl = document.getElementById('condition-info');
             if (conditionInfoEl && experimentState.condition) {
               conditionInfoEl.textContent = `Condition: ${experimentState.condition}`;
             }
             showScreen(instructionsScreen);
          } else {
            clearExperimentState(); 
          }
        } else {
          clearExperimentState();
        }
      } else {
        clearExperimentState();
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
      clearExperimentState();
    }
  }
}

function clearExperimentState() {
  localStorage.removeItem('experimentState');
}

function saveExperimentData() { 
  const existingData = JSON.parse(localStorage.getItem('experimentData') || '[]');
  existingData.push({
    participantId: experimentState.participantId,
    condition: experimentState.condition,
    // Include speaker assignments
    trainingSpeaker: experimentState.trainingSpeaker,
    testingSpeaker: experimentState.testingSpeaker,
    trainingSpeakers: experimentState.trainingSpeakers,
    testingSpeakers: experimentState.testingSpeakers,
    startTime: experimentState.startTime,
    completionTime: experimentState.completionTime,
    surveyData: experimentState.surveyData,
    responses: experimentState.responses,
    score: { correct: experimentState.totalCorrect, accuracy: experimentState.accuracy },
    strikes: experimentState.strikes,
    terminated: experimentState.terminated,
    failedAttentionChecks: experimentState.failedAttentionChecks
  });
  localStorage.setItem('experimentData', JSON.stringify(existingData));
  console.log('All experiment data (localStorage backup):', existingData);
}

function formatExperimentDataAsCSV() {
  if (!experimentState.responses || experimentState.responses.length === 0) return '';
  
  const headers = [
    'participant_id', 'condition', 'overall_trial_number', 
    'stimulus_id', 'stimulus_audio_url', 'is_attention_check', 'speaker_id',
    'experimental_phase', 'original_sentence', 'expected_response', 
    'typed_response_raw', 'typed_response_normalized', 'normalized_expected', 
    'is_correct', 'time_expired', 'audio_played_successfully',
    'trial_start_time', 'trial_end_time',
    'experiment_start_time', 'experiment_end_time',
    'first_language', 'english_learning_time', 'english_learning_country',
    'other_languages', 'gender', 'use_headphones', 'use_chrome', 'final_accuracy_score',
    'total_strikes', 'experiment_terminated_early', 'failed_attention_checks',
    'POST_UPDATE_FLAG' // NEW: Added POST_UPDATE_FLAG column
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  experimentState.responses.forEach(response => {
    const rowData = {
      participant_id: experimentState.participantId,
      condition: experimentState.condition,
      overall_trial_number: response.trial_num_overall,
      stimulus_id: response.stimulus_id,
      stimulus_audio_url: response.stimulus_audio_url,
      is_attention_check: response.is_attention_check ? 'true' : 'false',
      speaker_id: response.speaker,
      experimental_phase: response.phase || 'unknown',
      original_sentence: response.original_sentence || '',
      expected_response: response.expected_response || '', 
      typed_response_raw: response.typed_response_raw,
      typed_response_normalized: response.normalized_typed_response,
      normalized_expected: response.normalized_expected || '', 
      is_correct: response.is_correct ? 'true' : 'false',
      time_expired: response.time_expired ? 'true' : 'false',
      audio_played_successfully: response.audio_played_successfully ? 'true' : 'false',
      trial_start_time: response.trial_start_time,
      trial_end_time: response.trial_end_time,
      experiment_start_time: experimentState.startTime,
      experiment_end_time: experimentState.completionTime,
      first_language: experimentState.surveyData.firstLanguage || '',
      english_learning_time: experimentState.surveyData.englishLearningTime || '',
      english_learning_country: experimentState.surveyData.englishLearningCountry || '',
      other_languages: (experimentState.surveyData.otherLanguages || []).join(';'),
      gender: experimentState.surveyData.gender || '',
      use_headphones: experimentState.useHeadphones ? 'yes' : 'no',
      use_chrome: experimentState.useChrome ? 'yes' : 'no',
      final_accuracy_score: experimentState.accuracy.toFixed(4),
      total_strikes: experimentState.strikes,
      experiment_terminated_early: experimentState.terminated ? 'true' : 'false',
      failed_attention_checks: experimentState.failedAttentionChecks,
      POST_UPDATE_FLAG: 'true' // NEW: Set to true as requested
    };
    
    const row = headers.map(header => {
      const value = rowData[header] === undefined || rowData[header] === null ? '' : rowData[header];
      const escaped = String(value).replace(/"/g, '""');
      return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',');
    csvContent += row + '\n';
  });
  return csvContent;
}

function saveExperimentDataToDataPipe() {
  try {
    const csvData = formatExperimentDataAsCSV();
    const uniqueFilename = `data_typed_${experimentState.participantId}_${Date.now()}.csv`;
    
    // Save to DataPipe (primary)
    fetch(EXPERIMENT_CONFIG.dataPipe.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "*/*" },
      body: JSON.stringify({
        experimentID: EXPERIMENT_CONFIG.dataPipeId,
        filename: uniqueFilename,
        data: csvData,
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(`DataPipe API error: ${response.status} - ${text || 'No error text'}`); });
      }
      return response.json();
    })
    .then(result => console.log('DataPipe save successful:', result))
    .catch(error => {
      console.error('Error sending data to DataPipe:', error);
      console.log("Ensure data collection is enabled on DataPipe dashboard for ID: " + EXPERIMENT_CONFIG.dataPipeId);
    });
    
    // BACKUP: Save to multiple locations
    saveBackupData(csvData, uniqueFilename);
    
  } catch (error) {
    console.error("Error preparing data for DataPipe:", error);
  }
}

// Backup data saving function
function saveBackupData(csvData, filename) {
  // OPTION 1: Save to a Google Form (recommended - free and reliable)
  // Google Form backup
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd7LUiuy7p8uXMtz1PFxQuR6lXpBMimyd_TmE8Soxlb4TwTpQ/formResponse';
  const GOOGLE_FORM_FIELD = 'entry.1690017148';
  
  const formData = new FormData();
  // Add metadata to help identify submissions
  const dataWithMetadata = `Participant: ${experimentState.participantId}\nCondition: ${experimentState.condition}\nTimestamp: ${new Date().toISOString()}\nFilename: ${filename}\n\n${csvData}`;
  formData.append(GOOGLE_FORM_FIELD, dataWithMetadata);
  
  fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    mode: 'no-cors', // Required for Google Forms
    body: formData
  }).then(() => {
    console.log('Backup sent to Google Form');
  }).catch(error => {
    console.error('Google Form backup failed:', error);
  });
  
  // OPTION 2: Send to a webhook service (good for testing)
  // You can use webhook.site or requestbin.com to get a free endpoint
  /*
  const WEBHOOK_URL = 'https://webhook.site/YOUR_UNIQUE_URL';
  
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: filename,
      data: csvData,
      timestamp: new Date().toISOString(),
      participantId: experimentState.participantId
    })
  }).then(() => {
    console.log('Backup sent to webhook');
  }).catch(error => {
    console.error('Webhook backup failed:', error);
  });
  */
  
  // OPTION 3: Create downloadable file and save to localStorage
  // This creates a backup that participants can download if needed
  try {
    // Save to localStorage
    const backupKey = `experiment_backup_${experimentState.participantId}`;
    localStorage.setItem(backupKey, JSON.stringify({
      filename: filename,
      data: csvData,
      timestamp: new Date().toISOString(),
      participantId: experimentState.participantId,
      condition: experimentState.condition
    }));
    
    // Create downloadable blob
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Store the download URL in case we need it
    experimentState.backupDataUrl = url;
    experimentState.backupFilename = filename;
    
    console.log('Backup saved to localStorage and download prepared');
  } catch (error) {
    console.error('Local backup failed:', error);
  }
  
  // OPTION 4: Send to Formspree (free tier available)
  // Sign up at formspree.io to get an endpoint
  /*
  const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';
  
  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participantId: experimentState.participantId,
      filename: filename,
      data: csvData
    })
  }).then(() => {
    console.log('Backup sent to Formspree');
  }).catch(error => {
    console.error('Formspree backup failed:', error);
  });
  */
}

document.addEventListener('DOMContentLoaded', initExperiment);