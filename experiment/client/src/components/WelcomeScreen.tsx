import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md p-8 mb-8">
      <CardContent className="p-0">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary-dark">L2 English Sentence Listening Experiment</h1>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="mt-2 text-slate-600">Welcome to our study on language comprehension</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please ensure you are in a quiet environment and using <strong>headphones or earbuds</strong> for this experiment.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-center">Click "Start" when you're ready to begin.</p>
          
          <div className="flex justify-center">
            <Button 
              onClick={onStart}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center"
            >
              Start
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
