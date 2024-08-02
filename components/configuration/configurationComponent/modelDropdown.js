import { useCustomSelector } from '@/customSelector/customSelector';
import { services } from '@/jsonFiles/models';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ModelDropdown = ({ params }) => {
    const dispatch = useDispatch();
    const { model, modelType, modelsList } = useCustomSelector((state) => ({
        model: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.model,
        modelType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type,
        modelsList: state?.modelReducer?.serviceModels[state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service],
    }));
    console.log(modelType, model)

    const handleModel = (e) => {
        const selectedModel = e.target.value.split('|')[1];
        const selectedModelType = e.target.selectedOptions[0].parentNode.label;

        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { model: selectedModel, type: selectedModelType } } }));
    };

    return (
        <label className="form-control max-w-xs ">
            <div className="label">
                <span className="label-text">Model</span>
            </div>
            <select
                value={`${modelType}|${model}`}
                onChange={handleModel}
                className="select select-sm max-w-xs select-bordered"
            >
                <option disabled>Select a Model</option>
                {services && Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
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
    );
};

export default ModelDropdown;