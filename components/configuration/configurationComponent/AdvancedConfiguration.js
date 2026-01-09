import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {  ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import ResponseFormatSelector from './ResponseFormatSelector';
import InfoTooltip from '@/components/InfoTooltip';
import ToolCallCount from './ToolCallCount';
import GuardrailSelector from './GuardrailSelector';
import { CircleQuestionMark } from 'lucide-react';

const AdvancedConfiguration = ({ params, searchParams, bridgeType, modelType, isPublished, isEditor = true ,isEmbedUser}) => {
  // Determine if content is read-only (either published or user is not an editor)
  const isReadOnly = isPublished || !isEditor;
  const [showApiKeysToggle, setShowApiKeysToggle] = useState(false);
  const [selectedApiKeys, setSelectedApiKeys] = useState({});
  const dropdownContainerRef = useRef(null);

  const dispatch = useDispatch();

  const { bridge, apikeydata, bridgeApikey_object_id, SERVICES, showDefaultApikeys } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
    const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const apikeys = state?.apiKeysReducer?.apikeys || {};
    
    // Use bridgeData when isPublished=true, otherwise use versionData
    const activeData = isPublished ? bridgeDataFromState : versionData;
    
    return {
      bridge: activeData || {},
      apikeydata: apikeys[params?.org_id] || [],
      bridgeApikey_object_id: isPublished ? (bridgeDataFromState?.apikey_object_id || {}) : (versionData?.apikey_object_id || {}),
      SERVICES: state?.serviceReducer?.services,
      showDefaultApikeys: state.appInfoReducer.embedUserDetails?.addDefaultApiKeys,
    };
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        const serviceDropdown = document.getElementById("service-dropdown");
        const modelDropdown = document.getElementById("model-dropdown");
        serviceDropdown?.removeAttribute("open");
        modelDropdown?.removeAttribute("open");
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (bridgeApikey_object_id && typeof bridgeApikey_object_id === 'object') {
      setSelectedApiKeys(bridgeApikey_object_id);
    }
  }, [bridgeApikey_object_id]);


   const filterApiKeysByService = (service) => {
    const regularApiKeys = apikeydata.filter(apiKey => apiKey?.service === service);
    return regularApiKeys;
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
    return text?.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };


  const renderContent = () => (
    <div className="flex flex-col gap-6">
      <div className="">
        <GuardrailSelector params={params} searchParams={searchParams} isPublished={isPublished} isEditor={isEditor} />
      </div>


      {bridgeType === 'api' && modelType !== 'image' && modelType !== 'embedding' && (
        <div className="">
          <ResponseFormatSelector isPublished={isPublished} isEditor={isEditor} params={params} searchParams={searchParams} />
        </div>
      )}
 {((!showDefaultApikeys && isEmbedUser) || !isEmbedUser) && (
      <div className="">
        <div className="flex flex-col gap-3 w-full">
          {/* Multiple API Keys Label */}
          <div className="flex items-center gap-1">
            <span className="label-text font-medium">Multiple API Keys</span>
            <InfoTooltip tooltipContent="Add multiple API keys from different services to use with your agent for enhanced functionality and redundancy.">
              <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
            </InfoTooltip>
          </div>

        <div className="w-full">
          <div className="relative">
            <div
              className={`flex items-center gap-2 input input-sm w-full min-h-[2.5rem] cursor-pointer ${showApiKeysToggle ? 'rounded-x-md rounded-b-none rounded-t-md' : 'rounded-md'}`}
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
              <div className={`bg-base-100 z-low max-h-80 overflow-y-auto p-2 transition-all ${showApiKeysToggle ? 'rounded-x-lg border-base-content/20 border-t-0 rounded-t-none rounded-b-lg duration-300 ease-in-out' : ''}`}>
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
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              disabled={isReadOnly}
                              type="radio"
                              name={`apiKey-${service?.value}`}
                              value={apiKey?._id}
                              checked={selectedApiKeys[service?.value] === apiKey?._id}
                              onChange={() => handleSelectionChange(service?.value, apiKey?._id)}
                              className="radio radio-sm h-4 w-4"
                            />
                            <span className={`text-sm flex items-center gap-2 ${apiKey?.isDefaultEmbedKey ? 'font-medium text-primary' : ''}`}>
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
      </div>
    )}

      <div className="">
        <ToolCallCount params={params} searchParams={searchParams} isPublished={isPublished} isEditor={isEditor}/>
      </div>
    </div>
  );

  return (
    <div className="z-very-low text-base-content w-full" tabIndex={0}>
      {renderContent()}
    </div>
  );
};

export default AdvancedConfiguration;
