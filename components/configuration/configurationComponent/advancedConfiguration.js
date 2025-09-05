import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import ResponseFormatSelector from './responseFormatSelector';
import InfoTooltip from '@/components/InfoTooltip';
import ToolCallCount from './toolCallCount';

const AdvancedConfiguration = ({ params, searchParams, bridgeType, modelType }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showApiKeysToggle, setShowApiKeysToggle] = useState(false);
  const [selectedApiKeys, setSelectedApiKeys] = useState({});
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const dispatch = useDispatch();

  const { bridge, apikeydata, bridgeApikey_object_id, SERVICES, isFirstConfiguration } = useCustomSelector((state) => {
    const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || {};
    const apikeys = state?.bridgeReducer?.apikeys || {};
    const user = state.userDetailsReducer.userDetails;

    return {
      bridge: bridgeMap,
      apikeydata: apikeys[params?.org_id] || [],
      bridgeApikey_object_id: bridgeMap?.apikey_object_id,
      SERVICES: state?.serviceReducer?.services,
      isFirstConfiguration: user?.meta?.onboarding?.AdvancedConfiguration
    };
  });

  useEffect(() => {
    if (bridgeApikey_object_id && typeof bridgeApikey_object_id === 'object') {
      setSelectedApiKeys(bridgeApikey_object_id);
    }
  }, [bridgeApikey_object_id]);

  const handleTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: isFirstConfiguration
    }));
  };

  const filterApiKeysByService = (service) => {
    return apikeydata.filter(apiKey => apiKey?.service === service);
  };

  const handleSelectionChange = useCallback((service, apiKeyId) => {
    setSelectedApiKeys(prev => {
      const updated = { ...prev, [service]: apiKeyId };
      dispatch(updateBridgeVersionAction({
        bridgeId: params?.id,
        versionId: searchParams?.version,
        dataToSend: { apikey_object_id: updated }
      }));
      return updated;
    });
  }, [dispatch, params?.id, searchParams?.version]);

  const toggleApiKeys = () => {
    setShowApiKeysToggle(prev => !prev);
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const toggleAccordion = () => {
    setIsAccordionOpen((prevState) => !prevState);
  };

  return (
    <div className="z-very-low text-base-content w-full cursor-pointer mt-2" tabIndex={0}>
      <div
        className={`info p-2 ${isAccordionOpen ? 'border border-base-content/20 rounded-x-lg rounded-t-lg' : 'border border-base-content/20 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`}
        onClick={() => {
          toggleAccordion();
        }}
      >
        <InfoTooltip
          tooltipContent="Advanced configuration options for customizing your agent setup"
          className="cursor-pointer mr-2"
        >
          <div className="cursor-pointer label-text inline-block ml-1">
            Advanced Configuration
          </div>
        </InfoTooltip>

        <span className="cursor-pointer">
          {isAccordionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </div>

      <div className={`w-full gap-4 flex flex-col px-3 py-2 ${isAccordionOpen ? 'border-x border-b border-base-content/20 rounded-x-lg rounded-b-lg' : 'border border-base-content/20 rounded-lg'} transition-all duration-300 ease-in-out overflow-hidden ${isAccordionOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 p-0'}`}>
        {bridgeType === 'api' && modelType !== 'image' && modelType !== 'embedding' && (
          <div className="form-control w-full mt-2 border border-base-content/20 rounded-lg p-2">
            <ResponseFormatSelector params={params} />
          </div>
        )}
        {/* Multiple API Keys Section */}
        <div className="form-control w-full">
          <label className="label">
            <InfoTooltip tooltipContent="Add multiple API keys from different services to use with your agent">
              <span className="label-text info">Multiple API Keys</span>
            </InfoTooltip>
          </label>

          <div className="w-full">
            <div className="relative">
              <div
                className={`flex items-center gap-2 input input-bordered input-sm w-full border-base-content/20 min-h-[2.5rem] cursor-pointer ${showApiKeysToggle ? 'rounded-x-md rounded-b-none rounded-t-md' : 'rounded-md'}`}
                onClick={toggleApiKeys}
              >
                <span className="text-base-content">
                  Configure API keys...
                </span>
                <div className="ml-auto">
                  {showApiKeysToggle ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                </div>
              </div>

              {showApiKeysToggle && (
                <div className={`bg-base-100 border z-low max-h-80 overflow-y-auto p-2 transition-all ${showApiKeysToggle ? 'rounded-x-lg border-base-content/20 border-t-0 rounded-t-none rounded-b-lg duration-300 ease-in-out' : ''}`}>
                  {SERVICES?.filter(service => service?.value !== bridge?.service).map(service => (
                    <div key={service?.value} className="p-2 border-b last:border-b-0">
                      <div className="font-semibold capitalize mb-2 text-sm">
                        {service?.displayName}
                      </div>

                      {filterApiKeysByService(service?.value)?.length > 0 ? (
                        filterApiKeysByService(service?.value).map(apiKey => (
                          <div
                            key={apiKey?._id}
                            className="p-2 hover:bg-base-200 cursor-pointer rounded"
                            onClick={() => handleSelectionChange(service?.value, apiKey?._id)}
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`apiKey-${service?.value}`}
                                value={apiKey?._id}
                                checked={selectedApiKeys[service?.value] === apiKey?._id}
                                onChange={() => handleSelectionChange(service?.value, apiKey?._id)}
                                className="radio radio-sm h-4 w-4"
                              />
                              <span className="text-sm">
                                {truncateText(apiKey?.name, 25)}
                              </span>
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          No API keys available for {service?.displayName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      <ToolCallCount params={params} />
      </div>
    </div>
  );
};

export default AdvancedConfiguration;