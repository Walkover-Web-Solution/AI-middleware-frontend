import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { AlertIcon, InfoIcon } from "@/components/Icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from 'react-redux';
import { modelSuggestionApi } from "@/config";
import { getServiceAction } from "@/store/action/serviceAction";
import Protected from "@/components/protected";
import { getIconOfService } from "@/utils/utility";
import InfoTooltip from "@/components/InfoTooltip";
import React from "react";
import Dropdown from '@/components/UI/Dropdown';

function ServiceDropdown({ params, searchParams, apiKeySectionRef, promptTextAreaRef, isEmbedUser }) {
    const { bridgeType, service, SERVICES, DEFAULT_MODEL, prompt, bridgeApiKey, shouldPromptShow, showDefaultApikeys, apiKeyObjectIdData } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id];
        const service = bridgeData?.[searchParams?.version]?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        const apiKeyObjectIdData = state.appInfoReducer.embedUserDetails?.apikey_object_id || {}
        const showDefaultApikeys = state.appInfoReducer.embedUserDetails?.addDefaultApiKeys;
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

    // Build options for global Dropdown
    const serviceOptions = useMemo(() => {
        let availableServices = [];
        if (isEmbedUser && showDefaultApikeys) {
            // Ensure apiKeyObjectIdData exists and is an object
            if (apiKeyObjectIdData && typeof apiKeyObjectIdData === 'object') {
                availableServices = Object.keys(apiKeyObjectIdData).map(key => {
                    const svc = SERVICES && Array.isArray(SERVICES) && SERVICES.find((s) => s && s.value === key);
                    return svc ? svc : { value: key, displayName: key };
                }).filter(Boolean);
            }
        } else {
            // Ensure SERVICES is an array
            availableServices = Array.isArray(SERVICES) ? SERVICES : [];
        }
        // Ensure availableServices is an array before mapping
        if (!Array.isArray(availableServices)) {
            availableServices = [];
        }
        return availableServices.map((svc) => {
            // Sanity checks
            if (!svc || typeof svc !== 'object') return null;
            if (!svc.value) return null;
            
            return {
                value: svc.value,
                label: (
                    <div className="flex items-center gap-2">
                        {getIconOfService(svc.value, 16, 16)}
                        <span className="capitalize">{svc.displayName || svc.value}</span>
                    </div>
                )
            };
        }).filter(Boolean);
    }, [SERVICES, isEmbedUser, showDefaultApikeys, apiKeyObjectIdData]);

    const handleServiceChange = useCallback((serviceValue) => {
        const newService = serviceValue;
        const defaultModel = DEFAULT_MODEL?.[newService]?.model;
        setSelectedService(newService);
        
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: searchParams?.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, searchParams?.version, DEFAULT_MODEL]);

    const isDisabled = bridgeType === 'batch' && service === 'openai';

    const renderServiceDropdown = () => (
        <Dropdown
            options={serviceOptions}
            value={selectedService || ''}
            onChange={handleServiceChange}
            placeholder="Select a Service"
            size="sm"
            className={`btn btn-sm border-base-content/20 bg-base-100 capitalize w-full font-normal rounded-sm justify-between ${isDisabled ? 'btn-disabled' : ''}`}
            menuClassName="w-full max-w-xs"
          />
    );

    return (
        <div className="space-y-4 w-full">
            <div className="form-control">
                <div className="flex items-center gap-2 z-auto">
                {isDisabled && (
                            <InfoTooltip tooltipContent="Batch API is only applicable for OpenAI">
                              <AlertIcon size={16} className="text-warning" />
                            </InfoTooltip>
                        )}
                    {renderServiceDropdown()}
                </div>
            </div>
        </div>
    );
}

export default Protected(React.memo(ServiceDropdown));