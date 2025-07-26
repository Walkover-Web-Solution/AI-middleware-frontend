import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import ResponseFormatSelector from './responseFormatSelector';

const AdvancedConfiguration = ({ params, bridgeType, modelType }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showApiKeysToggle, setShowApiKeysToggle] = useState(false);
  const [selectedApiKeys, setSelectedApiKeys] = useState({});
  const dispatch = useDispatch();

  const { bridge, apikeydata, bridgeApikey_object_id, SERVICES } = useCustomSelector((state) => {
    const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version] || {};
    const apikeys = state?.bridgeReducer?.apikeys || {};

    return {
      bridge: bridgeMap,
      apikeydata: apikeys[params?.org_id] || [],
      bridgeApikey_object_id: bridgeMap?.apikey_object_id,
      SERVICES: state?.serviceReducer?.services
    };
  });

  useEffect(() => {
    if (bridgeApikey_object_id && typeof bridgeApikey_object_id === 'object') {
      setSelectedApiKeys(bridgeApikey_object_id);
    }
  }, [bridgeApikey_object_id]);

  const filterApiKeysByService = (service) => {
    return apikeydata.filter(apiKey => apiKey?.service === service);
  };

  const handleSelectionChange = useCallback((service, apiKeyId) => {
    setSelectedApiKeys(prev => {
      const updated = { ...prev, [service]: apiKeyId };
      dispatch(updateBridgeVersionAction({ 
        bridgeId: params?.id, 
        versionId: params?.version, 
        dataToSend: { apikey_object_id: updated } 
      }));
      return updated;
    });
  }, [dispatch, params?.id, params?.version]);

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
    <div className="collapse z-very-low text-base-content -mt-4" tabIndex={0}>
      <input type="radio" name="agent-accordion" onClick={toggleAccordion} className='cursor-pointer' />
      <div className="collapse-title p-0 flex items-center justify-start font-medium cursor-pointer" onClick={toggleAccordion}>
        <span className="mr-2 cursor-pointer">
          Advanced Configuration
        </span>
        {isAccordionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </div>
      
      {isAccordionOpen && (
        <div className="collapse-content gap-3 flex flex-col p-3 border rounded-md">
          {bridgeType === 'api' && modelType !== 'image' && modelType !== 'embedding' && (
            <>
              <ResponseFormatSelector params={params} /> 
              
              {/* Multiple API Keys Section with Toggle */}
              <div className="collapse z-very-low text-base-content" tabIndex={0}>
                <input type="radio" name="api-keys-accordion" onClick={toggleApiKeys} className='cursor-pointer' />
                <div className="collapse-title p-0 flex items-center justify-start font-medium cursor-pointer gap-2" onClick={toggleApiKeys}>
                  <span className="text-sm cursor-pointer ">
                    Add Multiple API Keys
                  </span>
                  {showApiKeysToggle ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
                
                {showApiKeysToggle && (
                  <div className="collapse-content p-0 mt-2">
                    <div className="bg-base-100 border border-base-200 rounded-md shadow-lg max-h-80 overflow-auto p-4">
                      {SERVICES?.filter(service => service?.value !== bridge?.service).map(service => (
                        <div key={service?.value} className="px-4 py-2 border-b last:border-b-0">
                          <div className="font-semibold capitalize mb-1">{service?.displayName}</div>
                          {filterApiKeysByService(service?.value)?.map(apiKey => (
                            <label key={apiKey?._id} className="flex items-center mb-1">
                              <input
                                type="radio"
                                name={`apiKey-${service?.value}`}
                                value={apiKey?._id}
                                checked={selectedApiKeys[service?.value] === apiKey?._id}
                                onChange={() => handleSelectionChange(service?.value, apiKey?._id)}
                                className="radio radio-sm h-4 w-4"
                              />
                              <span className="ml-2 text-sm">
                                {truncateText(apiKey?.name, 20)}
                              </span>
                            </label>
                          ))}
                          {filterApiKeysByService(service?.value)?.length === 0 && (
                            <span className="text-sm text-gray-500">No API keys available for {service?.displayName}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedConfiguration;