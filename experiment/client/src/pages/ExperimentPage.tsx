import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WelcomeScreen from "@/components/WelcomeScreen";
import InstructionScreen from "@/components/InstructionScreen";
import TrialScreen from "@/components/TrialScreen";
import CompletionScreen from "@/components/CompletionScreen";
import { apiRequest } from "@/lib/queryClient";
import { nanoid } from "nanoid";

// Experiment stages
enum ExperimentStage {
  WELCOME = "welcome",
  INSTRUCTIONS = "instructions",
  TRIAL = "trial",
  COMPLETION = "completion"
}

export default function ExperimentPage() {
  const [stage, setStage] = useState<ExperimentStage>(ExperimentStage.WELCOME);
  const [participantId, setParticipantId] = useState<string>("");
  const [condition, setCondition] = useState<string>("");

  // Fetch experiment configuration
  const { data: experimentConfig, isLoading, error } = useQuery({
    queryKey: ["/api/experiment-config"],
    staleTime: Infinity,
  });

  const handleStartExperiment = async () => {
    setStage(ExperimentStage.INSTRUCTIONS);
  };

  const handleBeginExperiment = async () => {
    try {
      // Randomly assign condition (single-talker or multiple-talker)
      const assignedCondition = Math.random() < 0.5 ? "single-talker" : "multiple-talker";
      setCondition(assignedCondition);

      // Create participant record
      const response = await apiRequest("POST", "/api/participants", {
        condition: assignedCondition
      });
      
      const participantData = await response.json();
      setParticipantId(participantData.participantId);
      
      // Move to trial stage
      setStage(ExperimentStage.TRIAL);
    } catch (error) {
      console.error("Error starting experiment:", error);
      // Continue anyway with a generated ID to not block the user experience
      setParticipantId(nanoid());
      setStage(ExperimentStage.TRIAL);
    }
  };

  const handleExperimentComplete = async () => {
    try {
      if (participantId) {
        await apiRequest("PATCH", `/api/participants/${participantId}/complete`, {});
      }
      setStage(ExperimentStage.COMPLETION);
    } catch (error) {
      console.error("Error completing experiment:", error);
      // Still show completion screen
      setStage(ExperimentStage.COMPLETION);
    }
  };

  const handleExit = () => {
    // Could redirect or do other cleanup here
    window.close();
  };

  // Show loading state if experiment config is loading
  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading experiment...</p>
        </div>
      </div>
    );
  }

  // Show error state if configuration failed to load
  if (error) {
    return (
      <div className="bg-slate-100 min-h-screen font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Experiment</h1>
          <p className="mb-4">There was a problem loading the experiment configuration. Please refresh the page or contact the researcher.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {stage === ExperimentStage.WELCOME && (
          <WelcomeScreen onStart={handleStartExperiment} />
        )}
        
        {stage === ExperimentStage.INSTRUCTIONS && (
          <InstructionScreen onBegin={handleBeginExperiment} />
        )}
        
        {stage === ExperimentStage.TRIAL && experimentConfig && (
          <TrialScreen 
            config={experimentConfig} 
            condition={condition}
            participantId={participantId}
            onComplete={handleExperimentComplete}
          />
        )}
        
        {stage === ExperimentStage.COMPLETION && (
          <CompletionScreen onExit={handleExit} />
        )}
      </div>
    </div>
  );
}
