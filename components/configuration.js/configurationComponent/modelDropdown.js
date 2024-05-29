import React, { useEffect, useState } from 'react';
import { services } from '@/jsonFiles/models';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';


const ModelDropdown = ({ dataToSend, params }) => {
    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const dispatch = useDispatch()

    const handleModel = (e) => {
        let updatedDataToSend = {};

        if (dataToSend.configuration.type === e.target.selectedOptions[0].parentNode.label) {
            updatedDataToSend = {
                ...dataToSend,
                configuration: {
                    ...dataToSend.configuration,
                    model: e.target.value, // Update the model in the configuration
                    type: e.target.selectedOptions[0].parentNode.label // Keep the same type
                },
                service: bridge?.service, // Keep the same service
                apikey: bridge?.apikey // Keep the same apiKey
            };
        } else {
            // Define the new dataToSend based on the selected model type
            const newConfiguration = {
                model: e.target.value,
                type: e.target.selectedOptions[0].parentNode.label
            };

            if (e.target.selectedOptions[0].parentNode.label === 'chat') {
                newConfiguration.prompt = [];
            } else if (e.target.selectedOptions[0].parentNode.label === "embedding") {
                newConfiguration.input = "";
            } else if (e.target.selectedOptions[0].parentNode.label === "completion") {
                newConfiguration.prompt = "";
            }

            updatedDataToSend = {
                configuration: newConfiguration,
                service: bridge?.service,
                apikey: bridge?.apiKey
            };
        }

        UpdateBridge(updatedDataToSend);
    }

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
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