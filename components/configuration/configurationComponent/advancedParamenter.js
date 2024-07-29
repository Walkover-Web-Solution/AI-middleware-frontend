import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const AdvancedParameters = ({ params }) => {
    const { modelInfoData, bridge } = useCustomSelector((state) => ({
        modelInfoData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],

    }));

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [sliderValues, setSliderValues] = useState({}); // State to hold slider values


    useEffect(() => {
        if (modelInfoData) {
            const initialSliderValues = Object.entries(modelInfoData).reduce((acc, [key, value]) => {
                if (value.field === 'slider') {
                    acc[key] = value?.default;
                }
                return acc;
            }, {});
            setSliderValues(initialSliderValues);
        }
    }, [modelInfoData]);

    const dispatch = useDispatch();

    const handleSliderChange = (e, key) => {
        const newValue = Number(e?.target?.value);
        setSliderValues({ ...sliderValues, [key]: newValue });
    };

    const handleSliderBlur = (e, key) => {
        const newValue = Number(e.target.value);

        let updatedDataToSend = {
            configuration: {
                model: bridge?.configuration?.model?.default,
                [key]: newValue,
            },
            service: bridge?.service?.toLowerCase(),
        };

        UpdateBridge(updatedDataToSend);
    };

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
        creativity_level: { name: 'Creativity Level', fieldtype: 'slider', description: 'Adjusts how creative the responses are' },
        token_selection_limit: { name: 'Max Tokens Limit', fieldtype: 'slider', description: 'Sets the maximum number of tokens' },
        topP: { name: 'Top P', fieldtype: 'slider', description: 'Controls the diversity of responses' },
        json_mode: { name: 'JSON Mode', fieldtype: 'boolean', description: 'Enable or disable JSON format' },
        probability_cutoff: { name: 'Probability Cutoff', fieldtype: 'slider', description: 'Sets the threshold for probability' },
        repetition_penalty: { name: 'Repetition Penalty', fieldtype: 'slider', description: 'Reduces repetition in responses' },
        novelty_penalty: { name: 'Novelty Penalty', fieldtype: 'slider', description: 'Penalizes responses that lack novelty' },
        log_probability: { name: 'Log Probability', fieldtype: 'boolean', description: 'Log the probabilities of responses' },
        response_count: { name: 'Response Count', fieldtype: 'number', description: 'Number of responses to generate' },
        response_suffix: { name: 'Response Suffix', fieldtype: 'text', description: 'Text to add at the end of responses' },
        stop_sequences: { name: 'Stop Sequences', fieldtype: 'text', description: 'Sequences that signal the end of response' },
        input_text: { name: 'Input Text', fieldtype: 'text', description: 'The initial input text' },
        echo_input: { name: 'Echo Input', fieldtype: 'boolean', description: 'Repeat the input text in the response' },
        best_of: { name: 'Best Of', fieldtype: 'number', description: 'Generate multiple responses and select the best' },
        seed: { name: 'Seed', fieldtype: 'number', description: 'Set a seed for random number generation' }
    };
    
    
    return (
        <div className="collapse text-base-content">
            <input type="radio" name="my-accordion-1" onClick={toggleAccordion} />
            <div className="collapse-title p-0 flex items-center justify-start gap-4 text-xl font-medium cursor-pointer" onClick={toggleAccordion}>
                Advanced Parameters
                {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isAccordionOpen && <div className="collapse-content gap-3 flex flex-col p-2">
                {/* {modelInfoData && Object.entries(modelInfoData)?.map(([key, value]) => (
                    key !== 'model' && key !== 'tools' && key !== 'tool_choice' && key !== "stream" &&
                    <div key={key} className={` ${value?.field === "boolean" ? "flex justify-between item-center" : ""}`}>
                        <div className='flex justify-between items-center w-full'>
                            <p className='capitalize'>{key?.replaceAll("_", " ")}</p>
                            {value?.field === 'slider' && <p>{sliderValues[key]}</p>}
                        </div>
                        {value?.field === "slider" ? (
                            <input
                                type="range"
                                min={value?.min}
                                max={value?.max}
                                step={value?.step}
                                defaultValue={sliderValues[key] || value?.default}
                                onChange={(e) => handleSliderChange(e, key)}
                                onBlur={(e) => handleSliderBlur(e, key)}
                                className="range range-xs w-full"
                                name={key}
                                id={key}
                            />
                        ) : value?.field === 'text' ? (
                            <input
                                type="text"
                                required={value?.level === 1}
                                defaultValue={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                onBlur={(e) => handleInputChange(e, key)}
                                className="input w-full input-bordered max-w-xs input-sm"
                                name={key}
                            />
                        ) : value?.field === 'number' ? (
                            <input
                                type="number"
                                required={value?.level === 1}
                                defaultValue={value?.default}
                                onBlur={(e) => handleInputChange(e, key)}
                                className="input input-bordered max-w-xs input-sm"
                                name={key}
                            />
                        ) : value?.field === 'boolean' ? (
                            <input
                                type="checkbox"
                                required={value?.level === 1}
                                defaultChecked={value?.default?.type === "text" ? false : value?.default?.type === "json_object" ? true : value?.default}
                                onChange={(e) => handleInputChange(e, key)}
                                className="checkbox"
                                name={key}
                            />
                        ) : (
                            "this field is under development"
                        )}
                    </div>
                ))} */}

                {modelInfoData && Object.entries(AdvancedParameters).map(([key, { name, fieldtype, description }]) => {
                    if (!modelInfoData[key]) return null;
                    const fieldData = modelInfoData[key] || {};
                    const { min, max, value, default: defaultValue, step } = fieldData;

                    return (
                        <div key={key} className="form-control">
                            <label className="label">
                                <div className='flex flex-row gap-2 items-center'>
                                    <span className="label-text capitalize">{name}</span>
                                    <div className="tooltip tooltip-right" data-tip={description}>
                                        <Info size={12} />
                                    </div>
                                </div>
                                <p className='text-right'>{value}</p>
                            </label>
                            {fieldtype === 'slider' && (
                                <div>
                                    <input
                                        type="range"
                                        min={min || 0}
                                        max={max || 100}
                                        step={step || 1}
                                        defaultValue={defaultValue || 0}
                                        onChange={(e) => handleInputChange(e, key)}
                                        className="range range-xs w-full"
                                        name={key}
                                    />
                                </div>
                            )}
                            {fieldtype === 'text' && (
                                <input
                                    type="text"
                                    defaultValue={defaultValue || ''}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input input-bordered input-sm w-full"
                                    name={key}
                                />
                            )}
                            {fieldtype === 'number' && (
                                <input
                                    type="number"
                                    min={min}
                                    max={max}
                                    step={step}
                                    defaultValue={defaultValue || 0}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input input-bordered input-sm w-full"
                                    name={key}
                                />
                            )}
                            {fieldtype === 'boolean' && (
                                // <input
                                //     type="checkbox"
                                //     defaultChecked={defaultValue || false}
                                //     onChange={(e) => handleInputChange(e, key)}
                                //     className="checkbox"
                                //     name={key}
                                // />

                                <label className='flex items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
                                    <input
                                        type="checkbox"
                                        key={bridge?.bridgeType}
                                        className="toggle"
                                        defaultChecked={bridge?.bridgeType === "chatbot" ? true : false}
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