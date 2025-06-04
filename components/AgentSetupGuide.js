import React, { useState } from 'react';
import { AlertCircle, Rocket } from 'lucide-react';
import { useCustomSelector } from '@/customHooks/customSelector';

const AgentSetupGuide = ({ params }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showError, setShowError] = useState(false);
  const [hideCard, setHideCard] = useState(false);

  // Get API key from Redux store
  const { bridgeApiKey } = useCustomSelector((state) => {
    const service =
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service;
    return {
      bridgeApiKey:
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]
          ?.apikey_object_id?.[service === 'openai_response' ? 'openai' : service],
    };
  });

  const handleStart = () => {
    if (!bridgeApiKey) {
      setShowError(true);
      return;
    }

    setIsVisible(false);
    setTimeout(() => setHideCard(true), 300);
  };

  if ( bridgeApiKey||hideCard) return null;

  return (
    <div
      className={`absolute inset-0 h-full w-full bg-white flex items-center justify-center bg-base-200 z-[999999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 p-4 rounded-full">
            <Rocket className="h-12 w-12 text-black" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Let’s Get Started</h2>
        <p className="text-gray-600 text-center mb-6">
          Follow these simple steps to set up your AI Agent
        </p>

        {/* Steps */}
        <ul className="space-y-4 mb-6">
          {[
            { step: '1', title: 'Enter your prompt', detail: 'Describe the task for your agent' },
            {
              step: '2',
              title: 'Connect a function',
              detail: 'Add external capability',
              optional: true,
            },
            {
              step: '3',
              title: 'Select a service',
              detail: 'Choose an AI provider',
              optional: true,
            },
            {
              step: '4',
              title: 'Choose a model',
              detail: 'Pick the model for responses',
              optional: true,
            },
            {
              step: '5',
              title: 'Add your API key',
              detail: 'Required to access services',
            },
          ].map(({ step, title, detail, optional }) => (
            <li className="flex items-start" key={step}>
              <div className="bg-blue-100 text-black rounded-full h-6 w-6 flex items-center justify-center mr-3">
                {step}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {title} {optional && <span className="text-gray-400">(Optional)</span>}
                </h3>
                <p className="text-sm text-gray-500">{detail}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Error */}
        {showError && (
          <div className="flex items-center bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Please add your API key to continue</span>
          </div>
        )}

        {/* Smaller Start Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-black hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentSetupGuide;
