import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { initJsPsych } from "@/lib/jspsych";
import { useToast } from "@/hooks/use-toast";

interface TrialScreenProps {
  config: {
    totalTrials: number;
    singleTalkerFiles: string[][];
    multipleTalkerFiles: string[];
    talkerIds: string[];
  };
  condition: string;
  participantId: string;
  onComplete: () => void;
}

export default function TrialScreen({ config, condition, participantId, onComplete }: TrialScreenProps) {
  const [currentTrial, setCurrentTrial] = useState(1);
  const [userResponse, setUserResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioFile, setCurrentAudioFile] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const jsPsychRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize jsPsych
  useEffect(() => {
    jsPsychRef.current = initJsPsych({
      on_finish: onComplete
    });
    
    // Initialize audio element
    audioRef.current = new Audio();
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Determine audio files based on condition
  useEffect(() => {
    if (!config || !condition) return;
    
    let selectedFiles: string[] = [];
    
    if (condition === "single-talker") {
      // Randomly select one talker for all 60 trials
      const talkerIndex = Math.floor(Math.random() * config.singleTalkerFiles.length);
      selectedFiles = config.singleTalkerFiles[talkerIndex] || [];
      console.log("Single talker files:", selectedFiles);
    } else {
      // Use files from 3 different talkers
      selectedFiles = config.multipleTalkerFiles || [];
      console.log("Multiple talker files:", selectedFiles);
    }
    
    setAudioFiles(selectedFiles);
    
    // Set the first audio file if available
    if (selectedFiles.length > 0) {
      loadNextAudio(selectedFiles[0]);
    } else {
      console.error("No audio files available for this condition");
    }
  }, [config, condition]);

  const loadNextAudio = (audioFile: string) => {
    if (!audioFile) {
      console.error("No audio file provided");
      return;
    }
    
    if (!audioRef.current) {
      console.error("Audio element not initialized");
      return;
    }
    
    // Reset audio state for new trial
    setCurrentAudioFile(audioFile);
    setAudioPlayed(false);
    console.log("Loading audio file:", audioFile);
    
    // Make sure the audio file path is absolute from the server root
    const audioSrc = audioFile.startsWith('/') ? audioFile : `/${audioFile}`;
    console.log("Setting audio source:", audioSrc);
    audioRef.current.src = audioSrc;
    audioRef.current.load();
    
    // Set up event listeners
    audioRef.current.oncanplaythrough = () => {
      console.log("Audio can play through, starting playback");
      playAudio();
    };
    
    audioRef.current.onended = () => {
      console.log("Audio playback ended");
      setIsPlaying(false);
      // Don't mark as fully played after first automatic play
      // This allows one more manual replay
    };
    
    // Error handling for audio loading/playback
    audioRef.current.onerror = (event) => {
      console.error("Audio error:", event);
      console.error("Error details:", audioRef.current?.error);
      
      // Mark as played even if there was an error, so user can continue
      setIsPlaying(false);
      setAudioPlayed(true);
      setStartTime(Date.now());
      
      // Show a toast notification about the audio issue
      toast({
        title: "Audio Issue",
        description: "There was an issue playing the audio. Please continue with the experiment.",
        variant: "destructive"
      });
    };
  };

  const playAudio = () => {
    if (!audioRef.current) return;
    
    setIsPlaying(true);
    setStartTime(Date.now());
    
    try {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio started playing successfully");
          })
          .catch(error => {
            console.error("Failed to play audio:", error);
            setIsPlaying(false);
            setAudioPlayed(true);
            // Still set start time to allow user to proceed
            setStartTime(Date.now());
            
            toast({
              title: "Playback Failed",
              description: "There was an issue playing the audio. Please continue with the experiment.",
              variant: "destructive"
            });
          });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setAudioPlayed(true);
      // Still set start time to allow user to proceed
      setStartTime(Date.now());
      
      toast({
        title: "Playback Error",
        description: "There was an issue playing the audio. Please continue with the experiment.",
        variant: "destructive"
      });
    }
  };

  const handleResponseInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserResponse(e.target.value);
  };

  const handleNextTrial = async () => {
    try {
      // Save current response
      const responseTime = Date.now() - startTime;
      
      await apiRequest("POST", "/api/responses", {
        participantId,
        trialNum: currentTrial,
        audioFile: currentAudioFile,
        response: userResponse,
        responseTime
      });
      
      // Check if experiment is complete
      if (currentTrial >= config.totalTrials) {
        onComplete();
        return;
      }
      
      // Move to next trial
      const nextTrialNum = currentTrial + 1;
      setCurrentTrial(nextTrialNum);
      setUserResponse("");
      
      // Get next audio file
      if (audioFiles.length > 0 && nextTrialNum <= audioFiles.length) {
        loadNextAudio(audioFiles[nextTrialNum - 1]);
      } else {
        console.error("No audio file available for trial", nextTrialNum);
        // Still advance the trial even if there's no audio
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("Error saving response:", error);
      
      // Continue with experiment anyway to not block user
      if (currentTrial >= config.totalTrials) {
        onComplete();
        return;
      }
      
      const nextTrialNum = currentTrial + 1;
      setCurrentTrial(nextTrialNum);
      setUserResponse("");
      
      // Get next audio file
      if (audioFiles.length > 0 && nextTrialNum <= audioFiles.length) {
        loadNextAudio(audioFiles[nextTrialNum - 1]);
      } else {
        console.error("No audio file available for trial", nextTrialNum);
        // Still advance the trial
        setStartTime(Date.now());
      }
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-8 mb-8">
      <CardContent className="p-0">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Progress</span>
            <span className="text-sm font-medium text-slate-600">{currentTrial}/{config.totalTrials}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${(currentTrial / config.totalTrials) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Audio Player Section */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-md ${audioPlayed ? 'bg-slate-400' : 'bg-primary'} 
              ${!isPlaying && !audioPlayed ? 'cursor-pointer hover:opacity-90' : ''}`}
            onClick={() => {
              // Allow replay only if not playing and not already marked as played
              if (!isPlaying && !audioPlayed && audioRef.current) {
                playAudio();
                // After manual replay, mark as played when finished
                audioRef.current.onended = () => {
                  console.log("Manual replay ended");
                  setIsPlaying(false);
                  setAudioPlayed(true); // NOW mark as played after manual replay
                };
              }
            }}
          >
            {!isPlaying ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                id="play-icon"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                  clipRule="evenodd" 
                />
              </svg>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-8 bg-white animate-pulse rounded-full"></div>
                <div className="w-1 h-5 bg-white animate-pulse rounded-full" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-1 h-7 bg-white animate-pulse rounded-full" style={{ animationDelay: "0.4s" }}></div>
                <div className="w-1 h-4 bg-white animate-pulse rounded-full" style={{ animationDelay: "0.6s" }}></div>
              </div>
            )}
            {audioPlayed && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-400 bg-opacity-60">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white opacity-80" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
          </div>
          {!audioPlayed && !isPlaying && (
            <p className="text-xs text-slate-500 mt-2">Click to play again</p>
          )}
        </div>
        
        <p className="text-center text-sm text-slate-500 mb-6">
          {isPlaying 
            ? "Listening... please wait for the audio to finish" 
            : currentAudioFile 
              ? audioPlayed
                ? "Audio played twice. Please type what you heard."
                : "Audio played once. You can replay it once more by clicking the button above."
              : "Audio will play automatically. Please listen carefully."}
        </p>
        
        {/* Response Input Section */}
        <div className="mb-8">
          <label htmlFor="response-input" className="block text-sm font-medium text-slate-700 mb-2">Type what you heard:</label>
          <Textarea
            id="response-input"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            placeholder="Enter the sentence you heard..."
            value={userResponse}
            onChange={handleResponseInput}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleNextTrial}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
