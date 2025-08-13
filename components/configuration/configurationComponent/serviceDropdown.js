import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { InfoIcon } from "@/components/Icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { getServiceAction } from "@/store/action/serviceAction";

function ServiceDropdown({ params }) {
    const { bridgeType, service, SERVICES, DEFAULT_MODEL } = useCustomSelector((state) => {
        const bridgeData=state?.bridgeReducer?.bridgeVersionMapping?.[params?.id];
        const service = bridgeData?.[params?.version]?.service;
        return {
            SERVICES: state?.serviceReducer?.services,
            DEFAULT_MODEL: state?.serviceReducer?.default_model,
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
            service: service,
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
            versionId: params.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, params.version]);

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
export default ServiceDropdown;