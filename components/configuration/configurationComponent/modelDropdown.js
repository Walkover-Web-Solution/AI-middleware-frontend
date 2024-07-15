import React, { useEffect, useState } from 'react';
import { services } from '@/jsonFiles/models';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';

const ModelDropdown = ({ params }) => {
    const { bridge, service } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service,
    }));

    const dispatch = useDispatch();

    const updateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    };

    const handleModel = (e) => {
        const selectedModel = e.target.value.split('|')[1];
        const modelType = e.target.selectedOptions[0].parentNode.label;

        let updatedDataToSend = {
            service: bridge?.service?.toLowerCase(),
            configuration: {
                model: selectedModel,
                type: modelType,
            },
        };

        if (modelType !== bridge?.configuration?.type) {
            const newConfiguration = {
                model: selectedModel,
                type: modelType,
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
        }

        updateBridge(updatedDataToSend);
    };

    return (
        <label className="form-control max-w-xs ">
            <div className="label">
                <span className="label-text">Model</span>
            </div>
            <select
                value={`${bridge?.type}|${bridge?.configuration?.model?.default}`}
                onChange={handleModel}
                className="select select-sm max-w-xs select-bordered"
            >
                <option disabled>Select a Model</option>
                {services && Object.entries(services?.[service] || {}).map(([group, options], groupIndex) => (
                    group !== 'models' && (
                        <optgroup label={group} key={`group_${groupIndex}`}>
                            {Array.from(options).map((option, optionIndex) => (
                                <option key={`option_${groupIndex}_${optionIndex}`} value={`${group}|${option}`}>
                                    {option}
                                </option>
                            ))}
                        </optgroup>
                    )
                ))}
            </select>
        </label>
    );
};

export default ModelDropdown;
