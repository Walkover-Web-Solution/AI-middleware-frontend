import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'; // Import useState
import { useDispatch } from 'react-redux';

const AdvancedParameters = ({ params, dataToSend: localdata }) => {

    const { modelInfoData } = useCustomSelector((state) => ({
        modelInfoData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration,
    }));
    const [dataToSend, setDataToSend] = useState(localdata)


    useEffect(() => {
        setDataToSend(localdata)
    }, [localdata])


    // Initialize state for slider values
    const [sliderValues, setSliderValues] = useState({});
    const dispatch = useDispatch()


    // Function to handle slider change
    const handleSliderChange = (e, key) => {
        handleInputChange(e, key, true); // Call the existing handleInputChange
        setSliderValues({ ...sliderValues, [key]: e.target.value }); // Update the slider value in state
    };
    const handleSliderStop = (key) => {
        // Call UpdateBridge with the current dataToSend state
        UpdateBridge(dataToSend);
    };

    const handleInputChange = (e, key, isBoolean, isSlider = false) => {
        let newValue = e.target.value;
        let newCheckedValue = e.target.checked
        if (e.target.type === 'number') {
            newValue = newValue.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
        }


        // Prepare the updated dataToSend object
        let updatedDataToSend = {
            ...dataToSend,
            configuration: {
                ...dataToSend.configuration,
                [key]: isSlider ? Number(newValue) : isBoolean ? newCheckedValue : newValue,
            }
        };
        // If the key is 'responseFormat', check the value and add the appropriate type
        if (key === 'response_format') {
            const typeValue = newCheckedValue === true ? 'json_object' : newCheckedValue === false ? 'text' : null;
            if (typeValue) {
                updatedDataToSend = {
                    ...updatedDataToSend,
                    configuration: {
                        ...updatedDataToSend.configuration,
                        [key]: {
                            // ...updatedDataToSend.configuration[key],
                            type: typeValue,
                        },
                    },
                };
            }
        }

        setDataToSend(updatedDataToSend);
        // For non-slider inputs, call UpdateBridge immediately
        if (!isSlider) {
            UpdateBridge(updatedDataToSend);
        }
    };


    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    // Toggle function
    const toggleAccordion = () => {
        setIsAccordionOpen(!isAccordionOpen);
    };

    return (
        <div className="collapse ">
            <input type="radio" name="my-accordion-1" onClick={toggleAccordion} />
            <div className="collapse-title p-0 flex items-center justify-start gap-4 text-xl font-medium cursor-pointer" onClick={toggleAccordion}>
                Advanced Parameters
                {/* Conditionally render Chevron icons */}
                {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            <div className="collapse-content gap-3 flex flex-col p-0">
                {modelInfoData && isAccordionOpen && Object.entries(modelInfoData).map(([key, value]) => {
                    if (['model', 'tools', 'tool_choice', 'stream'].includes(key)) return null;

                    const isSlider = value.field === 'slider';
                    const isBoolean = value.field === 'boolean';
                    const isTextOrNumber = ['text', 'number'].includes(value.field);
                    const defaultValue = typeof value.default === 'object' ? JSON.stringify(value.default) : value.default;

                    // Use state value if available, otherwise use defaultValue
                    const sliderDisplayValue = sliderValues[key] !== undefined ? sliderValues[key] : defaultValue;

                    return (
                        <div key={key} className={`${isBoolean ? "flex justify-between item-center" : ""} w-full`}>
                            <div className='flex justify-between items-center w-full'>
                                <p className='capitalize'>{key.replaceAll("_", " ")}</p>
                                {isSlider && <p>{sliderDisplayValue}</p>} {/* Display the current slider value */}
                            </div>
                            {isSlider ? (
                                <input
                                    type="range"
                                    min={value.min}
                                    max={value.max}
                                    step={value.step}
                                    defaultValue={defaultValue}
                                    onChange={(e) => handleSliderChange(e, key)} // Use the new handler
                                    onBlur={() => handleSliderStop(key)}
                                    className="range range-xs w-full"
                                    name={key}
                                />
                            ) : isTextOrNumber ? (
                                <input
                                    type={value.field}
                                    required={value.level === 1}
                                    defaultValue={defaultValue}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input w-full input-bordered max-w-xs input-sm"
                                    name={key}
                                />
                            ) : isBoolean ? (
                                <input
                                    type="checkbox"
                                    required={value.level === 1}
                                    defaultChecked={value.default.type === "json_object" ? true : value.default.type === "text" ? false : value.default}
                                    onChange={(e) => handleInputChange(e, key, isBoolean)}
                                    className="checkbox"
                                    name={key}
                                />
                            ) : (
                                "this field is under development"
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default AdvancedParameters;