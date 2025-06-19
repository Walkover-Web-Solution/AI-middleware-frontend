import { useCustomSelector } from "@/customHooks/customSelector";
import { updateUserMetaOnboarding } from "@/store/action/orgAction";
import { TUTORIALS } from "@/utils/enums";
import { Play, X, Clock } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

const TIMER_DURATION = 10;

const TutorialSuggestionToast = ({ setTutorialState, flagKey, TutorialDetails }) => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  // Memoize current user selection to prevent unnecessary re-renders
  const currentUser = useCustomSelector(state => state.userDetailsReducer?.userDetails);

  // Memoize tutorial lookup
  const currentTutorial = useMemo(() => 
    TUTORIALS.find(tutorial => tutorial.title === TutorialDetails),
    [TutorialDetails]
  );

  // Memoize progress calculation
  const progressPercentage = useMemo(() => 
    ((TIMER_DURATION - timeLeft) / TIMER_DURATION) * 100,
    [timeLeft]
  );

  // Memoized handler for updating user meta
  const updateUserMeta = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const updatedUserDetails = {
        ...currentUser,
        meta: {
          ...currentUser.meta,
          onboarding: {
            ...currentUser.meta?.onboarding,
            [flagKey]: false,
          },
        },
      };

      await dispatch(updateUserMetaOnboarding(currentUser.id, updatedUserDetails));
    } catch (error) {
      console.error("Failed to update user onboarding:", error);
    }
  }, [currentUser, flagKey, dispatch]);

  // Unified tutorial handler
  const handleTutorialAction = useCallback(async (action) => {
    const shouldShowTutorial = action === 'start';
    
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: false,
      showTutorial: shouldShowTutorial
    }));

    // Only update user meta when skipping
    if (action === 'skip') {
      await updateUserMeta();
    }
  }, [setTutorialState, updateUserMeta]);

  // Timer effect with cleanup
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTutorialAction('skip');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleTutorialAction]);

  // Early return if no tutorial found
  if (!currentTutorial) {
    console.warn(`Tutorial not found: ${TutorialDetails}`);
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="card w-80 bg-base-100 shadow-xl border border-base-300 animate-in slide-in-from-top-2 duration-300">
        {/* Progress indicator */}
        <div className="w-full h-1 bg-base-300 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="card-body p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg" role="img" aria-label="target">🎯</span>
              </div>
              <h3 className="card-title text-base font-semibold text-base-content">
                Welcome!
              </h3>
            </div>
            <button 
              onClick={() => handleTutorialAction('skip')}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Close tutorial suggestion"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-sm text-base-content">
              {currentTutorial.title}
            </h4>
            <p className="text-xs text-base-content/70 leading-relaxed">
              {currentTutorial.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => handleTutorialAction('start')}
              className="btn btn-primary btn-sm flex-1 gap-1"
              aria-label="Start tutorial"
            >
              <Play className="h-3 w-3" fill="currentColor" />
              Start Tutorial
            </button>
            <button
              onClick={() => handleTutorialAction('skip')}
              className="btn btn-ghost btn-sm"
              aria-label="Skip tutorial"
            >
              Skip
            </button>
          </div>

          {/* Timer indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-base-content/60">
            <Clock className="h-3 w-3" />
            <span>Auto-skip in {timeLeft}s</span>
            <div className="flex gap-1" role="presentation">
              {[0, 0.2, 0.4].map((delay, index) => (
                <div 
                  key={index}
                  className="w-1 h-1 bg-base-content/40 rounded-full animate-pulse" 
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialSuggestionToast;