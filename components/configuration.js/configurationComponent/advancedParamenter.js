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
    const [sliderValues, setSliderValues] = useState({});
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);


    useEffect(() => {
        setDataToSend(localdata)
    }, [localdata])

    useEffect(() => {
        if (modelInfoData) {
            const initialSliderValues = Object.entries(modelInfoData)
                .filter(([key, value]) => value.field === 'slider')
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value.default }), {});
            setSliderValues(initialSliderValues);
        }
    }, [modelInfoData]);

    const dispatch = useDispatch()

    const handleSliderChange = (e, key) => {
        handleInputChange(e, key, true); // Call the existing handleInputChange
        setSliderValues({ ...sliderValues, [key]: e.target.value }); // Update the slider value in state
    };

    const handleInputChange = (e, key, isSlider = false) => {
        let newValue = e.target.value;
        let newCheckedValue = e.target.checked
        if (e.target.type === 'number') {
            newValue = newValue.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
        }

        let updatedDataToSend = {
            ...dataToSend,
            configuration: {
                ...dataToSend.configuration,
                [key]: isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue,
            }
        };
        if (key === 'response_format') {
            const typeValue = newCheckedValue === true ? 'json_object' : newCheckedValue === false ? 'text' : null;
            if (typeValue) {
                updatedDataToSend = {
                    ...updatedDataToSend,
                    configuration: {
                        ...updatedDataToSend.configuration,
                        [key]: {
                            type: typeValue,
                        },
                    },
                };
            }
        }

        setDataToSend(updatedDataToSend);

        if (!isSlider) {
            UpdateBridge(updatedDataToSend);
        }
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

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
                {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                    key !== 'model' && key !== 'tools' && key !== 'tool_choice' && key !== "stream" &&
                    <div className={` ${value.field === "boolean" ? "flex justify-between item-center" : ""} w-full`}>

                        <div className='flex justify-between items-center w-full'>
                            <p className='capitalize'> {key.replaceAll("_", " ")}</p>
                            {value.field === 'slider' && <p>{sliderValues[key]}</p>}
                        </div>
                        {value.field === "slider" ?
                            <input
                                type="range"
                                min={value?.min}
                                max={value?.max}
                                step={value?.step}
                                defaultValue={value?.default}
                                onChange={(e) => handleSliderChange(e, key)}
                                onBlur={(e) => handleInputChange(e, key)}
                                className="range range-xs w-full"
                                name={key}
                                id={key}
                            />
                            : value.field === 'text' ?
                                <input
                                    type="text"
                                    required={value?.level === 1 ? true : false}
                                    defaultValue={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                    onBlur={(e) => handleInputChange(e, key)}
                                    className="input w-full input-bordered max-w-xs  input-sm"
                                    name={key} // Add name attribute
                                />
                                : value.field === 'number' ?
                                    <input
                                        type="number"
                                        required={value?.level === 1 ? true : false}
                                        defaultValue={value?.default}
                                        onBlur={(e) => handleInputChange(e, key)}
                                        className="input w-full input-bordered max-w-xs  input-sm"
                                        name={key} // Add name attribute
                                    />
                                    :
                                    value.field === 'boolean' ?
                                        <input
                                            type="checkbox"
                                            required={value?.level === 1 ? true : false}
                                            defaultChecked={value.default.type === "text" ? false : value.default.type === "json_object" ? true : value.default} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
                                            onChange={(e) => handleInputChange(e, key)}
                                            className="checkbox"
                                            name={key} // Add name attribute
                                        />
                                        :
                                        "this field is under development "}
                    </div>
                ))}
            </div>
        </div>

    );
};

export default AdvancedParameters;