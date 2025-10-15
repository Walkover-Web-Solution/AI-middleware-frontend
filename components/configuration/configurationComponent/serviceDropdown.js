import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { AlertIcon, InfoIcon } from "@/components/Icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { modelSuggestionApi } from "@/config";
import { getServiceAction } from "@/store/action/serviceAction";
import Protected from "@/components/protected";
import { getIconOfService } from "@/utils/utility";
import { ChevronDown, ChevronUp } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import React from "react";

function ServiceDropdown({ params, searchParams, apiKeySectionRef, promptTextAreaRef, isEmbedUser }) {
    const { bridgeType, service, SERVICES, DEFAULT_MODEL, prompt, bridgeApiKey, shouldPromptShow, showDefaultApikeys, apiKeyObjectIdData } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id];
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
            shouldPromptShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,
            apiKeyObjectIdData,
            showDefaultApikeys
        };
    });

    const [selectedService, setSelectedService] = useState(service);
    const [modelRecommendations, setModelRecommendations] = useState(null);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
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
                ref.current.scrollIntoView({ behavior: 'smooth' });
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
        const hasPrompt = !shouldPromptShow || prompt !== "" || (promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim() !== "");
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen) {
                const dropdown = event.target.closest('.dropdown');
                if (!dropdown) {
                    setDropdownOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Coordinate with other dropdowns (e.g., ModelDropdown)
    useEffect(() => {
        const handler = (e) => {
            const source = e?.detail?.type;
            if (source && source !== 'service') {
                setDropdownOpen(false);
            }
        };
        window.addEventListener('open-dropdown', handler);
        return () => window.removeEventListener('open-dropdown', handler);
    }, []);

    const handleServiceChange = useCallback((serviceValue) => {
        const newService = serviceValue;
        const defaultModel = DEFAULT_MODEL?.[newService]?.model;
        setSelectedService(newService);
        setDropdownOpen(false); 
        
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: searchParams?.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, searchParams?.version, DEFAULT_MODEL]);

    const handleGetRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
            if (bridgeApiKey && promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim() !== "") {
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
            else {
                if (promptTextAreaRef.current && promptTextAreaRef.current.querySelector('textarea').value.trim() === "") {
                    setModelRecommendations({ error: 'Prompt is missing. Please enter a prompt' });
                    setErrorBorder(promptTextAreaRef, 'textarea', true);
                }
                else {
                    setModelRecommendations({ error: 'API key is missing. Please add an API key' });
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

    // Get service display name
    const getServiceDisplayName = (value) => {
        if (Array.isArray(SERVICES)) {
            const service = SERVICES.find(s => s.value === value);
            return service ? service.displayName : value;
        }
        return value;
    };

    const renderDaisyUIDropdown = () => {
        const availableServices = isEmbedUser && showDefaultApikeys
            ? Object.keys(apiKeyObjectIdData).map(key => {
                const service = SERVICES && SERVICES.find((s) => s.value === key);
                return service ? service : { value: key, displayName: key };
            }).filter(Boolean)
            : SERVICES || [];

        return (
            <div className={`dropdown ${dropdownOpen ? 'dropdown-open' : ''} w-full max-w-xs ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>
                <div 
                    tabIndex={0} 
                    role="button" 
                    className={`btn btn-sm border-base-content/20 bg-base-100 capitalize w-full justify-between ${isDisabled ? 'btn-disabled' : ''}`}
                    disabled={isDisabled}
                    onClick={() => {
                        if (isDisabled) return;
                        // announce opening to close other dropdowns
                        window.dispatchEvent(new CustomEvent('open-dropdown', { detail: { type: 'service' } }));
                        setDropdownOpen(!dropdownOpen)
                    }}
                >
                    <div className="flex items-center gap-2">
                        {selectedService && getIconOfService(selectedService, 16, 16)}
                        <span>{selectedService ? getServiceDisplayName(selectedService) : 'Select a Service'}</span>
                    </div>
                    {dropdownOpen ? <ChevronUp className="text-base-content" size={16}/> : <ChevronDown className="text-base-content" size={16}/>}            
                </div>
                
                {!isDisabled && dropdownOpen && (
                    <ul 
                        tabIndex={0} 
                        className="dropdown-content menu bg-base-100 rounded-box w-full p-1 shadow border border-base-300 z-low"
                    >
                        {Array.isArray(availableServices) && availableServices.map((serviceItem) => {
                            const value = serviceItem.value;
                            const displayName = serviceItem.displayName || value;
                            
                            return (
                                <li key={value}>
                                    <a 
                                        className={`flex items-center gap-2 ${selectedService === value ? 'active' : ''}`}
                                        onClick={() => handleServiceChange(value)}
                                    >
                                        {getIconOfService(value, 16, 16)}
                                        <span className="capitalize">{displayName}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 w-full">
            <div className="form-control">
                
                

                <div className="flex items-center gap-2 z-auto">
                {isDisabled && (
                            <InfoTooltip tooltipContent="Batch API is only applicable for OpenAI">
                              <AlertIcon size={16} className="text-warning" />
                            </InfoTooltip>
                        )}
                    {renderDaisyUIDropdown()}

                    
                </div>
            </div>
        </div>
    );
}

export default Protected(React.memo(ServiceDropdown));