// Experiment.js:
// Main experiment script

// Get DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const trialScreen = document.getElementById('trial-screen');
const completionScreen = document.getElementById('completion-screen');

const startButton = document.getElementById('start-button');
const beginButton = document.getElementById('begin-button');
const nextButton = document.getElementById('next-button');
const exitButton = document.getElementById('exit-button');
const playButton = document.getElementById('play-button'); // Keep reference, but will be disabled

const conditionSelect = document.getElementById('condition-select');
const currentTrialSpan = document.getElementById('current-trial');
const totalTrialsSpan = document.getElementById('total-trials');
const progressBar = document.getElementById('progress-bar');
const responseInput = document.getElementById('response-input');
const audioPlayer = document.getElementById('audio-player');
const audioStatus = document.getElementById('audio-status');
const trialFeedback = document.getElementById('trial-feedback');

// Experiment state
let experimentState = {
  participantId: null,
  condition: null,
  currentTrial: 0,
  totalTrials: EXPERIMENT_CONFIG.totalTrials,
  stimuli: [],
  responses: [],
  audioPlayedThisTrial: false, // Renamed for clarity
  startTime: null,
  trialStartTime: null
};

// Screen transition function (no changes needed)
function showScreen(screenToShow) {
  // Hide all screens
  [welcomeScreen, instructionsScreen, trialScreen, completionScreen].forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  // Show the requested screen with animation
  screenToShow.style.display = 'flex';

  // Force a reflow to ensure the animation works
  void screenToShow.offsetWidth;

  // Add the active class to trigger animation
  screenToShow.classList.add('active');
}

// Initialize the application
function initExperiment() {
  // Update the total trials display
  totalTrialsSpan.textContent = experimentState.totalTrials;

  // Add event listeners
  startButton.addEventListener('click', startExperiment);
  beginButton.addEventListener('click', beginTrials);
  nextButton.addEventListener('click', nextTrial);
  exitButton.addEventListener('click', exitExperiment);
  // REMOVED: playButton event listener - it will not be clickable

  // Enable enter key for next button
  responseInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && !nextButton.disabled) {
      e.preventDefault(); // Prevent default to avoid newline
      nextTrial();
    }
  });

  // Response input changes
  responseInput.addEventListener('input', function() {
    // Enable next button when there's text in the input
    nextButton.disabled = responseInput.value.trim().length === 0;
  });

  // Audio player events
  audioPlayer.addEventListener('ended', handleAudioEnded);
  audioPlayer.addEventListener('error', handleAudioError);

  // Show welcome screen
  showScreen(welcomeScreen);

  // Load data from localStorage if experiment was in progress
  loadExperimentState();
}

// Start the experiment (from welcome screen) (no changes needed)
function startExperiment() {
  // Get condition selection
  experimentState.condition = conditionSelect.value;

  // Generate a participant ID
  experimentState.participantId = generateParticipantId();

  // Prepare stimuli based on condition
  prepareStimuli();

  // Record start time
  experimentState.startTime = new Date().toISOString();

  // Save initial experiment state
  saveExperimentState();

  // Show instructions screen
  showScreen(instructionsScreen);
}

// Begin the trials (from instructions screen) (no changes needed)
function beginTrials() {
  // Show trial screen
  showScreen(trialScreen);

  // Start first trial
  startTrial();
}

// Start a specific trial
function startTrial() {
  // Update trial counter and progress bar
  currentTrialSpan.textContent = experimentState.currentTrial + 1;
  updateProgressBar();

  // Reset trial state
  experimentState.audioPlayedThisTrial = false; // Reset flag for this trial
  experimentState.trialStartTime = new Date().toISOString();

  // Clear response input and feedback
  responseInput.value = '';
  trialFeedback.textContent = '';

  // Disable next button until a response is entered
  nextButton.disabled = true;

  // Reset and PERMANENTLY disable play button for this trial
  playButton.disabled = true; // Always disabled now
  audioStatus.textContent = 'Audio will play automatically shortly...';

  // Load and schedule audio play after 500ms delay
  setTimeout(() => {
    // Check if we are still on the same trial (user hasn't quickly skipped)
    // This isn't strictly necessary with the current flow but good practice
    if (currentTrialSpan.textContent == experimentState.currentTrial + 1) {
        loadAudio(experimentState.stimuli[experimentState.currentTrial]);
    }
  }, 500); // *** CHANGED DELAY TO 500ms ***
}

