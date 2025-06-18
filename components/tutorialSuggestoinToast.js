
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateUserMetaOnboarding } from "@/store/action/orgAction";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const TutorialSuggestionToast = ({setTutorialState,flagKey}) => {
   const dispatch=useDispatch()
  const { currentUser } = useCustomSelector((state) => ({
        currentUser: state.userDetailsReducer?.userDetails
      }));
  const [timeLeft, setTimeLeft] = useState(10);
  const handleTutorialSuggestionYes = () => {
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: false,
      showTutorial: true
    }));
  };

   const handleTutorialSuggestionCancel = async () => {
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: false
    }));
    await handleVideoEnd();
  };

   const handleVideoEnd = async () => {
    try {
      setTutorialState(prev => ({
        ...prev,
        showTutorial: false
      }));
      
      const updatedOrgDetails = {
        ...currentUser,
        meta: {
          ...currentUser?.meta,
          onboarding: {
            ...currentUser?.meta?.onboarding,
            [flagKey]: false,
          },
        },
      };
      
      await dispatch(updateUserMetaOnboarding(currentUser.id, updatedOrgDetails));
    } catch (error) {
      console.error("Failed to update user onboarding:", error);
    }
  };
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTutorialSuggestionCancel();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

 

  const progressPercentage = ((10- timeLeft) / 10) * 100;
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="fixed top-2 right-2 z-[99999999] animate-in slide-in-from-top-2 duration-500">
      <div className="bg-base-content text-white rounded-lg shadow-lg p-4 max-w-xs relative overflow-hidden">
        {/* Timer Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              Welcome! 
              <span className="text-sm">🚀</span>
            </h3>
            <p className="text-white text-xs mb-2">
              Take a quick tutorial to get started?
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleTutorialSuggestionYes}
              className="bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-1.5 rounded text-xs transition-all duration-200 flex items-center gap-1"
            >
              <Play className="h-3 w-3" fill="currentColor" />
              Yes
            </button>
            <button
              onClick={handleTutorialSuggestionCancel}
              className="bg-black/20 hover:bg-black/30 text-white hover:text-white px-3 py-1.5 rounded text-xs transition-all duration-200"
            >
              Skip
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-1 text-xs text-white mt-2">
          <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
          Auto-skip in {timeLeft}s
        </div>
      </div>
    </div>
  );
};
export default TutorialSuggestionToast;