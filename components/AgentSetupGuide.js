import React, { useState, useEffect } from 'react';
import { CircleAlertIcon, RocketIcon, SparklesIcon } from '@/components/Icons';
import { AGENT_SETUP_GUIDE_STEPS, AVAILABLE_MODEL_TYPES } from '@/utils/enums';
import { useCustomSelector } from '@/customHooks/customSelector';
import Protected from './protected';

const AgentSetupGuide = ({ params = {}, apiKeySectionRef, promptTextAreaRef, isEmbedUser, searchParams }) => {
  const { bridgeApiKey, prompt,shouldPromptShow,service, showDefaultApikeys } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
    const service = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service;
    const modelReducer = state?.modelReducer?.serviceModels;
    const serviceName = versionData?.service;
    const modelTypeName = versionData?.configuration?.type?.toLowerCase();
    const modelName = versionData?.configuration?.model;
    const showDefaultApikeys = state.appInfoReducer.embedUserDetails.addDefaultApiKeys;
    return {
      bridgeApiKey: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.apikey_object_id?.[service],
      prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt || "",
      shouldPromptShow:  modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,
      service: service,
      showDefaultApikeys
   };
  });
  const [isVisible, setIsVisible] = useState((isEmbedUser && showDefaultApikeys)? false :(!bridgeApiKey || (prompt === "" && shouldPromptShow)) && (service !== 'ai_ml'||prompt===""))
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState('');
  const resetBorder = (ref, selector) => {
    if (ref?.current) {
      const element = ref.current.querySelector(selector);
      if (element) {
        element.style.borderColor = "";
      }
    }
  };

  const setErrorBorder = (ref, selector, scrollToView = false) => {
    if (ref?.current) {
      if (scrollToView) {
        ref.current.scrollIntoView({ behavior: 'smooth'  });
      }
      setTimeout(() => {
        const element = ref.current.querySelector(selector);
        if (element) {
          element.focus();
          element.style.borderColor = "red";
        }
      }, 300);
    }
  };

  useEffect(() => {
    if(isEmbedUser && showDefaultApikeys)
    {
      setIsVisible(false);
      return;
    }
    const hasPrompt =( prompt !== ""||(!shouldPromptShow)||(promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim()!==""));
    const hasApiKey = !!bridgeApiKey;
     if(!shouldPromptShow){
      setShowError(false)
      }
    if (hasPrompt) {
      resetBorder(promptTextAreaRef, 'textarea');
    }
    
    if (hasApiKey) {
      resetBorder(apiKeySectionRef, 'select');
    }
    
    // Hide guide if: 
    // 1. It's AI ML service OR
    // 2. Default AI ML key is selected OR
    // 3. Both prompt and API key are provided
    if ((service === 'ai_ml'&&hasPrompt) || (hasPrompt && hasApiKey)) {
      setIsVisible(false);
      setShowError(false);
      setErrorType('');
    } else {
      setIsVisible(true);
    }
  }, [bridgeApiKey, prompt, apiKeySectionRef, promptTextAreaRef, shouldPromptShow,service, showDefaultApikeys]);

  const handleStart = () => {
    if(isEmbedUser && showDefaultApikeys)
    {
      setIsVisible(false);
      return;
    }
    if ((shouldPromptShow)&&(promptTextAreaRef.current &&prompt === ""&&promptTextAreaRef.current.querySelector('textarea').value.trim()==="") ){
      setShowError(true);
      setErrorType('prompt');
      setErrorBorder(promptTextAreaRef, 'textarea', true);
      return;
    }
    if (!bridgeApiKey) {
      setShowError(true);
      setErrorType('apikey');
      setErrorBorder(apiKeySectionRef, 'button', true);
      return;
    }
    
    
    setIsVisible(false);
  };
 
  if (!isVisible || ((bridgeApiKey && prompt !== ""))) {
    resetBorder(promptTextAreaRef, 'textarea');
    resetBorder(apiKeySectionRef, 'select');
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-base-100 overflow-hidden z-very-high">
      <div className="card bg-base-100 w-full h-full shadow-xl">
        <div className="card-body p-6 h-full flex flex-col">
          <div className="text-center mb-4 flex-shrink-0">
            <div className="btn btn-primary btn-sm btn-circle mb-3">
              <RocketIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2">
              Agent Setup Guide
            </h1>
            <p className="text-base-content/70 text-sm">
              Everything you need to create your AI agent
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt2">
            <div className="space-y-3">
              {AGENT_SETUP_GUIDE_STEPS?.map(({ step, title, detail, optional, icon }, index) => {
                if ((step === '1'||step==='2') && !shouldPromptShow) {
                  return null;
                }

                return (
                  <div
                    key={step}
                    className={`card bg-base-200 shadow-sm transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="card-body p-2">
                      <div className="flex items-start gap-3">
                        <div className={`btn btn-sm btn-circle transition-all duration-300 btn-ghost`}>
                          <span className="text-sm">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base-content text-sm mt-1">
                              {title}
                            </h3>
                            {optional && (
                              <div className="badge badge-primary badge-sm">
                                Optional
                              </div>
                            )}
                          </div>
                          <p className="text-base-content/70 text-sm mb-2">
                            {detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>      
          
          {showError && (
            <div className="card bg-error shadow-sm mt-4 flex-shrink-1 mx-6 text-xs text-base-100">
              <div className="card-body p-2">
                <div className="flex items-start gap-3">
                  <div className={`btn btn-sm btn-circle transition-all duration-300 btn-ghost`}>
                    <CircleAlertIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base-100 text-sm">
                      {errorType === 'prompt' ? 'Prompt Required' : 'API Key Required'}
                      <br />
                      <span className="text-base-100/80">
                        {errorType === 'prompt' 
                          ? 'Please add a prompt to continue building your agent' 
                          : 'Please add your API key to continue building'
                        }
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-6 flex-shrink-0">
            <button
              onClick={handleStart}
              className="btn btn-primary btn-lg gap-2"
            >
              Get Started
              <SparklesIcon className="h-4 w-4" />
            </button>
            <p className="text-xs text-base-content/60 mt-3">
              Follow these steps to create your agent successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protected(AgentSetupGuide);