// Load audio file (triggers automatic play when ready)
function loadAudio(audioFile) {
  // Set audio source
  audioPlayer.src = audioFile;

  // Show loading message
  audioStatus.textContent = 'Loading audio...';

  try {
    // Load audio file
    audioPlayer.load();

    // Play when ready (oncanplaythrough is usually reliable)
    audioPlayer.oncanplaythrough = function() {
      // Check if audio hasn't already been played for this trial (e.g., due to event firing multiple times)
      // And also check if we are still logically on this trial
      if (!experimentState.audioPlayedThisTrial && currentTrialSpan.textContent == experimentState.currentTrial + 1) {
          audioStatus.textContent = 'Playing audio...';
          playAudioElement();
          audioPlayer.oncanplaythrough = null; // Prevent potential multiple calls
      }
    };
    // Fallback: if oncanplaythrough doesn't fire quickly, 'loadeddata' might
     audioPlayer.onloadeddata = function() {
        if (!experimentState.audioPlayedThisTrial && currentTrialSpan.textContent == experimentState.currentTrial + 1 && audioPlayer.readyState >= 2) { // Check readyState
            audioStatus.textContent = 'Playing audio...';
            playAudioElement();
            audioPlayer.onloadeddata = null; // Prevent multiple calls
        }
     };


  } catch (error) {
    console.error('Error loading audio:', error);
    audioStatus.textContent = 'Error loading audio. Please try refreshing the page.';
    playButton.disabled = true; // Ensure button stays disabled on error
  }
}

// Play the audio element (called automatically)
function playAudioElement() {
  const playPromise = audioPlayer.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Audio playback started successfully
      experimentState.audioPlayedThisTrial = true; // Mark as played for this trial
      playButton.disabled = true; // Ensure it remains disabled
      // Status is updated by loadAudio or handleAudioEnded
    }).catch(error => {
      // Auto-play was prevented
      console.error('Audio auto-play prevented:', error);
      // *** CHANGED BEHAVIOR: Inform user, keep button disabled ***
      audioStatus.textContent = 'Audio auto-play failed by browser. Please check browser settings or contact support.';
      playButton.disabled = true; // Keep disabled
      // Optionally, provide instructions or fail the trial
      // For now, the user can still proceed once they type a response
      responseInput.focus(); // Allow user to respond even if audio failed
    });
  } else {
      // Fallback for browsers that don't return a promise
      experimentState.audioPlayedThisTrial = true;
      playButton.disabled = true;
  }
}

// REMOVED: playAudio function - no manual play needed

// Handle audio playback end
function handleAudioEnded() {
  // *** SIMPLIFIED: No replay logic needed ***
  playButton.disabled = true; // Ensure button remains disabled
  audioStatus.textContent = 'Audio finished.'; // Update status

  // Focus on the response input
  responseInput.focus();
}

// Handle audio errors
function handleAudioError(e) {
  console.error('Audio error:', e);
  // *** SIMPLIFIED: Keep button disabled ***
  audioStatus.textContent = 'Error playing audio. Please try refreshing or contact support.';
  playButton.disabled = true; // Ensure button stays disabled
}

// Advance to the next trial
function nextTrial() {
  // Save response
  const response = {
    participantId: experimentState.participantId,
    trial: experimentState.currentTrial + 1,
    condition: experimentState.condition,
    stimulus: experimentState.stimuli[experimentState.currentTrial],
    response: responseInput.value.trim(),
    // REMOVED: replayUsed tracking
    startTime: experimentState.trialStartTime,
    endTime: new Date().toISOString(),
    audioPlayedSuccessfully: experimentState.audioPlayedThisTrial // Track if audio played
  };

  experimentState.responses.push(response);

  // Increment trial counter
  experimentState.currentTrial++;

  // Save experiment state
  saveExperimentState();

  // Check if experiment is complete
  if (experimentState.currentTrial >= experimentState.totalTrials) {
    completeExperiment();
  } else {
    // Start next trial
    startTrial();
  }
}

// Complete the experiment (no changes needed here, unless you want to add final audio status)
function completeExperiment() {
  // Update experiment completion status
  const completionData = {
    participantId: experimentState.participantId,
    condition: experimentState.condition,
    completionTime: new Date().toISOString()
  };

  // Log completion data for retrieval
  console.log('Experiment completed!', {
    participant: completionData,
    responses: experimentState.responses
  });

  // Save data to localStorage
  saveExperimentData();

  // Clear experiment state
  clearExperimentState();

  // Show completion screen
  showScreen(completionScreen);
}

// Exit the experiment (no changes needed)
function exitExperiment() {
  // Return to welcome screen
  showScreen(welcomeScreen);

  // Reset experiment state
  resetExperiment();
}

// Reset experiment to initial state
function resetExperiment() {
  // Reset experiment state
  experimentState = {
    participantId: null,
    condition: null,
    currentTrial: 0,
    totalTrials: EXPERIMENT_CONFIG.totalTrials,
    stimuli: [],
    responses: [],
    audioPlayedThisTrial: false, // Use new flag name
    // REMOVED: replayAvailable, replayUsed
    startTime: null,
    trialStartTime: null
  };

  // Reset UI elements
  conditionSelect.value = 'single-talker';
  responseInput.value = '';
  trialFeedback.textContent = '';
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  playButton.disabled = true; // Ensure play button starts disabled

  // Clear any saved in-progress experiment
  clearExperimentState();
}

// Update progress bar (no changes needed)
function updateProgressBar() {
  const progress = Math.round((experimentState.currentTrial / experimentState.totalTrials) * 100);
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${progress}%`;
}

// Prepare stimuli based on condition (no changes needed)
function prepareStimuli() {
  // ... (keep existing logic) ...
   if (experimentState.condition === 'single-talker') {
    // Select a random talker (index into the singleTalkerFiles array)
    const talkerIndex = Math.floor(Math.random() * EXPERIMENT_CONFIG.singleTalkerFiles.length);
    experimentState.stimuli = EXPERIMENT_CONFIG.singleTalkerFiles[talkerIndex];
  } else {
    // Multiple-talker condition
    experimentState.stimuli = EXPERIMENT_CONFIG.multipleTalkerFiles;

    // If we don't have enough files, repeat them
    while (experimentState.stimuli.length < experimentState.totalTrials) {
      experimentState.stimuli = experimentState.stimuli.concat(
        EXPERIMENT_CONFIG.multipleTalkerFiles.slice(
          0,
          Math.min(EXPERIMENT_CONFIG.multipleTalkerFiles.length, experimentState.totalTrials - experimentState.stimuli.length)
        )
      );
    }

    // Limit to the required number of trials
    experimentState.stimuli = experimentState.stimuli.slice(0, experimentState.totalTrials);
  }
}

// Helper function to generate a participant ID (no changes needed)
function generateParticipantId() {
  return 'participant-' + Math.random().toString(36).substring(2, 15) +
    '-' + new Date().toISOString().replace(/[-:.]/g, '');
}

// Save experiment state to localStorage
function saveExperimentState() {
  // Make sure to clean up old replay flags if loading state from older versions
  const stateToSave = { ...experimentState };
  delete stateToSave.replayAvailable; // Remove if exists
  delete stateToSave.replayUsed;     // Remove if exists
  localStorage.setItem('experimentState', JSON.stringify(stateToSave));
}

// Load experiment state from localStorage
function loadExperimentState() {
  const savedState = localStorage.getItem('experimentState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);

      // Check if experiment is in progress
      if (parsedState && parsedState.currentTrial < parsedState.totalTrials) {
        if (confirm('You have an experiment in progress. Would you like to resume from where you left off?')) {
          // Restore state, ensuring removed flags aren't carried over
           experimentState = {
              ...parsedState,
              audioPlayedThisTrial: false // Always reset this on load/resume
              // Replay flags are implicitly removed as they are not in the base definition anymore
           };
           // Remove potentially lingering old replay flags from the loaded object itself
           delete experimentState.replayAvailable;
           delete experimentState.replayUsed;


          // If experiment was already started, skip to trial screen
          if (experimentState.currentTrial > 0) {
            showScreen(trialScreen);
            startTrial(); // Start the trial logic (will disable button, schedule audio)
          } else {
             // If resuming at trial 0, still need to trigger the start sequence correctly
             showScreen(instructionsScreen); // Go back to instructions to ensure clean start? Or directly to trial?
             // Let's assume direct to trial if they resume
             // showScreen(trialScreen);
             // startTrial();
             // Safer: go to instructions, user clicks Begin Trials again
             // Let's stick to the original logic flow for now:
             // If they were truly mid-trial, it should have saved currentTrial > 0
             // If currentTrial is 0, they likely hadn't started trials yet.
             // This part might need adjustment based on EXACT resume requirements.
             // The code above jumps directly to trial if currentTrial > 0.
          }
        } else {
          // Clear saved state if user chooses not to resume
          clearExperimentState();
        }
      } else {
        // Clear state if experiment was already completed or invalid
        clearExperimentState();
      }
    } catch (error) {
      console.error('Error loading saved experiment state:', error);
      clearExperimentState();
    }
  }
}


// Clear experiment state from localStorage (no changes needed)
function clearExperimentState() {
  localStorage.removeItem('experimentState');
}

// Save experiment data to localStorage (Added audioPlayedSuccessfully)
function saveExperimentData() {
  // Get existing data
  const existingData = JSON.parse(localStorage.getItem('experimentData') || '[]');

  // Add current experiment data
  // Ensure responses include the new audioPlayedSuccessfully flag
  const currentResponses = experimentState.responses.map(r => ({
      ...r, // Include all existing fields
      audioPlayedSuccessfully: r.audioPlayedSuccessfully // Make sure it's included
  }));

  existingData.push({
    participantId: experimentState.participantId,
    condition: experimentState.condition,
    startTime: experimentState.startTime,
    completionTime: new Date().toISOString(),
    responses: currentResponses // Use potentially updated responses array
  });

  // Save updated data
  localStorage.setItem('experimentData', JSON.stringify(existingData));

  // Log data to console for retrieval
  console.log('All experiment data:', existingData);
}


// Data export function (no changes needed)
function exportExperimentData() {
    // ... (keep existing logic) ...
    const data = localStorage.getItem('experimentData');
    if (!data) {
        alert('No experiment data found to export.');
        return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment-data-' + new Date().toISOString().substring(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the experiment when the page loads
document.addEventListener('DOMContentLoaded', initExperiment);