import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { InfoIcon } from "@/components/Icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { modelSuggestionApi } from "@/config";
import { getServiceAction } from "@/store/action/serviceAction";
import { AVAILABLE_MODEL_TYPES } from "@/utils/enums";

function ServiceDropdown({ params, apiKeySectionRef, promptTextAreaRef }) {
    const { bridgeType, service, SERVICES, DEFAULT_MODEL, prompt, bridgeApiKey,shouldPromptShow } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        const bridgeData=state?.bridgeReducer?.bridgeVersionMapping?.[params?.id];
        const service = bridgeData?.[params?.version]?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            SERVICES: state?.serviceReducer?.services,
            DEFAULT_MODEL: state?.serviceReducer?.default_model,
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
            service: service,
            prompt: bridgeData?.[params?.version]?.configuration?.prompt || "",
            bridgeApiKey: bridgeData?.[params?.version]?.apikey_object_id?.[
                service === 'openai_response' ? 'openai' : service
            ],
            shouldPromptShow:  modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt   

        };
    });

    const [selectedService, setSelectedService] = useState(service);
    const [modelRecommendations, setModelRecommendations] = useState(null);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const dispatch = useDispatch();

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
    const hasPrompt =!shouldPromptShow|| prompt !== ""||(promptTextAreaRef.current&&promptTextAreaRef.current.querySelector('textarea').value.trim()!=="");
    const hasApiKey = !!bridgeApiKey;
    
    if (hasPrompt) {
      resetBorder(promptTextAreaRef, 'textarea');
    }
    
    if (hasApiKey) {
      resetBorder(apiKeySectionRef, 'select');
    }
    
  }, [bridgeApiKey, prompt, apiKeySectionRef, promptTextAreaRef]);
    useEffect(() => {
        if (service) {
            setSelectedService(service);
        }
    }, [service]);

    useEffect(() => {
        if (!SERVICES || Object?.entries(SERVICES)?.length === 0) {
            dispatch(getServiceAction({ orgid: params.orgid }))
        }
    }, [SERVICES]);

    const handleServiceChange = useCallback((e) => {
        const newService = e.target.value;
        const defaultModel = DEFAULT_MODEL?.[newService]?.model;
        setSelectedService(newService);
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, params.version]);

    const handleGetRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
        if(bridgeApiKey && promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim()!==""){
            const response = await modelSuggestionApi({ versionId: params?.version });
            if (response?.success) {
                setModelRecommendations({
                    available: {
                        service: response.data.available.service,
                        model: response.data.available.model
                    },
                    unavailable: {
                        service: response.data.unavailable.service,
                        model: response.data.unavailable.model
                    }
                });
            } else {
            
                setModelRecommendations({ error: 'Failed to get model recommendations.' });
        }
       }
        else{
            if ( promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim() === "") {
                setModelRecommendations({error:'Prompt is missing. Please enter a prompt'});
                setErrorBorder(promptTextAreaRef, 'textarea', true);        
            }
           else {
                setModelRecommendations({error:'API key is missing. Please add an API key'});
                setErrorBorder(apiKeySectionRef, 'select', true);
            }
        }
        } catch (error) {
            console.error('Error fetching recommended model:', error);
            setModelRecommendations({ error: 'Error fetching recommended model' });
        } finally {
            setIsLoadingRecommendations(false);
        }
    };

    const isDisabled = bridgeType === 'batch' && service === 'openai';

    return (
        <div className="space-y-4 w-full">
            <div className="form-control">
                <div className="gap-2 max-w-xl">
                    <div className="label max-w-xs flex justify-between items-center gap-10">
                        <span className="label-text font-medium items-end">LLM Provider</span>
                     {(shouldPromptShow) && (  <button
                            className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
                            onClick={handleGetRecommendations}
                            disabled={isLoadingRecommendations}
                        >
                            {isLoadingRecommendations ? 'Loading...' : 'Get Recommended Model'}
                        </button>
                       )}                      
                    </div>
                </div>
                {modelRecommendations && (
                    <div className="mb-2 p-4 bg-base-100 rounded-lg border border-base-content max-w-xs">
                        {modelRecommendations.error ? (
                            <p className="text-red-500 text-sm">{modelRecommendations.error}</p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-medium">Recommended Service:</span> {modelRecommendations?.available?.service}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Recommended Model:</span> {modelRecommendations?.available?.model}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <select
                        value={selectedService}
                        onChange={handleServiceChange}
                        className="select select-sm select-bordered border-base-content capitalize w-full max-w-xs"
                        disabled={isDisabled}
                    >
                        <option disabled>Select a Service</option>
                        {Array.isArray(SERVICES) ? SERVICES.map(({ value, displayName }) => (
                            <option key={value} value={value}>{displayName}</option>
                        )) : null}
                    </select>
                    {isDisabled && (
                        <div role="alert" className="alert p-2 flex items-center gap-2 w-auto">
                            <InfoIcon size={16} className="flex-shrink-0 mt-0.5" />
                            <span className='label-text-alt text-xs leading-tight'>
                                Batch API is only applicable for OpenAI services.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ServiceDropdown;