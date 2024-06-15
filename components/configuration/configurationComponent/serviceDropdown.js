import { useCustomSelector } from "@/customSelector/customSelector";
import { updateServiceAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { services } from '@/jsonFiles/models'; // Adjust the path as needed

export default function ServiceDropdown({ params }) {
    const [selectedService, setSelectedService] = useState('');
    const dispatch = useDispatch();

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    useEffect(() => {
        if (bridge) {
            setSelectedService(bridge?.service);
        }
    }, [bridge]);

    const handleServiceChange = (e) => {
        const service = e.target.value;
        const defaultModel = services[service]?.completion?.values().next().value || null; // Get the default model for the selected service

        setSelectedService(service);
        const updatedDataToSend = {
            service: service,
            configuration: {
                type: bridge?.type,
                model: defaultModel,
            },
        };

        // dispatch(updateServiceAction({ bridgeId: params.id, service }));
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: updatedDataToSend }));
    };

    return (
        <div>
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text">Service</span>
                </div>
                <select value={selectedService} onChange={handleServiceChange} className="select select-sm max-w-xs select-bordered">
                    <option disabled>Select a Service</option>
                    <option value="google">google</option>
                    <option value="openai">openai</option>
                </select>
            </label>
        </div>
    );
}










