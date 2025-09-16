import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { InfoIcon } from "@/components/Icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { getServiceAction } from "@/store/action/serviceAction";
import Protected from "@/components/protected";

function ServiceDropdown({ params, searchParams, apiKeySectionRef, promptTextAreaRef,isEmbedUser }) {
    const { bridgeType, service, SERVICES, DEFAULT_MODEL, prompt, bridgeApiKey,shouldPromptShow, showDefaultApikeys, apiKeyObjectIdData } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeData=state?.bridgeReducer?.bridgeVersionMapping?.[params?.id];
        const service = bridgeData?.[searchParams?.version]?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        const apiKeyObjectIdData = state.userDetailsReducer?.userDetails?.apikey_object_id || {}
        const showDefaultApikeys = state.userDetailsReducer?.userDetails?.addDefaultApiKeys;
        return {
            SERVICES: state?.serviceReducer?.services,
            DEFAULT_MODEL: state?.serviceReducer?.default_model,
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
            service: service,
            prompt: bridgeData?.[searchParams?.version]?.configuration?.prompt || "",
            bridgeApiKey: bridgeData?.[searchParams?.version]?.apikey_object_id?.[service],
            shouldPromptShow:  modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,   
            apiKeyObjectIdData,
            showDefaultApikeys
        };
    });

    const [selectedService, setSelectedService] = useState(service);
    const dispatch = useDispatch();

 

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
            versionId: searchParams?.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, searchParams?.version]);

    const handleGetRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
        if(bridgeApiKey && promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim()!==""){
            const response = await modelSuggestionApi({ versionId: searchParams?.version });
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
                    <div className="label flex justify-between items-center">
                        <span className="label-text font-medium">LLM Provider</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedService}
                        onChange={handleServiceChange}
                        className="select select-sm select-bordered capitalize w-full max-w-xs"
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
export default Protected(ServiceDropdown);