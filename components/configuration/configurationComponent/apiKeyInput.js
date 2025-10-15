import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params, searchParams, apiKeySectionRef }) => {
    const dispatch = useDispatch();

    const { bridge, apikeydata, bridgeApikey_object_id, currentService } = useCustomSelector((state) => {
        const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || {};
        const apikeys = state?.apiKeysReducer?.apikeys || {};

        return {
            bridge: bridgeMap,
            apikeydata: apikeys[params?.org_id] || [], // Ensure apikeydata is an array
            bridgeApikey_object_id: bridgeMap?.apikey_object_id,
            currentService: bridgeMap?.service,
        };
    });

    // Memoize filtered API keys
    const filteredApiKeys = useMemo(() => {
        return apikeydata.filter(apiKey =>
            apiKey?.service === bridge?.service
        );
    }, [apikeydata, bridge?.service]);

    const handleDropdownChange = useCallback((e) => {
        const selectedApiKeyId = e.target.value;
        if (selectedApiKeyId === 'add_new') {
            openModal(MODAL_TYPE.API_KEY_MODAL);
        } 
        else if (selectedApiKeyId !== 'AI_ML_DEFAULT_KEY') {
            const service = bridge?.service;
            const updated = {...bridgeApikey_object_id, [service]: selectedApiKeyId };
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

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    const maxChar = 20;

    return (
        <div className="relative form-control max-w-xs text-base-content" ref={apiKeySectionRef}>
            
            <div className=''>
                <div className='relative'>
                    <select
                        className="select select-sm w-full border-base-content/20"
                        onChange={handleDropdownChange}
                        maxLength="10"
                        value={selectedValue ? selectedValue : ''}
                    >
                        <option value="" disabled>Select API key</option>
                        {
                            bridge.service === 'ai_ml' && (
                                <option
                                    maxLength="10"
                                    value={"AI_ML_DEFAULT_KEY"}>
                                    AI ML Default Key
                                </option>
                            )
                        }
                        {filteredApiKeys.length > 0 ? (
                            filteredApiKeys.map(apiKey => (
                                <option
                                    maxLength="10"
                                    key={apiKey._id} value={apiKey._id}>
                                    {apiKey.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No API keys available for this service
                            </option>
                        )}
                        <option value="add_new" className="add-new-option">+  Add new API Key </option>
                    </select>
                </div>
            </div>
            <ApiKeyModal params={params} searchParams={searchParams} service={currentService} bridgeApikey_object_id={bridgeApikey_object_id} />
        </div>
    );
};

export default React.memo(ApiKeyInput);