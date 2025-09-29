import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
// Model Preview component to display model specifications
const ModelPreview = memo(({ hoveredModel, modelSpecs, dropdownRef }) => {
    if (!hoveredModel || !modelSpecs || !dropdownRef?.current) return null;

    // Calculate position relative to dropdown with viewport constraints
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const previewHeight = Math.min(500, viewportHeight - 100); // Max 500px or viewport - 100px
    
    const previewStyle = {
        position: 'fixed',
        top: Math.max(20, Math.min(dropdownRect.top, viewportHeight - previewHeight - 20)),
        left: dropdownRect.left - 270, // Position to the left of dropdown
        zIndex: 99999,
        maxHeight: `${previewHeight}px`,
        overflowY: 'auto'
    };

    // Use createPortal to render directly to document body
    return createPortal(
        <div className="w-[260px] bg-base-100 border border-base-content/20 rounded-lg shadow-xl p-4 transition-all duration-200 ease-in-out" style={previewStyle}>
            <div className="space-y-3">
                <div className="border-b border-base-300 pb-2">
                    <h3 className="text-lg font-semibold text-base-content truncate">{hoveredModel}</h3>
                    {modelSpecs?.description && (
                        <p className="text-xs text-base-content/80 mt-1">
                            {modelSpecs.description}
                        </p>
                    )}
                </div>

                {modelSpecs && (['input_cost', 'output_cost'].some(type => modelSpecs[type])) && (
                    <div className="space-y-2">
                        {['input_cost', 'output_cost'].map((type) => {
                            const spec = modelSpecs?.[type];
                            const cost = modelSpecs?.cost?.[type];
                            return spec && (
                                <div key={type} className="bg-base-200/50 p-2 rounded-md">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-xs font-medium text-base-content capitalize">
                                            {type.replace('_', ' ')}
                                        </h4>
                                        {cost && (
                                            <span className="text-xs text-base-content/70">
                                                {cost}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-base-content/80 break-words leading-tight">
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
                        <div className="space-y-2">
                            {Object.entries(modelSpecs)
                                .filter(([key, value]) =>
                                    !['input_cost', 'output_cost', 'description'].includes(key) &&
                                    value &&
                                    (!Array.isArray(value) || value.length > 0)
                                )
                                .map(([key, value]) => (
                                    <div key={key} className="bg-base-200/50 p-2 rounded-md">
                                        <h4 className="text-xs font-medium text-base-content mb-1 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </h4>
                                        {Array.isArray(value) ? (
                                            <ul className="space-y-0.5">
                                                {value.slice(0, 3).map((item, index) => (
                                                    item && (
                                                        <li key={index} className="text-xs text-base-content/80 pl-2">
                                                            • {item}
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-base-content/80 break-words leading-tight">
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
        </div>,
        document.body
    );
});

ModelPreview.displayName = 'ModelPreview';

const ModelDropdown = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const { model, fineTuneModel, modelType, modelsList, bridgeType } = useCustomSelector((state) => ({
        model: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.model,
        fineTuneModel: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.fine_tune_model?.current_model,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type,
        modelsList: state?.modelReducer?.serviceModels[state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service],
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    }));

    const [hoveredModel, setHoveredModel] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modelSpecs, setModelSpecs] = useState();

    // Close when other dropdowns open
    useEffect(() => {
        const handler = (e) => {
            const source = e?.detail?.type;
            if (source && source !== 'model') {
                setIsDropdownOpen(false);
            }
        };
        window.addEventListener('open-dropdown', handler);
        return () => window.removeEventListener('open-dropdown', handler);
    }, []);

    const handleFinetuneModelChange = (e) => {
        const selectedFineTunedModel = e.target.value;
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: searchParams?.version,
            dataToSend: {
                configuration: {
                    fine_tune_model: {
                        current_model: selectedFineTunedModel
                    }
                }
            }
        }));
    }

    const handleModelHover = (modelName) => {
        setHoveredModel(modelName);
        let modelSpec = null;
        Object.entries(modelsList || {}).forEach(([group, options]) => {
            Object.entries(options || {}).forEach(([option, config]) => {
                if (config?.configuration?.model?.default === modelName) {
                    modelSpec = config?.validationConfig?.specification;
                }
            });
        });
        setModelSpecs(modelSpec);
    };

    const handleModelClick = (group, modelName) => {
        const selectedModelType = group;
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: searchParams?.version,
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
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside, isDropdownOpen]);

    const toggleDropdown = () => {
        const next = !isDropdownOpen;
        if (next) {
            // announce opening to close other dropdowns
            window.dispatchEvent(new CustomEvent('open-dropdown', { detail: { type: 'model' } }));
        }
        setIsDropdownOpen(next);
    };

    return (
        <div className="flex flex-col items-start gap-4 relative">
            <div className="w-full max-w-xs">
                <div className="label">
                    <span className="label-text text-base-content">LLM Model</span>
                </div>
                <div className="dropdown w-full font-normal" ref={dropdownRef}>
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-sm w-full justify-between border border-base-content/20 bg-base-100 hover:bg-base-200 font-normal"
                        onClick={toggleDropdown}
                    >
                        {model?.length > 20 ? `${model.substring(0, 20)}...` : model|| "Select a Model"}
                        {isDropdownOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </div>
                    {isDropdownOpen && (
                        <ul
                            tabIndex={0}
                            className="dropdown-content dropdown-left z-high p-2 shadow bg-base-100 rounded-lg mt-1 max-h-[500px] w-[260px] overflow-y-auto border border-base-300"
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
                                            <span className="text-sm  text-base-content">{group}</span>
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
                                                            className={`hover:bg-base-200 rounded-md py-1 ${modelName === model && 'bg-base-200'}`}
                                                        >
                                                            {modelName === model && <span className="flex-shrink-0 ml-2">✓</span>}
                                                            <span className={`truncate flex-1 pl-2 ${modelName !== model && 'ml-4'}`}>
                                                                {modelName?.length > 30 ? `${modelName.substring(0, 30)}...` : modelName}
                                                            </span>
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

            <ModelPreview hoveredModel={hoveredModel} modelSpecs={modelSpecs} dropdownRef={dropdownRef} />

            {/* If model is fine-tuned model*/}
            {modelType === 'fine-tune' && (
                <div className="w-full max-w-xs">
                    <div className="label">
                        <span className="label-text text-base-content">Fine-Tune Model</span>
                    </div>
                    <input
                        type="text"
                        name="name"
                        key={fineTuneModel}
                        defaultValue={fineTuneModel}
                        onBlur={handleFinetuneModelChange}
                        placeholder="Fine-tune model Name"
                        className="input input-bordered input-sm w-full bg-base-100 text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
            )}
        </div>
    );
};

export default ModelDropdown;