import { useCustomSelector } from "@/customSelector/customSelector";
import { updateServiceAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { defaultModels } from '@/config/defaultModels'; // Adjust the path as needed

export default function ServiceDropdown({ params, onServiceChange }) {
    const [selectedService, setSelectedService] = useState('');
    const dispatch = useDispatch();

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    useEffect(() => {
        if (bridge) {
            setSelectedService(bridge?.service);
            onServiceChange(bridge?.service); // Notify parent component on initial load
        }
    }, [bridge]);

    const handleServiceChange = (e) => {
        const service = e.target.value;
        const defaultModel = defaultModels[service];

        setSelectedService(service);
        onServiceChange(service); // Notify parent component about the service change

        const updatedDataToSend = {
            service: service,
            configuration: {
                type: bridge?.configuration?.type,
                model: defaultModel,
            },
        };

        // if (bridge.configuration.type !== bridge?.configuration?.type) {
        //     const newConfiguration = {
        //         model: defaultModel,
        //         type: bridge.configuration.type,
        //     };

        //     updatedDataToSend.configuration = newConfiguration;
        // }

        dispatch(updateServiceAction({ bridgeId: params.id, service }));
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









