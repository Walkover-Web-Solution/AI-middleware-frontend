import { useCustomSelector } from '@/customHooks/customSelector';
import { ADVANCED_BRIDGE_PARAMETERS, KEYS_NOT_TO_DISPLAY } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const AdvancedParameters = ({ params }) => {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const dispatch = useDispatch();
    const { service, model, type, bridge, configuration } = useCustomSelector((state) => ({
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service?.toLowerCase(),
        model: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.model,
        type: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        configuration: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration,

    }));
    const { modelInfoData } = useCustomSelector((state) => ({
        modelInfoData: state?.modelReducer?.serviceModels?.[service]?.[type]?.[model]?.configuration?.additional_parameters,
    }));

    const handleInputChange = (e, key, isSlider = false) => {
        let newValue = e.target.value;
        let newCheckedValue = e.target.checked;
        if (e.target.type === 'number') {
            newValue = String(newValue)?.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
        }

        let updatedDataToSend = {
            configuration: {
                [key]: isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue,
            }
        };
        if ((isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue) !== configuration[key]) {
            dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...updatedDataToSend } }));
        }
    };

    const handleSelectChange = (e, key) => {
        let newValue;
        try {
            newValue = JSON.parse(e.target.value);
        } catch (error) {
            newValue = e.target.value;
        }
        let updatedDataToSend = {
            configuration: {
                [key]: newValue,
            }
        };
        if (newValue !== configuration[key]) {
            dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...updatedDataToSend } }));
        }
    };

    const toggleAccordion = () => {
        setIsAccordionOpen((prevState) => !prevState);
    };

    const setSliderValue = (value, key) => {
        let updatedDataToSend = {
            configuration: {
                [key]: value
            }
        };
        if (value !== configuration[key]) {
            dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: updatedDataToSend }));
        }
    };

    return (
        <div className="collapse text-base-content" tabIndex={0}>
            <input type="radio" name="my-accordion-1" onClick={toggleAccordion} className='cursor-pointer' />
            <div className="collapse-title p-0 flex items-center justify-start font-medium cursor-pointer" onClick={toggleAccordion}>
                <span className="mr-2 cursor-pointer">
                    Advanced Parameters
                </span>

                {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            {isAccordionOpen && <div className="collapse-content gap-3 flex flex-col p-3 border rounded-md">
                {modelInfoData && Object.entries(modelInfoData || {})?.map(([key, { field, min, max, step, default: defaultValue, options }]) => {
                    if (KEYS_NOT_TO_DISPLAY.includes(key)) return null;
                    const name = ADVANCED_BRIDGE_PARAMETERS?.[key]?.name || key;
                    const description = ADVANCED_BRIDGE_PARAMETERS?.[key]?.description || '';
                    let error = false;
                    return (
                        <div key={key} className="form-control">
                            <label className="label">
                                <div className='flex gap-2'>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <span className="label-text capitalize">{name || key}</span>
                                        {description && <div className="tooltip tooltip-right" data-tip={description}>
                                            <Info size={12} />
                                        </div>}
                                    </div>
                                    <div>
                                        <ul className="menu menu-xs menu-horizontal lg:menu-horizontal bg-base-200 p-1 rounded-md text-xs">
                                            {field === 'slider' && (<li><a onClick={() => setSliderValue("min", key)} className={configuration?.[key] === "min" ? 'bg-base-content text-base-100' : ''}>Min</a></li>)}
                                            <div className="tooltip" data-tip="If you set default, this key will not be send"><li><a onClick={() => setSliderValue("default", key)} className={configuration?.[key] === "default" ? 'bg-base-content text-base-100 ' : ''} >Default</a></li></div>
                                            {field === 'slider' && (<li><a onClick={() => setSliderValue("max", key)} className={configuration?.[key] === "max" ? 'bg-base-content text-base-100' : ''}> Max</a></li>)}
                                        </ul>
                                    </div>


                                </div>
                                {((field === 'slider') && !(min <= configuration?.[key] && configuration?.[key] <= max)) && (configuration?.['key']?.type === "string") && (error = true)}
                                {field === 'slider' && <p className={`text-right ${error ? 'text-error' : ''}`} id={`sliderValue-${key}`}>{(configuration?.[key] === 'min' || configuration?.[key] === 'max' || configuration?.[key] === 'default') ?
                                    modelInfoData?.[key]?.[configuration?.[key]] : configuration?.[key]}</p>}
                            </label>
                            {field === 'slider' && (
                                <div>
                                    <input
                                        type="range"
                                        min={min || 0}
                                        max={max || 100}
                                        step={step || 1}
                                        key={`${key}-${configuration?.[key]}-${service}-${model}`}
                                        defaultValue={
                                            (configuration?.[key] === 'min' || configuration?.[key] === 'max' || configuration?.[key] === 'default') ?
                                                modelInfoData?.[key]?.[configuration?.[key]] :
                                                configuration?.[key]
                                        }
                                        onBlur={(e) => handleInputChange(e, key, true)}
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
                                    defaultValue={configuration?.[key] === 'default' ? '' : configuration?.[key] || ''}
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
                                        name={key}
                                        type="checkbox"
                                        key={bridge?.bridgeType}
                                        className="toggle"
                                        defaultChecked={configuration?.[key] || false}
                                        onChange={(e) => handleInputChange(e, key)}
                                    />
                                </label>
                            )}
                            {field === 'select' && (
                                <label className='flex items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
                                    <select
                                        value={
                                            configuration?.[key] === 'default'
                                                ? modelInfoData?.[key]?.[configuration?.[key]]?.type
                                                : configuration?.[key].type
                                        }
                                        key={`-${configuration[key]}-${service}-${model}`}
                                        onChange={(e) => handleSelectChange(e, key)}
                                        className="select select-sm max-w-xs select-bordered capitalize"
                                    >
                                        <option disabled>Select response mode</option>
                                        {options?.map((serviceOption, index) => (
                                            <option key={index} value={serviceOption?.type}>
                                                {serviceOption?.type}
                                            </option>
                                        ))}
                                    </select>
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