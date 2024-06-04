import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

    return (
        <div className="collapse">
            <input type="radio" name="my-accordion-1" onClick={toggleAccordion} />
            <div className="collapse-title p-0 flex items-center justify-start gap-4 text-xl font-medium cursor-pointer" onClick={toggleAccordion}>
                Advanced Parameters
                {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isAccordionOpen && <div className="collapse-content gap-3 flex flex-col p-0">
                {modelInfoData && Object.entries(modelInfoData)?.map(([key, value]) => (
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
                                className="input  input-bordered max-w-xs input-sm"
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
                ))}
            </div>}
        </div>
    );
};

export default AdvancedParameters;
