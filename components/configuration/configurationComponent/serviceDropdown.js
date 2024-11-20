import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL, SERVICES } from "@/jsonFiles/bridgeParameter";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

function ServiceDropdown({ params }) {
    const { service } = useCustomSelector((state) => ({
        // service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service,
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
        // dispatch(updateBridgeAction({
        //     bridgeId: params.id,
        //     dataToSend: { service: newService, configuration: { model: defaultModel } }
        // }));
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId : params.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, params.version]);

    return (
        <div>
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text font-medium">Service</span>
                </div>
                <select value={selectedService} onChange={handleServiceChange} className="select select-sm max-w-xs select-bordered capitalize">
                    <option disabled>Select a Service</option>
                    {SERVICES.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}
export default ServiceDropdown;