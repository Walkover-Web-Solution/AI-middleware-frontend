import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from '@/components/UI/Dropdown';

const ApiKeyInput = ({ params, searchParams, apiKeySectionRef, isEmbedUser, hideAdvancedParameters = false ,isPublished}) => {
    const dispatch = useDispatch();

    const { bridge, apikeydata, bridgeApikey_object_id, currentService } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
        const apikeys = state?.apiKeysReducer?.apikeys || {};
        
        // Use bridgeData when isPublished=true, otherwise use versionData
        const activeData = isPublished ? bridgeDataFromState : versionData;

        return {
            bridge: activeData || {},
            apikeydata: apikeys[params?.org_id] || [], // Ensure apikeydata is an array
            bridgeApikey_object_id: isPublished ? (bridgeDataFromState?.apikey_object_id) : (versionData?.apikey_object_id),
            currentService: isPublished ? (bridgeDataFromState?.service) : (versionData?.service),
        };
    });

    // Memoize filtered API keys
    const filteredApiKeys = useMemo(() => {
        return apikeydata.filter(apiKey =>
            apiKey?.service === bridge?.service
        );
    }, [apikeydata, bridge?.service]);

    const handleDropdownChange = useCallback((selectedApiKeyId) => {
        if (selectedApiKeyId === 'add_new') {
            openModal(MODAL_TYPE.API_KEY_MODAL);
        }
        else if (selectedApiKeyId !== 'AI_ML_DEFAULT_KEY') {
            const service = bridge?.service;
            const updated = { ...bridgeApikey_object_id, [service]: selectedApiKeyId };
            dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: { apikey_object_id: updated } }));
        }
    }, [params.id, searchParams?.version, bridge?.service, bridgeApikey_object_id]);

    // Determine the currently selected value
    const selectedValue = useMemo(() => {
        const serviceApiKeyId = typeof bridgeApikey_object_id === 'object'
            ? bridgeApikey_object_id?.[bridge?.service]
            : bridgeApikey_object_id;
        const currentApiKey = apikeydata.find(apiKey => apiKey?._id === serviceApiKeyId);
        return currentService === 'ai_ml' && !bridgeApikey_object_id?.['ai_ml'] ? 'AI_ML_DEFAULT_KEY' : currentApiKey?._id;
    }, [apikeydata, bridgeApikey_object_id, bridge?.service]);

    // Build dropdown options
    const dropdownOptions = useMemo(() => {
        const opts = [];
        if (bridge.service === 'ai_ml') {
            opts.push({ value: 'AI_ML_DEFAULT_KEY', label: 'AI ML Default Key' });
        }
        if (filteredApiKeys.length > 0) {
            filteredApiKeys.forEach((apiKey) => {
                opts.push({ value: apiKey._id, label: apiKey.name });
            });
        } else {
            // Disabled informational option pattern can be represented by not adding an option here; placeholder will handle it
        }
        // Add new key action
        opts.push({ value: 'add_new', label: '+  Add new API Key' });
        return opts;
    }, [filteredApiKeys, bridge.service]);


    return (
        <div className="relative form-control w-auto text-base-content" ref={apiKeySectionRef}>
            <Dropdown
            disabled={isPublished}
                options={dropdownOptions}
                value={selectedValue || ''}
                onChange={(val) => handleDropdownChange(val)}
                placeholder={filteredApiKeys.length === 0 ? 'No API keys for this service' : 'Select API key'}
                showSearch
                searchPlaceholder="Search API keys..."
                size="sm"
                className="btn btn-sm border-base-content/20 bg-base-100 w-auto justify-between font-normal px-3 min-w-[150px]"
                maxLabelLength={20}
                menuClassName="w-full min-w-[200px]"
            />

            <ApiKeyModal params={params} searchParams={searchParams} service={currentService} bridgeApikey_object_id={bridgeApikey_object_id} />
        </div>
    );
};

export default React.memo(ApiKeyInput);
