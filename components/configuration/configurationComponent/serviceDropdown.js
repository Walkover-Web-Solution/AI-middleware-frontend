import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL, SERVICES } from "@/jsonFiles/bridgeParameter";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

function ServiceDropdown({ params }) {
    const { bridgeType, service } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    }));
    const [selectedService, setSelectedService] = useState(service);
    const dispatch = useDispatch();

    useEffect(() => {
        if (service) {
            setSelectedService(service);
        }
    }, [service]);

    const handleServiceChange = useCallback((e) => {
        const newService = e.target.value;
        const defaultModel = DEFAULT_MODEL?.[newService];
        setSelectedService(newService);
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, params.version]);


    const isDisabled = bridgeType === 'batch' && service === 'openai';

    return (
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-medium">Service</span>
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={selectedService}
                    onChange={handleServiceChange}
                    className="select select-sm select-bordered capitalize w-full max-w-xs"
                    disabled={isDisabled}
                >
                    <option disabled>Select a Service</option>
                    {SERVICES.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                    ))}
                </select>
                {isDisabled && (
                    <div role="alert" className="alert p-2 flex items-center gap-2 w-auto">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <span className='label-text-alt text-xs leading-tight'>
                            Batch API is only applicable for OpenAI services.
                        </span>
                    </div>
                )}
            </div>
        </label>
    );
}
export default ServiceDropdown;