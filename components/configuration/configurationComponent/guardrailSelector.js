import React, { useState, useEffect, useCallback } from 'react';
import { CirclePlusIcon, CloseCircleIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';


const GuardrailSelector = ({ params, searchParams }) => {  
    const { guardrailsData,GUARDRAILS_TEMPLATES } = useCustomSelector(
        (state) => ({
            guardrailsData: state.bridgeReducer.bridgeVersionMapping[params?.id]?.[searchParams?.version]?.guardrails,
            GUARDRAILS_TEMPLATES: state.flowDataReducer.flowData.guardrailsTemplatesData

        })
    );
    const [customPrompt, setCustomPrompt] = useState(guardrailsData?.guardrails_custom_prompt);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [selectedGuardrails, setSelectedGuardrails] = useState([]);
    const [guardrailsEnabled, setGuardrailsEnabled] = useState(guardrailsData?.is_enabled);
    const [showOptions, setShowOptions] = useState(false);
    const dispatch = useDispatch();

    // Memoized function to update store with specific values
    const updateGuardrailsInStore = useCallback((enabled, selected, customPromptValue) => {
        // Build guardrails configuration object with all options
        const guardrails_configuration = {};
        
        // Set all guardrail options to false by default
        Object.keys(GUARDRAILS_TEMPLATES).forEach(key => {
            guardrails_configuration[key] = false;
        });
        
        // Set selected guardrails to true
        selected.forEach(key => {
            if (key !== 'custom' && guardrails_configuration.hasOwnProperty(key)) {
                guardrails_configuration[key] = true;
            }
        });
        
        const dataToSend = {
            guardrails: {
                is_enabled: enabled,
                guardrails_configuration,
                guardrails_custom_prompt: selected.includes('custom') ? customPromptValue : ''
            }
        };

        dispatch(updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: dataToSend
        }));
    }, [dispatch, searchParams?.version]);

    useEffect(() => {
        if (guardrailsData) {
            // Set enabled state from is_enabled
            
            // Set selected guardrails from guardrails_configuration
            const selected = Object.entries(guardrailsData.guardrails_configuration)
                .filter(([_, isEnabled]) => isEnabled)
                .map(([key]) => key);
            setSelectedGuardrails(selected);
            
            // Set custom prompt if available
            if (guardrailsData.guardrails_custom_prompt) {
                setCustomPrompt(guardrailsData.guardrails_custom_prompt);
                
                // Show custom input if we have a custom prompt
                if (guardrailsData.guardrails_custom_prompt.trim() !== '') {
                    setShowCustomInput(true);
                    // Add custom to selected if not already there
                    if (!selected.includes('custom')) {
                        setSelectedGuardrails(prev => [...prev, 'custom']);
                    }
                }
            }
        }
    }, [guardrailsData]);

    const handleGuardrailChange = (guardrailKey) => {
        if (guardrailKey === "custom") {
            // Toggle custom input visibility
            const newShowCustomInput = !showCustomInput;
            setShowCustomInput(newShowCustomInput);
            
            let newSelectedGuardrails;
            if (newShowCustomInput) {
                // Add custom to selected guardrails if not already there
                newSelectedGuardrails = selectedGuardrails.includes("custom") 
                    ? selectedGuardrails 
                    : [...selectedGuardrails, "custom"];
            } else {
                // Remove custom from selected guardrails
                newSelectedGuardrails = selectedGuardrails.filter(key => key !== "custom");
                // Clear custom prompt when removing custom
                setCustomPrompt('');
            }
            
            setSelectedGuardrails(newSelectedGuardrails);
            // Update store immediately with new values
            {customPrompt.trim() !== '' && updateGuardrailsInStore(guardrailsEnabled, newSelectedGuardrails, newShowCustomInput ? customPrompt : '');}
        } else {
            // Toggle regular guardrail selection
            let newSelectedGuardrails;
            if (selectedGuardrails.includes(guardrailKey)) {
                newSelectedGuardrails = selectedGuardrails.filter(key => key !== guardrailKey);
            } else {
                newSelectedGuardrails = [...selectedGuardrails, guardrailKey];
            }
            
            setSelectedGuardrails(newSelectedGuardrails);
            // Update store immediately with new values
            updateGuardrailsInStore(guardrailsEnabled, newSelectedGuardrails, customPrompt);
        }
    };
    
    // Toggle guardrails enable/disable
    const handleToggleGuardrails = () => {
        const newEnabledState = !guardrailsEnabled;
        setGuardrailsEnabled(newEnabledState);
        
        if (!newEnabledState) {
            setShowOptions(false);
        }
        
        // Update store with new enabled state immediately
        updateGuardrailsInStore(newEnabledState, selectedGuardrails, customPrompt);
    };
    
    // Toggle showing options panel
    const handleToggleOptions = () => {
        setShowOptions(!showOptions);
    };
    
    // Handle custom guardrail prompt change with debounce
    const handleCustomPromptChange = (e) => {
        const newPromptValue = e.target.value;
        setCustomPrompt(newPromptValue);
        
        // Delay updating the store to avoid too many updates while typing
        updateGuardrailsInStore(guardrailsEnabled, selectedGuardrails, newPromptValue);
    };
    
    return (
        <div className="form-control border border-base-content/20 rounded-md w-full">
            {/* Always visible header with toggle */}
            <div className="label flex items-center ml-2 justify-between">
                <div className="flex items-center gap-2">
                    <InfoTooltip tooltipContent="Guardrails help ensure that the AI responses adhere to specific guidelines or restrictions.">
                        <span className="label-text capitalize font-medium">Prompt Guards</span>
                    </InfoTooltip>
                </div>
                <label className="swap">
                    <input 
                        type="checkbox" 
                        checked={guardrailsEnabled} 
                        onChange={handleToggleGuardrails}
                        className="toggle"
                    />
                    
                </label>
            </div>
            
            {/* Only visible when guardrails enabled */}
            {guardrailsEnabled && (
                <>
                    {/* Selected guardrails */}
                    <div className="mt-2 mb-2 ml-2">
                        <div className="text-sm">
                            {selectedGuardrails.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    <span className="font-medium">Selected: </span>
                                    {selectedGuardrails.map(key => (
                                        <span key={key} className="badge badge-sm badge-outline">
                                            {key === 'custom' ? 'Custom' : GUARDRAILS_TEMPLATES[key]?.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-500">No guardrails selected</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Button to show options or close options */}
                    <div className="m-2 mb-4">
                        {!showOptions ? (
                            <button
                                onClick={handleToggleOptions}
                                className="btn btn-sm btn-outline w-full flex items-center gap-2"
                            >
                                <CirclePlusIcon size={16} />
                                <span>Add Guardrail Types</span>
                            </button>
                        ) : (
                            <div className="bg-base-100 border border-base-300 rounded-md">
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Available Guards</span>
                                        <button
                                            onClick={handleToggleOptions}
                                            className="btn btn-ghost btn-xs btn-circle"
                                        >
                                            <CloseCircleIcon size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                                        {/* Predefined Guardrails */}
                                        {Object.entries(GUARDRAILS_TEMPLATES).map(([key, { name, description }]) => (
                                            <div key={key} className="form-control">
                                                <div className="label justify-start gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-sm" 
                                                        checked={selectedGuardrails.includes(key)} 
                                                        onChange={() => handleGuardrailChange(key)} 
                                                        />
                                                    <InfoTooltip tooltipContent={description}>
                                                    <span className="label-text">{name}</span>
                                                    </InfoTooltip>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Custom Guardrail */}
                                        <div className="form-control col-span-full">
                                            <div className="label justify-start gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    className="checkbox checkbox-sm" 
                                                    checked={showCustomInput || customPrompt.trim() !== ''} 
                                                    onChange={() => handleGuardrailChange('custom')} 
                                                    />
                                                <InfoTooltip tooltipContent="Add your own custom guardrail specification">
                                                <span className="label-text">Custom Guard</span>
                                                </InfoTooltip>
                                            </div>
                                            
                                            {showCustomInput && (
                                                <div className="mt-2">
                                                    <textarea
                                                        placeholder="Write your custom guardrail prompt here..."
                                                        className="textarea textarea-bordered w-full h-24 text-sm"
                                                        onBlur={handleCustomPromptChange}
                                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                                        value={customPrompt}
                                                    ></textarea>
                                                    <p className="text-xs text-gray-500 mt-1">Specify instructions for your custom guardrail</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
export default GuardrailSelector;