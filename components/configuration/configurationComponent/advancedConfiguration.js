import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AlertIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import ResponseFormatSelector from './responseFormatSelector';
import InfoTooltip from '@/components/InfoTooltip';
import ToolCallCount from './toolCallCount';
import GuardrailSelector from './guardrailSelector';
import { getIconOfService } from '@/utils/utility';

const AdvancedConfiguration = ({ params, searchParams, bridgeType, modelType }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showApiKeysToggle, setShowApiKeysToggle] = useState(false);
  const [selectedApiKeys, setSelectedApiKeys] = useState({});
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const dropdownContainerRef = useRef(null);

  const dispatch = useDispatch();

  const { bridge, apikeydata, bridgeApikey_object_id, SERVICES, isFirstConfiguration, serviceModels, currentService, fallbackModel, DefaultModel , currentModel } = useCustomSelector((state) => {
    const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || {};
    const apikeys = state?.bridgeReducer?.apikeys || {};
    const user = state.userDetailsReducer.userDetails;
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
    const service = versionData?.service;
    const model = versionData?.model;
    return {
      bridge: bridgeMap,
      apikeydata: apikeys[params?.org_id] || [],
      bridgeApikey_object_id: bridgeMap?.apikey_object_id||{},
      SERVICES: state?.serviceReducer?.services,
      isFirstConfiguration: user?.meta?.onboarding?.AdvancedConfiguration,
      serviceModels: state?.modelReducer?.serviceModels || {},
      currentService: service,
      currentModel: versionData?.configuration?.model,
      fallbackModel: versionData?.fall_back,
      DefaultModel: state?.serviceReducer?.default_model||[],

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

  const handleTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: isFirstConfiguration
    }));
  };

  const filterApiKeysByServiceForFallback = (service) => {
          return Object.keys(bridgeApikey_object_id).filter(key => key === service);
  };

  // Check if a service has available API keys
  const hasApiKeysForService = (service) => {
    if(service==='ai_ml') return true;
    return filterApiKeysByServiceForFallback(service).length > 0;
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
    return text?.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const toggleAccordion = () => {
    setIsAccordionOpen((prevState) => !prevState);
  };
  // Fallback model + service state and handlers
  const [fallbackService, setFallbackService] = useState(fallbackModel?.service || currentService);
  const [fallbackModelName, setFallbackModelName] = useState(fallbackModel?.model ||DefaultModel[currentService]?.model);
  const [isFallbackEnabled, setIsFallbackEnabled] = useState(fallbackModel?.is_enable||false);
  useEffect(() => {
    setFallbackService(fallbackModel?.service || currentService);
    setFallbackModelName(fallbackModel?.model ||DefaultModel[currentService]?.model);
    setIsFallbackEnabled(fallbackModel?.is_enable||false);
  }, [fallbackModel]);

  // Check if batch API has non-OpenAI service selected and show alert
 useEffect(() => {
  if (bridgeType === 'batch' && fallbackService && fallbackService !== 'openai') {

    const openaiModels = serviceModels?.openai || {};
    let selectedModel = DefaultModel['openai']?.model;

    if (selectedModel === currentModel) {
      // Flatten all models in one array and find the first different one
      const allModels = Object.values(openaiModels)
        .flatMap(modelsObj => Object.entries(modelsObj))
        .map(([modelKey, modelData]) => 
          modelData?.configuration?.model?.default || modelKey
        );

      const differentModel = allModels.find(modelName => modelName !== currentModel);
      if (differentModel) selectedModel = differentModel;
    }
           handleFallbackServiceChange('openai',selectedModel);

  }
}, [bridgeType, fallbackService, currentModel, serviceModels, DefaultModel]);


  const handleFallbackServiceChange = useCallback((service,model) => {
    const newDefaultModel = model || DefaultModel[service]?.model || null;
    setFallbackService(service);
    setFallbackModelName(newDefaultModel);
    // Persist immediately using explicit values (avoid stale state)
    dispatch(updateBridgeVersionAction({
      bridgeId: params.id,
      versionId: searchParams?.version,
      dataToSend: {
        fall_back: {
          ...(fallbackModel || {}),
          is_enable: !!isFallbackEnabled,
          service: service || null,
          model: newDefaultModel || null,
        },
      },
    }));
  }, [dispatch, params.id, searchParams?.version, fallbackModel, isFallbackEnabled, fallbackModelName]);

  const handleFallbackModelChange = useCallback(( model) => {
    setFallbackModelName(model);
    const enableNext = true;
    if (!isFallbackEnabled) setIsFallbackEnabled(true);
    // Persist immediately using explicit values
    dispatch(updateBridgeVersionAction({
      bridgeId: params.id,
      versionId: searchParams?.version,
      dataToSend: {
        fall_back: {
          ...(fallbackModel || {}),
          is_enable: enableNext,
          service: fallbackService || null,
          model: model || null,
        },
      },
    }));
  }, [dispatch, params.id, searchParams?.version, fallbackModel, isFallbackEnabled, fallbackService, fallbackModelName]);

  const handleFallbackModelToggle = useCallback(() => {
    const next = !isFallbackEnabled;
    setIsFallbackEnabled(next);
    // Use `next` directly to avoid stale state in dispatch
    dispatch(updateBridgeVersionAction({
      bridgeId: params.id,
      versionId: searchParams?.version,
      dataToSend: {
        fall_back: {
          ...(fallbackModel || {}),
          is_enable: next,
          service: fallbackService || null,
          model: next ? (fallbackModelName || null) : null,
        },
      },
    }));
  }, [dispatch, params.id, searchParams?.version, isFallbackEnabled, fallbackModel, fallbackService, fallbackModelName]);

  const computedModelsList = serviceModels?.[fallbackService] || {};
  return (
    <div className="z-very-low text-base-content w-full cursor-pointer" tabIndex={0}>

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
            <span className="cursor-pointer label-text inline-block mr-1">Advanced Configuration</span>
            <span className="text-base-content/50 text-xs">
              (Prompt guard, Fallback model, Add multiple API keys...)
            </span>
          </div>
        </InfoTooltip>

        <span className="cursor-pointer">
          {isAccordionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </div>

      

      <div className={`w-full gap-4 flex flex-col transition-all duration-300 ease-in-out ${isAccordionOpen ? 'px-3 py-2 border-x border-b border-base-content/20 rounded-x-lg rounded-b-lg opacity-100' : 'max-h-0 opacity-0 overflow-hidden border border-base-content/20 rounded-lg p-0'}`}>
        <div className='mt-4'> 
      <GuardrailSelector params={params} searchParams={searchParams} />
      </div>
      <div className="form-control w-full  border border-base-content/20 rounded-md ">
          <div className="label">
            <InfoTooltip tooltipContent="Enable and configure a fallback model and service to retry when the primary fails.">
              <span className="label-text pl-2">Fallback Model</span>
            </InfoTooltip>
            <input
              type="checkbox"
              className="toggle"
              checked={isFallbackEnabled}
              onChange={handleFallbackModelToggle}
            />
          </div>

          {isFallbackEnabled && (
            <div className="w-full p-2" ref={dropdownContainerRef}>
              {/* Fallback Service Dropdown (styled like ServiceDropdown) */}
              <div className="relative w-full mb-2">
                <details id='service-dropdown' className="dropdown  dropdown-end w-full"
                onToggle={(e) => {
                  if (e.currentTarget.open) {
                    // close model dropdown if service is opened
                    const modelDropdown = document.getElementById("model-dropdown");
                    if (modelDropdown) modelDropdown.removeAttribute("open");
                  }

                 
                }
                
              }
              disabled={bridgeType === 'batch'}
                >
                  <summary
                    tabIndex={0}
                    role="button"
                    className={`btn btn-sm border-base-content/20 bg-base-100 capitalize w-full justify-between ${bridgeType === 'batch' ? 'btn-disabled cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {fallbackService && getIconOfService(fallbackService, 16, 16)}
                      <span className="">
                        {fallbackService ? (SERVICES?.find(s => s.value === fallbackService)?.displayName || fallbackService) : 'Select a Service'}
                      </span>
                    </div>
                    <ChevronDownIcon size={16} />
                  </summary>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-high menu bg-base-100 rounded-box w-full p-1 shadow border border-base-300 max-h-80 overflow-y-auto"
                >
                  {Array.isArray(SERVICES) && SERVICES.map((svc) => {
                    const hasApiKeys = hasApiKeysForService(svc.value);
                    return (
                      <li key={svc.value}>
                        {hasApiKeys ? (
                          <a className={`flex items-center gap-2 ${fallbackService === svc.value ? 'active' : ''}`}
                             onClick={(e) => {
                              handleFallbackServiceChange(svc.value)
                              const details = e.currentTarget.closest('details');
                              if (details) details.removeAttribute('open');
                             }}>
                            {getIconOfService(svc.value, 16, 16)}
                            <span className="capitalize">{svc.displayName || svc.value}</span>
                          </a>
                        ) : (
                          <div className="w-full flex justify-between" >
                            <a className="flex items-center gap-2 opacity-50 cursor-not-allowed pointer-events-none">
                              {getIconOfService(svc.value, 16, 16)}
                              <span className="capitalize">{svc.displayName || svc.value}</span>
                            </a>
                            <span className="text-xs text-error ml-auto">No API Key Available</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                </details>
                
                {/* Alert Icon for batch API restriction */}
                {bridgeType === 'batch' && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
                    <InfoTooltip tooltipContent="Batch API is only applicable for OpenAI">
                      <AlertIcon size={16} className="text-warning" />
                    </InfoTooltip>
                  </div>
                )}
              </div>

              {/* Alert for same model selection */}
              {fallbackModelName && currentModel && fallbackModelName === currentModel && (
                <div className="alert alert-warning mb-1 py-2 px-2">
                  <div className="flex items-center gap-2">
                    <AlertIcon size={12} />
                    <span className="text-xs">This model is already selected please change the model</span>
                  </div>
                </div>
              )}

              {/* Fallback Model Dropdown (styled like ModelDropdown) */}
              <details id="model-dropdown" className="dropdown w-full"
              >
                <summary
                  tabIndex={0}
                  role="button"
                  className="btn btn-sm w-full justify-between border border-base-content/20 bg-base-100 hover:bg-base-200 font-normal"
                >
                  <span className="">{fallbackModelName ? truncateText(fallbackModelName, 30) : 'Select a Model'}</span>
                  <ChevronDownIcon size={16} />
                </summary>
                <ul
                  tabIndex={0}
                  className="dropdown-content mb-6 z-high p-2 shadow bg-base-100 rounded-lg mt-1 max-h-[340px] w-[260px] overflow-y-auto border border-base-300"
                >
                  {Object.entries(computedModelsList || {}).map(([group, options]) => {
                    const isInvalidGroup = group==="image"  
                    if (isInvalidGroup) return null;
                    return (
                      <li key={group} className="px-2 py-1 cursor-pointer">
                        <span className="text-sm text-base-content">{group}</span>
                        <ul>
                          {Object.keys(options || {}).map((option) => {
                            const modelName = options?.[option]?.configuration?.model?.default || option;
                            const selected = fallbackModelName === modelName || fallbackModelName === option;
                            
                            if (currentModel === modelName || currentModel === option) return null;
                            
                            return (
                              <li key={`${group}-${option}`}
                                className={`hover:bg-base-200 rounded-md py-1 ${selected ? 'bg-base-200' : ''}`}
                                onClick={(e) => {
                                  handleFallbackModelChange( modelName)
                                  const details = e.currentTarget.closest('details');
                                  if (details) details.removeAttribute('open');
                                }}
                              >
                                {selected && <span className="flex-shrink-0 ml-2">✓</span>}
                                <span className={`truncate flex-1 pl-2 ${!selected ? 'ml-4' : ''}`}>
                                  {truncateText(modelName || option, 30)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          )}
        </div>
        {bridgeType === 'api' && modelType !== 'image' && modelType !== 'embedding' && (
          <div className="form-control w-full mt-2 border border-base-content/20 rounded-lg p-2">
            <ResponseFormatSelector params={params} searchParams={searchParams}/>
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
                className={`flex items-center gap-2 input input-sm w-full border-base-content/20 min-h-[2.5rem] cursor-pointer ${showApiKeysToggle ? 'rounded-x-md rounded-b-none rounded-t-md' : 'rounded-md'}`}
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

       
      <ToolCallCount params={params} searchParams={searchParams}/>
      </div>
    </div>
  );
};

export default AdvancedConfiguration;