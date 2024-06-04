import React, { useEffect, useState } from 'react';
import { services } from '@/jsonFiles/models';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';


const ModelDropdown = ({ params }) => {
    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const dispatch = useDispatch()
    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

    const handleModel = (e) => {
        let updatedDataToSend = {};

        if (bridge.configuration.type === e.target.selectedOptions[0].parentNode.label) {
            updatedDataToSend = {
                service: bridge?.service?.toLowerCase(),
                configuration: {
                    model: e.target.value, // Update the model in the configuration
                    type: e.target.selectedOptions[0].parentNode.label // Keep the same type
                },
            };
        } else {
            // Define the new bridge based on the selected model type
            const newConfiguration = {
                model: e.target.value,
                type: e.target.selectedOptions[0].parentNode.label
            };

            if (e.target.selectedOptions[0].parentNode.label !== bridge?.type) {
                if (e.target.selectedOptions[0].parentNode.label === "chat") newConfiguration.prompt = [];
                else if (e.target.selectedOptions[0].parentNode.label === "embedding") newConfiguration.input = "";
                else if (e.target.selectedOptions[0].parentNode.label === "completion") newConfiguration.prompt = "";
            }
            updatedDataToSend = {
                configuration: newConfiguration,
                service: bridge?.service,
            };

            UpdateBridge(updatedDataToSend);
        }


    }
    return (
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text">Model</span>
            </div>
            <select value={bridge?.configuration?.model?.default} onChange={handleModel} className="select select-sm max-w-xs select-bordered">
                <option disabled>Select a Model</option>
                {Object.entries(services?.[bridge?.service] || {}).map(([group, options]) => (
                    group !== 'models' && // Exclude the 'models' group
                    <optgroup label={group} key={group}>
                        {Array.from(options).map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </label>

    );
};

export default ModelDropdown;