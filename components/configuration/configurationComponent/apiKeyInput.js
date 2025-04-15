import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params }) => {
    const dispatch = useDispatch();
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedApiKeys, setSelectedApiKeys] = useState({});
    const dropdownRef = useRef(null);

    const { bridge, bridge_apiKey, apikeydata, bridgeApikey_object_id, currentService, SERVICES } = useCustomSelector((state) => {
        const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version] || {};
        const apikeys = state?.bridgeReducer?.apikeys || {};

        return {
            bridge: bridgeMap,
            bridge_apiKey: bridgeMap?.apikey,
            apikeydata: apikeys[params?.org_id] || [], // Ensure apikeydata is an array
            bridgeApikey_object_id: bridgeMap?.apikey_object_id,
            currentService: bridgeMap?.service,
            SERVICES : state?.serviceReducer?.services
        };
    });
    // Memoize filtered API keys
    const filteredApiKeys = useMemo(() => {
        return apikeydata.filter(apiKey => 
            apiKey?.service === bridge?.service || 
            (apiKey?.service === 'openai' && bridge?.service === 'openai_response') ||
            (apiKey?.service === 'openai_response' && bridge?.service === 'openai')
        );
    }, [apikeydata, bridge?.service]);


    useEffect(() => {
        if (bridgeApikey_object_id) {
            if (typeof bridgeApikey_object_id === 'string') {
                const apiKey = apikeydata.find(apiKey => apiKey?._id === bridgeApikey_object_id);
                if (apiKey) {
                    setSelectedApiKeys({ [bridge?.service]: apiKey._id });
                }
            }
            else
                setSelectedApiKeys(bridgeApikey_object_id);
        } else if (bridge?.apikey) {
            const apiKey = apikeydata.find(apiKey => apiKey?._id === bridge?.apikey);
            if (apiKey) {
                setSelectedApiKeys({ [apiKey?.service]: apiKey._id });
            }
        }
    }, [bridge, apikeydata]);

    const filterApiKeysByService = (service) => {
        return apikeydata.filter(apiKey => apiKey?.service === service);
    };

    const handleSelectionChange = useCallback((service, apiKeyId) => {
        setSelectedApiKeys(prev => {
            const updated = { ...prev, [service]: apiKeyId };
            // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { apikey_object_id: selectedApiKeyId } }));
            dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: { apikey_object_id: updated } }));
            return updated;
        });
    }, [dispatch, params?.id, params?.version]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleDropdownChange = useCallback((e) => {
        const selectedApiKeyId = e.target.value;
        if (selectedApiKeyId === 'add_new') {
            openModal(MODAL_TYPE.API_KEY_MODAL);
        } else {
            setSelectedApiKeys(prev => {
                const updated = { ...prev, [bridge?.service]: selectedApiKeyId };
                // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { apikey_object_id: selectedApiKeyId } }));
                dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: { apikey_object_id: updated } }));
                return updated;
            });
        }
    }, [dispatch, params.id, params.version, bridge?.service]);

    // Determine the currently selected value
    const selectedValue = useMemo(() => {
        const serviceApiKeyId = typeof bridgeApikey_object_id === 'object'
            ? bridgeApikey_object_id?.[bridge?.service]
            : bridgeApikey_object_id;
        const currentApiKey = apikeydata.find(apiKey => apiKey?._id === serviceApiKeyId);
        return currentApiKey ? currentApiKey._id : bridge_apiKey || '';
    }, [apikeydata, bridge_apiKey, bridgeApikey_object_id, bridge?.service]);

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    const maxChar = 20;

    return (
        <div className="relative form-control max-w-xs text-base-content" ref={dropdownRef}>
            <div className="label">
                <span className="label-text font-medium">Service's API Key</span>
            </div>
            <div className=''>
                <div className='relative'>
                    <select
                        className="select select-bordered select-sm w-full"
                        onChange={handleDropdownChange}
                        maxLength="10"
                        value={selectedValue}
                    >
                        <option value="" disabled>Select API key</option>

                        {/* Display bridge_apiKey if it is not in the filtered API keys */}
                        {!bridgeApikey_object_id && bridge_apiKey && !apikeydata.some(apiKey => apiKey?._id === bridge_apiKey) && (
                            <option
                                maxLength="10"
                                value={bridge_apiKey}>
                                {truncateText(bridge_apiKey, maxChar)}
                            </option>
                        )}
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
                    <div className='text-[10px] text-end '>
                        <button
                            type="button"
                            onClick={toggleDropdown}
                        >
                            Add multiple api keys
                        </button>
                    </div>
                </div>
                <div>
                    {showDropdown && (
                        <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-80 overflow-auto">
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
                                                className="radio h-4 w-4"
                                            />
                                            <span className="ml-2 text-sm">
                                                {truncateText(apiKey?.name, maxChar)}
                                            </span>
                                        </label>
                                    ))}
                                    {filterApiKeysByService(service?.value)?.length === 0 && (
                                        <span className="text-sm text-gray-500">No API keys available</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <ApiKeyModal params={params} service={currentService} bridgeApikey_object_id={bridgeApikey_object_id} />
        </div>
    );
};

export default ApiKeyInput;
