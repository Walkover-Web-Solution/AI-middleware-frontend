import React, { useState, useRef, useEffect } from 'react';
import { CircleAlertIcon, RocketIcon, SparklesIcon } from '@/components/Icons';
import { AGENT_SETUP_GUIDE_STEPS } from '@/utils/enums';
import { useCustomSelector } from '@/customHooks/customSelector';

const AgentSetupGuide = ({ params = {},apiKeySectionRef }) => {

  // Get API key from Redux store
  const { bridgeApiKey } = useCustomSelector((state) => {
    const service = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service;
    return {
      bridgeApiKey:state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.apikey_object_id?.[service === 'openai_response' ? 'openai' : service],
    };
  });

  const [isVisible, setIsVisible] = useState(!bridgeApiKey);
  const [showError, setShowError] = useState(false);
  const selectElement = apiKeySectionRef?.current?.querySelector('select');
  useEffect(() => {
    if (bridgeApiKey) {
      setShowError(false);
      if (apiKeySectionRef?.current) {
        const selectElement = apiKeySectionRef.current.querySelector('select');
        if (selectElement) {
          selectElement.style.borderColor = "";
        }
      }
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [bridgeApiKey, apiKeySectionRef]);
  const handleStart = () => {
    if (!bridgeApiKey) {
      setShowError(true);
      if (apiKeySectionRef?.current) {
        apiKeySectionRef.current.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const selectElement = apiKeySectionRef.current.querySelector('select');
          if (selectElement) {
            selectElement.focus();
            selectElement.style.borderColor = "red";
          }
        }, 300);
      }
      return;
    }
    setIsVisible(false);
  };


  if (!isVisible || bridgeApiKey) {
    if (selectElement) {
      selectElement.style.borderColor = ""
    }
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-base-100 overflow-hidden z-high" >
      <div className="card bg-base-100 w-full h-full shadow-xl">
        <div className="card-body p-6 h-full flex flex-col">

          {/* Header */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className="btn btn-primary btn-circle mb-3">
              <RocketIcon className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-bold text-base-content mb-2">
              Agent Setup Guide
            </h1>
            <p className="text-base-content/70 text-sm">
              Everything you need to create your AI agent
            </p>
          </div>

          {/* Steps Container */}
          <div className="flex-1 overflow-y-auto px-4 pt2">
            <div className="space-y-3">
              {AGENT_SETUP_GUIDE_STEPS?.map(({ step, title, detail, optional, icon }, index) => (
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
              ))}
            </div>
          </div>
          {/* Error Message */}
          {showError && (
            <div className="card bg-error shadow-sm mt-4 flex-shrink-1 mx-6 text-xs text-base-100">
              <div className="card-body p-2">
                <div className="flex items-start gap-3">
                  <div className={`btn btn-sm btn-circle transition-all duration-300 btn-ghost`}>
                    <CircleAlertIcon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-base-100 text-sm">
                      API Key Required
                      <br />
                      <span className="text-base-100/80">
                        Please add your API key to continue building
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
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

export default AgentSetupGuide;