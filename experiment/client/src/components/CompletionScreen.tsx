import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompletionScreenProps {
  onExit: () => void;
}

export default function CompletionScreen({ onExit }: CompletionScreenProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md p-8 mb-8">
      <CardContent className="p-0">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-primary-dark">Experiment Complete!</h1>
          <p className="mb-6 text-slate-600 max-w-md mx-auto">
            Thank you for participating in our study. You have successfully completed all 60 trials.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-slate-600">
              Your responses have been recorded. You may now close this window or press the button below to exit.
            </p>
          </div>
          
          <Button 
            onClick={onExit}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Exit Experiment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
