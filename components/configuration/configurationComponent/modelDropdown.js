import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const ModelDropdown = ({ params }) => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const { model, fineTuneModel, modelType, modelsList, bridgeType } = useCustomSelector((state) => ({
        model: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model,
        fineTuneModel: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.fine_tune_model?.current_model,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type,
        modelsList: state?.modelReducer?.serviceModels[state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service],
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    }));

    const [hoveredModel, setHoveredModel] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modelSpecs, setModelSpecs] = useState();

    const handleFinetuneModelChange = (e) => {
        const selectedFineTunedModel = e.target.value;
        // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { fine_tune_model: { current_model: selectedFineTunedModel } } } }));
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { configuration: { fine_tune_model: { current_model: selectedFineTunedModel } } } }));
    }

    const handleModelHover = (modelName) => {
        setHoveredModel(modelName);
        let modelSpec = null;
        Object.entries(modelsList || {}).forEach(([group, options]) => {
            Object.entries(options || {}).forEach(([option, config]) => {
                if (config?.configuration?.model?.default === modelName) {
                    modelSpec = config?.configuration?.additional_parameters?.specification;
                }
            });
        });
        setModelSpecs(modelSpec);
    };

    const handleModelClick = (group, modelName) => {
        const selectedModelType = group;
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { configuration: { model: modelName, type: selectedModelType } }
        }));
        setHoveredModel(null);
        setIsDropdownOpen(false);
    };
    
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && isDropdownOpen && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    }, [isDropdownOpen]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    return (
        <div className="flex items-start gap-4 relative">
            <div className="w-full max-w-xs z-[999]">
                <div className="label">
                    <span className="label-text text-gray-700">Model</span>
                </div>
                <div className="dropdown w-full font-normal" ref={dropdownRef}>
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-sm w-full justify-between border border-gray-300 bg-white hover:bg-gray-50 font-normal"
                        onClick={toggleDropdown}
                    >
                        {model || "Select a Model"}
                        {isDropdownOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </div>
                    {isDropdownOpen && (
                        <ul
                            tabIndex={0}
                            className="dropdown-content dropdown-left z-[1] p-2 shadow bg-white rounded-lg w-full mt-1 max-h-[500px] overflow-y-auto border border-gray-100"
                            onMouseLeave={() => setHoveredModel(null)}
                        >
                            {Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
                                const isInvalidGroup =
                                    group === 'models' ||
                                    (bridgeType === 'chatbot' && group === 'embedding') ||
                                    (bridgeType === 'batch' && (group === 'image' || group === 'embedding'));

                                if (!isInvalidGroup) {
                                    return (
                                        <li key={`group_${groupIndex}`} className="px-2 py-1 cursor-pointer">
                                            <span className="text-sm text-gray-500">{group}</span>
                                            <ul className="">
                                                {Object.keys(options || {}).map((option, optionIndex) => {
                                                    const modelName = options?.[option]?.configuration?.model?.default;
                                                    return (
                                                        <li
                                                            key={`option_${groupIndex}_${optionIndex}`}
                                                            onMouseEnter={() => handleModelHover(modelName)}
                                                            onMouseLeave={() => setHoveredModel(null)}
                                                            onClick={() => {
                                                                handleModelClick(group, modelName);
                                                            }}
                                                            className="hover:bg-gray-50 rounded-md py-1"
                                                        >
                                                            <a className="text-gray-700 hover:text-gray-900 px-2 py-3">{modelName}</a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                    );
                                }
                                return null;
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {hoveredModel && modelSpecs && (
                <div className="max-w-[500px] bg-white border border-gray-100 rounded-xl shadow-xl p-4 mt-8 top-0 absolute left-[320px] transition-all duration-300 ease-in-out">
                    <div className="space-y-3">
                        <div className="border-b pb-2">
                            {modelSpecs && <h3 className="text-lg font-semibold text-gray-900">{hoveredModel}</h3>}
                            {modelSpecs?.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {modelSpecs.description}
                                </p>
                            )}
                        </div>

                        {modelSpecs && (['input_cost', 'output_cost'].some(type => modelSpecs[type])) && (
                            <div className="grid grid-cols-2 gap-2">
                                {['input_cost', 'output_cost'].map((type) => {
                                    const spec = modelSpecs?.[type];
                                    const cost = modelSpecs?.cost?.[type];
                                    return spec && (
                                        <div key={type} className="bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-medium text-gray-700 capitalize tracking-wide">
                                                    {type.replace('_', ' ')}
                                                </h4>
                                                {cost && (
                                                    <p className="text-xs text-gray-500 ml-2">
                                                        Cost: {cost}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 break-words leading-tight mt-1">
                                                {typeof spec === 'object'
                                                    ? JSON.stringify(spec, null, 2)
                                                    : spec}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {modelSpecs && Object.entries(modelSpecs)
                            .filter(([key, value]) =>
                                !['input_cost', 'output_cost', 'description'].includes(key) &&
                                value &&
                                (!Array.isArray(value) || value.length > 0)
                            ).length > 0 && (
                                <div className="w-full">
                                    {Object.entries(modelSpecs)
                                        .filter(([key, value]) =>
                                            !['input_cost', 'output_cost', 'description'].includes(key) &&
                                            value &&
                                            (!Array.isArray(value) || value.length > 0)
                                        )
                                        .map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors mb-2">
                                                <h4 className="text-xs font-medium text-gray-700 mb-1 capitalize tracking-wide">
                                                    {key.replace(/_/g, ' ')}
                                                </h4>
                                                {Array.isArray(value) ? (
                                                    <ul className="space-y-0.5">
                                                        {value.map((item, index) => (
                                                            item && (
                                                                <li key={index} className="text-xs text-gray-600 pl-1.5">
                                                                    • {item}
                                                                </li>
                                                            )
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-xs text-gray-600 break-words leading-tight">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value, null, 2)
                                                            : value}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* If model is fine-tuned model*/}
            {modelType === 'fine-tune' && (
                <div className="w-full  max-w-xs">
                    <div className="label">
                        <span className="label-text text-gray-700">Fine-Tune Model</span>
                    </div>
                    <input
                        type="text"
                        name="name"
                        key={fineTuneModel}
                        defaultValue={fineTuneModel}
                        onBlur={handleFinetuneModelChange}
                        placeholder="Fine-tune model Name"
                        className="input input-bordered input-sm w-full bg-white text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
            )}
        </div>
    );
};

export default ModelDropdown;