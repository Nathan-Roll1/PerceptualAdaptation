import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InstructionScreenProps {
  onBegin: () => void;
}

export default function InstructionScreen({ onBegin }: InstructionScreenProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md p-8 mb-8">
      <CardContent className="p-0">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary-dark">Instructions</h1>
        
        <div className="space-y-6 max-w-2xl mx-auto">
          <ol className="space-y-6 list-none">
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">1</div>
              <div>
                <p>You will hear sentences mixed with background noise one at a time.</p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">2</div>
              <div>
                <p>Type exactly what you hear using your keyboard. If you're not sure about a word, make your best guess.</p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">3</div>
              <div>
                <p>After typing your response, click the "Next" button to move to the next sentence.</p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">4</div>
              <div>
                <p>Each sentence will play automatically. You can replay each sentence once by clicking on the play button. After replaying, the button will turn gray indicating you've used your replay option.</p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">5</div>
              <div>
                <p>No feedback will be given on the correctness of your responses.</p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">6</div>
              <div>
                <p>The experiment consists of 60 sentences and will take approximately 20-25 minutes to complete.</p>
              </div>
            </li>
          </ol>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Remember to keep your headphones on throughout the entire experiment and to stay in a quiet environment.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              onClick={onBegin}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              Begin Experiment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
