import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const AdvancedParameters = ({ params }) => {
    const { service, model, type, bridge, configuration } = useCustomSelector((state) => ({
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service?.toLowerCase(),
        model: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.model,
        type: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        configuration: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration,

    }));
    console.log(model)
    const serviceModel = model?.replace(/-/g, '_');
    const { modelInfoData } = useCustomSelector((state) => ({
        modelInfoData: state?.modelReducer?.serviceModels?.[service]?.[type]?.[serviceModel]?.configuration?.additional_parameters,
    }));

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleInputChange = (e, key, isSlider = false) => {
        let newValue = e.target.value;
        let newCheckedValue = e.target.checked;
        if (e.target.type === 'number') {
            newValue = newValue.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
        }


        let updatedDataToSend = {
            service: bridge?.service?.toLowerCase(),
            configuration: {
                model: bridge?.configuration?.model?.default,
                [key]: isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue,
            }
        };
        if (key === 'response_format') {
            updatedDataToSend.configuration.response_format = newCheckedValue ? { type: "json_object" } : { type: "text" };
        }

        UpdateBridge(updatedDataToSend);
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    };


    const toggleAccordion = () => {
        setIsAccordionOpen((prevState) => !prevState);
    };

    const AdvancedParameters = {
        creativity_level: { name: 'Creativity Level', description: 'Adjusts how creative the responses are' },
        token_selection_limit: { name: 'Max Tokens Limit', description: 'Sets the maximum number of tokens' },
        topP: { name: 'Top P', description: 'Controls the diversity of responses' },
        json_mode: { name: 'JSON Mode', description: 'Enable or disable JSON format' },
        probability_cutoff: { name: 'Probability Cutoff', description: 'Sets the threshold for probability' },
        repetition_penalty: { name: 'Repetition Penalty', description: 'Reduces repetition in responses' },
        novelty_penalty: { name: 'Novelty Penalty', description: 'Penalizes responses that lack novelty' },
        log_probability: { name: 'Log Probability', description: 'Log the probabilities of responses' },
        response_count: { name: 'Response Count', description: 'Number of responses to generate' },
        response_suffix: { name: 'Response Suffix', description: 'Text to add at the end of responses' },
        additional_stop_sequences: { name: 'Stop Sequences', description: 'Sequences that signal the end of response' },
        input_text: { name: 'Input Text', description: 'The initial input text' },
        echo_input: { name: 'Echo Input', description: 'Repeat the input text in the response' },
        best_response_count: { name: 'Best Of', description: 'Generate multiple responses and select the best' },
        seed: { name: 'Seed', description: 'Set a seed for random number generation' },
        tool_choice: { name: 'Tool Choice', description: 'Number of responses to generate' }, // need to change description
    };

    const keysNotToDisplay = ['model', 'prompt', 'apikey', 'type', 'bridgeType', 'tools', 'response_format'];

    return (
        <div className="collapse text-base-content">
            <input type="radio" name="my-accordion-1" onClick={toggleAccordion} />
            <div className="collapse-title p-0 flex items-center justify-start gap-4 text-xl font-medium cursor-pointer" onClick={toggleAccordion}>
                Advanced Parameters
                {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isAccordionOpen && <div className="collapse-content gap-3 flex flex-col p-2">
                {modelInfoData && Object.entries(modelInfoData).map(([key, { field, min, max, step, default: defaultValue }]) => {
                    if (keysNotToDisplay.includes(key)) return null;
                    const name = AdvancedParameters[key]?.name || key;
                    const description = AdvancedParameters[key]?.description || '';


                    return (
                        <div key={key} className="form-control">
                            <label className="label">
                                <div className='flex flex-row gap-2 items-center'>
                                    <span className="label-text capitalize">{name || key}</span>
                                    <div className="tooltip tooltip-right" data-tip={description}>
                                        <Info size={12} />
                                    </div>
                                </div>
                                {((field === 'slider' || field === 'number') && !(min <= configuration?.[key] <= max)) &&  <p className='text-right bg-error-content'>Error</p>}
                                {field === 'slider' && <p className='text-right' id={`sliderValue-${key}`}>{configuration?.[key]}</p>}
                            </label>
                            {field === 'slider' && (
                                <div>
                                    <input
                                        type="range"
                                        min={min || 0}
                                        max={max || 100}
                                        step={step || 1}
                                        key={configuration?.[key]}
                                        defaultValue={configuration?.[key] || 0}
                                        onBlur={(e) => handleInputChange(e, key)}
                                        onInput={(e) => {
                                            document.getElementById(`sliderValue-${key}`).innerText = e.target.value;
                                        }}
                                        className="range range-xs w-full"
                                        name={key}
                                    />
                                </div>
                            )}
                            {field === 'text' && (
                                <input
                                    type="text"
                                    defaultValue={configuration?.[key] || ''}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input input-bordered input-sm w-full"
                                    name={key}
                                />
                            )}
                            {field === 'number' && (
                                <input
                                    type="number"
                                    min={min}
                                    max={max}
                                    step={step}
                                    defaultValue={configuration?.[key] || 0}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input input-bordered input-sm w-full"
                                    name={key}
                                />
                            )}
                            {field === 'boolean' && (
                                <label className='flex items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
                                    <input
                                        type="checkbox"
                                        key={bridge?.bridgeType}
                                        className="toggle"
                                        defaultChecked={configuration?.[key]}
                                        onChange={(e) => handleInputChange(e, "bridgeType")}
                                    />
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>}
        </div>
    );
};

export default AdvancedParameters;