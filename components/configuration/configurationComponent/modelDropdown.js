import { useCustomSelector } from '@/customSelector/customSelector';
import { ADVANCED_BRIDGE_PARAMETERS, getDefaultValues } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ModelDropdown = ({ params }) => {
    const dispatch = useDispatch();
    const { model, fineTuneModel, modelType, modelsList } = useCustomSelector((state) => ({
        model: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.model,
        fineTuneModel: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.fine_tune_model?.current_model,
        modelType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type,
        modelsList: state?.modelReducer?.serviceModels[state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service],
    }));

    const handleModel = (e) => {
        const selectedModel = e.target.value.split('|')[1];
        const selectedModelType = e.target.selectedOptions[0].parentNode.label;

        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { model: selectedModel, type: selectedModelType } } }));
        const updatedParams = getDefaultValues(modelsList?.[selectedModelType]?.[selectedModel]?.configuration?.['additional_parameters'], ADVANCED_BRIDGE_PARAMETERS)
        updatedParams && dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: updatedParams } }));
    };

    const handleFinetuneModelChange = (e) => {
        const selectedFineTunedModel = e.target.value;
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { fine_tune_model: { current_model: selectedFineTunedModel } } } }));
    }

    return (
        <div className="flex space-x-4">
            {/* First Dropdown */}
            <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text font-medium">Model</span>
                </div>
                <select
                    value={`${modelType}|${model}`}
                    onChange={handleModel}
                    className="select select-sm w-full select-bordered"
                >
                    <option disabled>Select a Model</option>
                    {Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
                        if (group !== 'models') {
                            return (
                                <optgroup label={group} key={`group_${groupIndex}`}>
                                    {Object.keys(options || {}).map((option, optionIndex) => {
                                        const modelName = options?.[option]?.configuration?.model?.default;
                                        return (
                                            <option key={`option_${groupIndex}_${optionIndex}`} value={`${group}|${modelName}`}>
                                                {modelName}
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            );
                        }
                        return null;
                    })}
                </select>
            </label>

            {/* If model is fine-tuned model*/}
            {modelType === 'fine-tune' && <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">Fine-Tune Model</span>
                </div>
                <input
                    type="text"
                    name="name"
                    key={fineTuneModel}
                    defaultValue={fineTuneModel}
                    onBlur={handleFinetuneModelChange}
                    placeholder="Fine-tune model Name"
                    className="input input-bordered input-sm w-full"
                />
            </label>
            }
        </div>
    );

};

export default ModelDropdown;