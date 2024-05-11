"use client"
import React, { useEffect, useState } from 'react';
import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file  
import { modelInfo } from '@/jsonFiles/allModelsConfig (1)';
import { isValidJson, validateWebhook } from '@/utils/utility';
import Chat from './chat';
import { ChevronDown, ChevronUp, CircleAlert, Plus } from 'lucide-react';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';

const DropdownMenu = ({ params, data, embed }) => {

    const [toggle, setToggle] = useState(false)
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState(data?.configuration?.model?.default);
    const [dataToSend, setDataToSend] = useState({})
    const [apiKey, setApiKey] = useState(data?.apikey)
    const [modelInfoData, setModelInfoData] = useState({})
    const [inputConfig, setInputConfig] = useState(data?.inputConfig ?? modelInfo?.data?.configuration?.model?.default?.inputConfig)
    const [selectedOption, setSelectedOption] = useState('default');
    const [webhook, setWebhook] = useState(data?.responseFormat?.webhook || "");
    const [headers, setHeaders] = useState(data?.responseFormat?.headers || {});
    const [errors, setErrors] = useState({ webhook: "", headers: "" });
    const dispatch = useDispatch()

    if (data?.configuration) {
        if (data?.configuration?.RTLayer === true) {
            setSelectedOption('RTLayer');
        } else if (data?.configuration?.webhook) {
            setSelectedOption('custom');
        }

    }

    useEffect(() => {
        setSelectedService(data?.service?.toLowerCase());
        setApiKey(data?.apikey);
        setSelectedModel(data?.configuration?.model?.default)
        setModelInfoData(data?.configuration || modelInfo?.data?.configuration?.model?.default?.inputConfig)
        setInputConfig(data?.inputConfig);
        setWebhook(data?.responseFormat?.webhook)
        setHeaders(data?.responseFormat?.headers)
        if (data?.responseFormat?.RTLayer) setSelectedOption("RTLayer");
        if (data?.responseFormat?.webhook) setSelectedOption("custom");

        // Find the key associated with the targetValue
        let foundKey = null;
        for (const key in services[data?.service?.toLowerCase()]) {
            if (services[data?.service?.toLowerCase()][key].has(data?.configuration?.model?.default)) {
                foundKey = key;
                break;
            }
        }
        if (foundKey === 'chat')
            setDataToSend({
                "configuration": {
                    "model": data?.configuration?.model?.default,
                    "prompt": [data?.inputConfig?.system?.default || {}],
                    "type": foundKey,
                    // "user": [],
                    // "conversation": []
                },
                "service": data?.service?.toLowerCase(),
                "apikey": data?.apikey
            })
        else if (foundKey === "embedding")
            setDataToSend({
                "configuration": {
                    "model": data?.configuration?.model?.default,
                    "input": data?.input?.input,
                    "type": foundKey

                },
                "service": data?.service?.toLowerCase(),
                "apikey": data?.apikey
            })

        else {
            setDataToSend(
                {
                    "configuration": {
                        "model": data?.configuration?.model?.default,
                        "prompt": data?.input?.prompt?.prompt,
                        "type": foundKey

                    },
                    'service': data?.service?.toLowerCase(),
                    "apikey": data?.apikey
                }
            )
        }

    }, [data, params]);


    const handleService = (e) => {
        const newSelectedService = e.target.value;

        // Update modelInfoData and inputConfig states based on the new selected service and selected model
        setModelInfoData(modelInfo[selectedService][selectedModel]?.configuration || {});
        setInputConfig(modelInfo[selectedService][selectedModel]?.inputConfig || {});
        // setInputConfig(defaultdata);

        // Update the selected service state
        setSelectedService(newSelectedService);

        // Reset the selected model state to empty string
        setSelectedModel("");
    }


    const handleModel = (e) => {
        const newSelectedModel = e.target.value;
        let updatedDataToSend = {}; // Temporary object to hold the updated dataToSend

        setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
        if (dataToSend.configuration.type !== e.target.selectedOptions[0].parentNode.label) setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});
        if (data.type === e.target.selectedOptions[0].parentNode.label) setInputConfig(data.inputConfig);
        setSelectedModel(newSelectedModel);

        if (dataToSend.configuration.type === e.target.selectedOptions[0].parentNode.label) {
            updatedDataToSend = {
                ...dataToSend,
                configuration: {
                    ...dataToSend.configuration,
                    model: e.target.value, // Update the model in the configuration
                    type: e.target.selectedOptions[0].parentNode.label // Keep the same type
                },
                service: selectedService, // Keep the same service
                apikey: apiKey // Keep the same apiKey
            };
        } else {
            // Define the new dataToSend based on the selected model type
            const newConfiguration = {
                model: e.target.value,
                type: e.target.selectedOptions[0].parentNode.label
            };

            if (e.target.selectedOptions[0].parentNode.label === 'chat') {
                newConfiguration.prompt = [];
            } else if (e.target.selectedOptions[0].parentNode.label === "embedding") {
                newConfiguration.input = "";
            } else if (e.target.selectedOptions[0].parentNode.label === "completion") {
                newConfiguration.prompt = "";
            }

            updatedDataToSend = {
                configuration: newConfiguration,
                service: selectedService,
                apikey: apiKey
            };
        }

        // Update the state with the new dataToSend
        setDataToSend(updatedDataToSend);

        // Call UpdateBridge with the updated dataToSend
        UpdateBridge(updatedDataToSend);
    }


    const handleChangeWebhook = (value) => {
        if (value.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, webhook: '' }));
            return;
        }
        const isValid = validateWebhook(value);
        setErrors(prevErrors => ({ ...prevErrors, webhook: isValid ? '' : 'Invalid URL' }));
    };

    const handleChangeHeaders = (value) => {
        // setHeaders(value);
        if (value.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, headers: '' }));
            return;
        }
        const isValid = isValidJson(value);
        setErrors(prevErrors => ({ ...prevErrors, headers: isValid ? '' : 'Invalid JSON' }));
    };


    const handleResponseChange = (key, webhook, headers) => {
        let updatedDataToSend = {}; // Temporary object to hold the updated dataToSend
        if (key === 'custom') {
            // After setting state to show the custom section

        }
        if (key === "default") {
            updatedDataToSend = prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: false,
                    webhook: "", // Set webhook to an empty string for default option
                    headers: {}
                }
            });
        } else if (key === 'RTLayer') {
            updatedDataToSend = prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: true,
                    webhook: "", // Set webhook to an empty string for RTLayer option
                    headers: {}
                }
            });
        } else if (key === 'custom') {
            updatedDataToSend = prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: false,
                    webhook: webhook, // Set webhook to the valid input
                    headers: headers // Set headers to the parsed JSON
                }
            });


        }

        // Update dataToSend state
        setDataToSend(updatedDataToSend);

        // Call UpdateBridge with the updated dataToSend
        // Since updatedDataToSend is a function, we need to pass the current state to get the updated state
        UpdateBridge(updatedDataToSend(dataToSend));

    };


    const handleInputChange = (e, key, isSlider = false) => {
        let newValue = e.target.value;
        let newCheckedValue = e.target.checked
        if (e.target.type === 'number') {
            newValue = newValue.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
        }
        // Update the state immediately for all inputs, including sliders
        const updatedModelInfo = {
            ...modelInfoData,
            [key]: {
                ...modelInfoData[key],
                default: isSlider ? Number(newValue) : newValue, // Ensure numbers are handled correctly for sliders
            },
        };
        setModelInfoData(updatedModelInfo);

        // Prepare the updated dataToSend object
        let updatedDataToSend = {
            ...dataToSend,
            configuration: {
                ...dataToSend.configuration,
                [key]: isSlider ? Number(newValue) : newValue,
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

    // New method to handle onBlur for sliders, calling UpdateBridge
    const handleSliderStop = (key) => {
        // Call UpdateBridge with the current dataToSend state
        UpdateBridge(dataToSend);
    };


    const toggleAccordion = () => {
        setToggle(!toggle)
    }
    /**
     * Handle changes to the input fields in the configuration section of the dropdown menu
     * 
     * @param {string} value The value of the input field
     * @param {string} key The key of the modelInfoData object to update
     */
    const handleInputConfigChanges = (value, key) => {
        // Update the inputConfig state with the new value
        setInputConfig(prevInputConfig => ({
            ...prevInputConfig,
            [key]: {
                /**
                 * The default value for the input field
                 */
                default: {
                    /**
                     * The content of the prompt string
                     */
                    content: value,
                }
            }
        }));

        // Update the dataToSend state with the new prompt string
    };


    const SaveData = (value, key) => {
        const promptString = { "role": key, "content": value }; // The prompt string to add or update

        if (key === "input" || key === "prompt") { // If the key is input or prompt, update the configuration.input or configuration.prompt field
            const updatedDataToSend = {
                ...dataToSend,
                configuration: {
                    ...dataToSend.configuration,
                    [key]: value // Update the field with the new value
                }
            };
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
        else if (key === "apikey") { // If the key is apikey, update the apikey field
            const updatedDataToSend = {
                ...dataToSend,
                [key]: value // Update the field with the new value
            };
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
        else {
            const keyIndex = dataToSend?.configuration?.prompt?.findIndex(item => item.role === key);

            let updatedDataToSend;
            if (keyIndex !== -1) { // If the key already exists, update the value
                updatedDataToSend = {
                    ...dataToSend,
                    configuration: {
                        ...dataToSend.configuration,
                        prompt: dataToSend.configuration.prompt.map((item, index) => index === keyIndex ? promptString : item)
                    }
                };
            } else { // If the key does not exist, add it to the prompt array
                updatedDataToSend = {
                    ...dataToSend,
                    configuration: {
                        ...dataToSend.configuration,
                        prompt: [...dataToSend.configuration.prompt, promptString]
                    }
                };
            }
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
    };


    useEffect(() => {
        const resizer = document.querySelector('.resizer');
        const leftSide = resizer.previousElementSibling;
        const rightSide = resizer.nextElementSibling;
        let x = 0;
        let w = 0;

        const mouseDownHandler = function (e) {
            x = e.clientX;
            w = leftSide.getBoundingClientRect().width;
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function (e) {
            const dx = e.clientX - x;
            leftSide.style.width = `${w + dx}px`;
        };

        const mouseUpHandler = function () {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        resizer.addEventListener('mousedown', mouseDownHandler);

        // Clean up the event listeners when the component unmounts
        return () => {
            resizer.removeEventListener('mousedown', mouseDownHandler);
        };
    }, []);
    const UpdateBridge = (currentDataToSend) => {
        // Use currentDataToSend instead of the state directly
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: currentDataToSend.configuration, service: currentDataToSend.service, apikey: currentDataToSend.apikey } }));
    }

    const responseOptions = [
        { value: 'default', label: 'Default' },
        { value: 'RTLayer', label: 'RTLayer' },
        { value: 'custom', label: 'Custom' },
    ];

    return (
        <>
            <div className="h-full">
                <div className=" w-screen flex flex-col   border border-gray-300 md:flex-row">
                    <div className="w-2/3 overflow-auto border-r border-gray-300 bg-gray-100 min-w-[350px] configurationPage">
                        <div className="p-4 h-[93vh]" >
                            <div className="">
                                <div className="pb-5">
                                    {inputConfig && Object.entries(inputConfig).map(([key, value]) => (
                                        <>
                                            {key !== "rawData" && (
                                                <div className="form-control w-full " key={key}>
                                                    <div className="label">
                                                        <span className="label-text capitalize">{key}</span>
                                                    </div>
                                                    <textarea
                                                        autoFocus
                                                        className="textarea textarea-bordered w-full min-h-96 resize-y"
                                                        defaultValue={value?.default?.content || value?.prompt || value?.input || ""}
                                                        onBlur={(e) => { handleInputConfigChanges(e.target.value, key); SaveData(e.target.value, key) }}
                                                    ></textarea>
                                                </div>
                                            )}
                                        </>
                                    ))}
                                    {modelInfoData?.tools && <div>
                                        <div className="form-control w-full">
                                            <div className="label flex-col mt-2 items-start">
                                                <div className="flex flex-wrap gap-4">
                                                    {embed && embed.map((value) => (
                                                        <div key={value?.id} className='w-[250px]  cursor-pointer' onClick={() => openViasocket(value?.id)}>
                                                            <div className={`rounded-md border ${value.description.trim() === "" ? "border-red-600" : ""}`}>
                                                                <div className="p-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
                                                                            {value.title}
                                                                        </h1>
                                                                        {value.description.trim() === "" && <CircleAlert color='red' size={16} />}
                                                                    </div>
                                                                    <p className="mt-3 text-xs sm:text-sm text-gray-600  line-clamp-3">
                                                                        {value.description ? value.description : "A description is required for proper functionality."}
                                                                    </p>
                                                                    <div className="mt-4">
                                                                        <span className="mr-2 inline-block rounded-full capitalize bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-900">
                                                                            {value.description.trim() === "" ? "Description Required" : value.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => openViasocket()} className="btn btn-outline btn-sm mt-4"><Plus size={16} /> Add new Function</button>
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                                <label className="form-control w-full ">
                                    <div className="label">
                                        <span className="label-text">Service</span>
                                    </div>
                                    <select value={selectedService} onChange={handleService} className="select select-sm max-w-xs  select-bordered">
                                        <option disabled selected>Select a Service</option>
                                        {/* <option value="google">google</option> */}
                                        {/* <option value="mistral">mistral</option> */}
                                        {/* <option value="cohere">cohere</option> */}
                                        <option value="openai">openai</option>
                                    </select>
                                </label>

                                <label className="form-control w-full ">
                                    <div className="label">
                                        <span className="label-text">Model</span>
                                    </div>
                                    <select value={selectedModel} onChange={handleModel} className="select select-sm max-w-xs  select-bordered">
                                        <option disabled selected>Select a Model</option>

                                        {Object.entries(services?.[selectedService] || {}).map(([group, options]) => (
                                            group !== 'models' && // Exclude the 'models' group
                                            <optgroup label={group}>
                                                {[...options].map(option => (
                                                    <option key={option}>{option}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-control w-full ">
                                    <div className="label">
                                        <span className="label-text">Provide Your API Key</span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        defaultValue={data?.apikey}
                                        // onBlur={(e) => setApiKey(e.target.value)}
                                        className="input w-full input-bordered max-w-xs  input-sm"
                                        onBlur={(e) => SaveData(e.target.value, "apikey")}
                                    />

                                </label>
                                <div className="collapse ">
                                    <input type="radio" name="my-accordion-1" checked={toggle} onClick={toggleAccordion} />
                                    <div className="collapse-title p-0 flex items-center justify-start gap-4 text-xl font-medium">
                                        Advanced Parameters  {toggle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                    <div className="collapse-content gap-3 flex flex-col p-0">
                                        {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                                            key !== 'model' && key !== 'tools' && key !== 'tool_choice' && key !== "stream" &&
                                            <div className={` ${value.field === "boolean" ? "flex justify-between item-center" : ""} w-full`}>

                                                <div className='flex justify-between items-center w-full'>
                                                    <p className='capitalize'> {key.replaceAll("_", " ")}</p>
                                                    {value.field === 'slider' && <p>{typeof value.default === 'object' ? JSON.stringify(value) : value.default}</p>}
                                                </div>
                                                {value.field === "slider" ?
                                                    <input
                                                        type="range"
                                                        min={value?.min}
                                                        max={value?.max}
                                                        step={value?.step}
                                                        value={value?.default}
                                                        onChange={(e) => handleInputChange(e, key, true)} // Pass true to indicate it's a slider
                                                        onBlur={() => handleSliderStop(key)} // Call UpdateBridge on blur
                                                        className="range range-xs w-full"
                                                        name={key}
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
                                                                    defaultChecked={value.default.type === "text" ? false : value.default.type === "json_object" ? true : value} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
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
                                <div>
                                    <p className='text-xl font-medium'>Select Response Format</p>
                                    {responseOptions.map(({ value, label }) => (
                                        <div className="form-control w-fit" key={value}>
                                            <label className="label cursor-pointer mx-w-sm flex items-center gap-5">
                                                <input
                                                    type="radio"
                                                    name="radio-10"
                                                    className="radio checked:bg-blue-500"
                                                    checked={selectedOption === value}
                                                    onChange={() => { setSelectedOption(value); handleResponseChange(value); }}
                                                />
                                                <span className="label-text">{label}</span>
                                            </label>
                                        </div>
                                    ))}
                                    <div className={`${selectedOption === 'custom' ? "border rounded" : ""} `}>

                                        {/* {selectedOption === 'custom' && */}
                                        <div className={`border-t pt-4 px-4 ${selectedOption === 'custom' ? "" : "hidden"}`}>
                                            <label className="form-control w-full mb-4">
                                                <span className="label-text block mb-2">Webhook URL</span>
                                                <input
                                                    type="text"
                                                    placeholder="https://example.com/webhook"
                                                    className="input input-bordered max-w-xs  input-sm w-full"
                                                    id="webhook"
                                                    value={webhook}
                                                    onChange={e => {
                                                        setWebhook(e.target.value);
                                                        handleChangeWebhook(e.target.value);
                                                    }}
                                                />
                                                {errors.webhook && <p className="text-red-500 text-xs mt-2">{errors.webhook}</p>}
                                            </label>
                                            <label className="form-control mb-4">
                                                <span className="label-text block mb-2">Headers (JSON format)</span>
                                                <textarea
                                                    className="textarea textarea-bordered h-24 w-full"
                                                    id="headers"
                                                    value={headers}
                                                    onChange={e => {
                                                        setHeaders(e.target.value);
                                                        handleChangeHeaders(e.target.value);
                                                    }}
                                                    placeholder='{"Content-Type": "application/json"}'
                                                ></textarea>
                                                {errors.headers && <p className="text-red-500 text-xs mt-2">{errors.headers}</p>}
                                            </label>
                                            <button className="btn btn-primary btn-sm my-2 float-right" onClick={() => handleResponseChange("custom", document.getElementById('webhook').value, document.getElementById('headers').value)} disabled={errors.webhook !== '' || errors.headers !== ''}>
                                                Apply
                                            </button>
                                        </div>
                                        {/* } */}
                                    </div>
                                </div>
                                <div className='h-[70px]' />
                            </div>
                        </div>
                    </div>
                    <div className="resizer w-1 bg-base-500 cursor-col-resize hover:bg-primary" ></div>
                    <div className="w-1/3 flex-1 chatPage min-w-[450px]">
                        <div className="p-4">
                            <Chat dataToSend={dataToSend} params={params} />
                        </div>
                    </div>
                </div>

                {/* response slider */}

            </div >
        </>
    );
};

export default DropdownMenu;

