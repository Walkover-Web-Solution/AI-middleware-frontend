"use client"
import React, { useEffect, useState } from 'react';
import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file  
import { modelInfo } from '@/jsonFiles/allModelsConfig (1)';
import Chat from './chat';

const DropdownMenu = ({ params, data, embed }) => {

    const [toggle, setToggle] = useState(false)
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState(data?.configuration?.model?.default);
    const [dataToSend, setDataToSend] = useState({})
    const [apiKey, setApiKey] = useState(data?.apikey)
    const [modelInfoData, setModelInfoData] = useState({})
    const [inputConfig, setInputConfig] = useState(data?.inputConfig ?? modelInfo?.data?.configuration?.model?.default?.inputConfig)
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [tempInput, setTempInput] = useState('');
    const [activeKey, setActiveKey] = useState('');
    const [jsonString, setJsonString] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [tempJsonString, setTempJsonString] = useState('');
    const [selectedOption, setSelectedOption] = useState('default');
    const [webhook, setWebhook] = useState(data?.responseFormat?.webhook || "");
    const [headers, setHeaders] = useState(data?.responseFormat?.headers || "");
    const [errors, setErrors] = useState({ webhook: "", headers: "" });

    // Check conditions and set the selected option accordingly
    if (data?.configuration) {
        if (data?.configuration?.rtlayer === true) {
            setSelectedOption('rtlayer');
        } else if (data?.configuration?.webhook) {
            setSelectedOption('custom');
        }

    }

    // Default JSON structure as a placeholder
    const jsonPlaceholder = JSON.stringify(
        [{
            "type": "function",
            "function": {
                "name": "get_current_weather",
                "description": "Get the current weather",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA",
                        },
                        "format": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "The temperature unit to use.",
                        },
                    },
                    "required": ["location", "format"],
                },
            }
        }], null, 2);

    useEffect(() => {
        setJsonString(jsonPlaceholder);
    }, []);


    useEffect(() => {
        setSelectedService(data?.service?.toLowerCase());
        setApiKey(data?.apikey);
        setJsonString(JSON.stringify(data?.configuration?.tools?.default) || "")
        setSelectedModel(data?.configuration?.model?.default)
        setModelInfoData(data?.configuration || modelInfo?.data?.configuration?.model?.default?.inputConfig)
        setInputConfig(data?.inputConfig);
        if (data?.responseFormat?.rtlayer) setSelectedOption("rtlayer");
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



    /**
     * Handle the service dropdown change event
     * 
     * @param {Object} e event object
     */
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


    /**
     * Handle the model dropdown change event
     * 
     * @param {Object} e event object
     */
    const handleModel = (e) => {

        const newSelectedModel = e.target.value;
        setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
        if (dataToSend.configuration.type !== e.target.selectedOptions[0].parentNode.label) setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});
        if (data.type === e.target.selectedOptions[0].parentNode.label) setInputConfig(data.inputConfig)
        // Update selectedModel state with the newly selected model
        setSelectedModel(newSelectedModel);

        // Check if the newly selected model is of the same type as the current type
        // If it is, update the existing dataToSend object with the new model
        if (dataToSend.configuration.type === e.target.selectedOptions[0].parentNode.label) {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    model: e.target.value, // Update the model in the configuration
                    type: e.target.selectedOptions[0].parentNode.label // Keep the same type
                },
                service: selectedService, // Keep the same service
                apikey: apiKey // Keep the same apiKey
            }));
        }
        // If the newly selected model is not of the same type as the current type, we need to create a new dataToSend object
        // Depending on the type of the newly selected model, we set the inputConfig and modelInfoData states accordingly
        // Then we set the new dataToSend object
        else {

            if (e.target.selectedOptions[0].parentNode.label === 'chat') {

                // setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                // setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend({
                    "configuration": {
                        "model": e.target.value,
                        "prompt": [],
                        "type": e.target.selectedOptions[0].parentNode.label,
                        // "user": [],
                        // "conversation": [] 
                    },
                    "service": selectedService,
                    "apikey": apiKey
                })
            }
            else if (e.target.selectedOptions[0].parentNode.label === "embedding") {

                // setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                // setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend({
                    "configuration": {
                        "model": e.target.value,
                        "input": "",
                        "type": e.target.selectedOptions[0].parentNode.label

                    },
                    "service": selectedService,
                    "apikey": apiKey
                })
            }
            else if (e.target.selectedOptions[0].parentNode.label === "completion") {

                // setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                // setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend(
                    {
                        "configuration": {
                            "model": e.target.value,
                            "prompt": "",
                            "type": e.target.selectedOptions[0].parentNode.label

                        },
                        "service": selectedService,
                        "apikey": apiKey
                    }
                )
            }

        }
    }

    /**
     * Handle changes to the input fields in the configuration section of the dropdown menu
     * 
     * @param {Object} e event object
     * @param {string} key key of the modelInfoData object to update
     */

    // const handleResponseChange = (key) => {
    //     if (key === "default") {
    //         setDataToSend(prevDataToSend => ({
    //             ...prevDataToSend,
    //             configuration: {
    //                 ...prevDataToSend.configuration,
    //                 rtlayer: false,
    //                 webhook: ""
    //             }
    //         }));
    //     }
    //     if (key === 'rtlayer') {
    //         setDataToSend(prevDataToSend => ({
    //             ...prevDataToSend,
    //             configuration: {
    //                 ...prevDataToSend.configuration,
    //                 rtlayer: true,
    //                 webhook: ""
    //             }
    //         }));
    //     }
    //     if (key === 'webhook') {
    //         setDataToSend(prevDataToSend => ({
    //             ...prevDataToSend,
    //             configuration: {
    //                 ...prevDataToSend.configuration,
    //                 rtlayer: false,
    //                 webhook: "hello world"
    //             }
    //         }));
    //     }
    // }

    const validateWebhook = (url) => {
        if (url.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, webhook: '' }));
            return; // Exit early if the input is empty
        }
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        if (!pattern.test(url)) {
            setErrors(prevErrors => ({ ...prevErrors, webhook: "Invalid URL" }));
        } else {
            setErrors(prevErrors => ({ ...prevErrors, webhook: '' }));
        }
    };

    const validateHeaders = (jsonString) => {
        if (jsonString.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, headers: '' }));
            return; // Exit early if the input is empty
        }
        try {
            JSON.parse(jsonString);
            setErrors(prevErrors => ({ ...prevErrors, headers: '' }));
        } catch (e) {
            setErrors(prevErrors => ({ ...prevErrors, headers: "Invalid JSON" }));
        }
    };


    const handleResponseChange = (key, webhook, headers) => {
        if (key === "default") {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    rtlayer: false,
                    webhook: "", // Set webhook to an empty string for default option
                    headers: {}
                }
            }));
        }
        if (key === 'rtlayer') {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    rtlayer: true,
                    webhook: "", // Set webhook to an empty string for RTLayer option
                    headers: {}
                }
            }));
        }
        if (key === 'custom') {
            // Perform validation only when the key is 'custom'
            const webhookValid = validateWebhook(webhook);
            const headersValid = validateHeaders(headers);
    
            if (!webhookValid || !headersValid) {
                console.error({
                    webhookError: webhookValid ? "" : "Invalid URL provided.",
                    headersError: headersValid ? "" : "Invalid JSON provided."
                });
                return; // Stop the function if validation fails
            }
    
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    rtlayer: false,
                    webhook: webhook, // Set webhook to the valid input
                    headers: JSON.parse(headers) // Set headers to the parsed JSON
                }
            }));
        }
    };


    const handleInputChange = (e, key) => {

        let newValue;
        // If the field is a checkbox or a boolean, use the checked property of the event target
        if (modelInfoData[key]?.field === "checkbox" || modelInfoData[key]?.field === "boolean") {
            if (key === "response_format") {
                if (e.target.checked) { newValue = { "type": "json_object" } }
                else { newValue = { "type": "text" } }  // Adjust value accordingly
            } else {
                newValue = e.target.checked; // Use checked for checkboxes
            }
        }

        // Otherwise, use the value property
        else {
            newValue = e.target.value;
        }
        // Create a new modelInfoData object with the updated value
        const updatedModelInfo = {
            ...modelInfoData,
            [key]: {
                ...modelInfoData[key],
                default: newValue,
            },
        };
        // Update the dataToSend object with the new value
        setDataToSend(prevDataToSend => ({
            ...prevDataToSend,
            configuration: {
                ...prevDataToSend.configuration,
                [key]: modelInfoData[key]?.field === "number" || modelInfoData[key]?.field === "slider" ? Number(newValue) : modelInfoData[key]?.field === "json_object" ? "" : newValue
            }
        }));
        // Update the modelInfoData state with the new object
        setModelInfoData(updatedModelInfo);

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

    /**
     * Save the data to the dataToSend state
     * 
     * @param {string} value The value of the input field
     * @param {string} key The key of the dataToSend object to update
     */
    const SaveData = (value, key) => {
        const promptString = { "role": key, "content": value }; // The prompt string to add or update

        if (key === "input" || key === "prompt") { // If the key is input or prompt, update the configuration.input or configuration.prompt field
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    [key]: value // Update the field with the new value
                }
            }));
        }
        else if (key === "apikey") { // If the key is apikey, update the apikey field
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                [key]: value // Update the field with the new value
            }));
        }
        else { // If the key is not input, prompt, or apikey, update the prompt array

            // Check if the key already exists in the prompt array
            const keyIndex = dataToSend?.configuration?.prompt?.findIndex(item => (item).role === key);

            if (keyIndex !== -1) { // If the key already exists, update the value
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    configuration: {
                        ...prevDataToSend.configuration,
                        prompt: prevDataToSend.configuration.prompt.map((item, index) => index === keyIndex ? promptString : item)
                    }
                }));
            } else { // If the key does not exist, add it to the prompt array
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    configuration: {
                        ...prevDataToSend.configuration,
                        prompt: [...prevDataToSend.configuration.prompt, promptString]
                    }
                }));
            }
        }
    };


    /**
     * Open the popup to edit the configuration data
     * 
     * @param {string} key The key of the dataToSend object to update
     * @param {string} currentValue The current value of the input field
     */
    const openPopup = (key, currentValue) => {
        setTempInput(currentValue); // Set the current value of the input field in state
        setActiveKey(key); // Set the key of the dataToSend object to update in state
        setPopupVisible(true); // Open the popup
    };
    // };

    /**
     * Handle popup input changes
     * 
     * @param {Object} e event object
     */
    const handlePopupInputChange = (e) => {
        // Set the current value of the input field in state
        setTempInput(e.target.value);
    };
    // };

    // Function to close the popup and save the data
    const closePopup = () => {
        handleInputConfigChanges(tempInput, activeKey);
        SaveData(tempInput, activeKey);
        setPopupVisible(false);
    };


    const handleInputClick = () => {
        setModalOpen(true);
        setTempJsonString(jsonString);
    };

    /**
     * Handle the closing of the modal
     * Parses the JSON string and updates the dataToSend state
     */
    const handleModalClose = () => {
        if (isValid) {
            setJsonString(tempJsonString); // Save the valid JSON string in state
        } // Save the JSON string in state
        setModalOpen(false); // Close the modal

        try {
            const parsedJson = JSON.parse(tempJsonString); // Parse the JSON string
            setDataToSend(prevDataToSend => ({ // Update the dataToSend state
                ...prevDataToSend, // Keep the previous data
                configuration: { // Add the new data
                    ...prevDataToSend.configuration, // Keep the previous configuration
                    "tools": parsedJson, // Set the "tools" property to the parsed JSON
                },
            }));
        } catch (error) {
            setJsonString(""); // Set the JSON string to an empty string
            console.error("Error parsing JSON:", error); // Log the error
        }
    };
    // };


    /**
     * Handle changes to the JSON text area
     * @param {React.ChangeEvent<HTMLTextAreaElement>} event The change event
     */
    const handleTextAreaChange = (event) => {
        const newJsonString = event.target.value; // Get the new JSON string
        setTempJsonString(newJsonString); // Save it to state

        if (newJsonString.trim() === "") {
            setIsValid(true); // Consider empty string as valid or neutral
            return; // Exit the function early
        }

        try {
            JSON.parse(newJsonString); // Try to parse the new JSON string
            setIsValid(true); // If it parses correctly, set isValid to true
        } catch (error) {
            setIsValid(false); // If it doesn't parse correctly, set isValid to false
        }
    };


    return (
        <>
            <div className=" " style={{ height: "90vh" }}>
                <div className=" flex flex-col overflow-hidden  border border-gray-300 md:flex-row">
                    <div className="w-full border-r border-gray-300 bg-gray-100 md:max-w-xs">
                        <div className="p-4 overflow-auto" style={{ height: "90vh" }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-5 md:grid-cols-1">

                                <label className="form-control w-full max-w-xs">
                                    <div className="label">
                                        <span className="label-text">Provide Your ApiKey</span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="input w-full input-bordered"
                                        onBlur={(e) => SaveData(e.target.value, "apikey")}
                                    />

                                </label>

                                <label className="form-control w-full ">
                                    <div className="label">
                                        <span className="label-text">Service</span>
                                    </div>
                                    <select value={selectedService} onChange={handleService} className="select select-bordered">
                                        <option disabled selected>Select a Service</option>
                                        {/* <option value="google">google</option> */}
                                        {/* <option value="mistral">mistral</option> */}
                                        {/* <option value="cohere">cohere</option> */}
                                        <option value="openai">openai</option>
                                    </select>
                                </label>

                                <label className="form-control w-full mb-2 ">
                                    <div className="label">
                                        <span className="label-text">Model</span>
                                    </div>
                                    <select value={selectedModel} onChange={handleModel} className="select select-bordered">
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
                                {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                                    key !== 'model' && value.level !== 0 && key !== "stream" &&
                                    <div className={`mb-2 ${value.field === "boolean" ? "flex justify-between item-center" : ""} `}>

                                        <div className='flex justify-between items-center w-full'>
                                            <p className='capitalize'> {key.replaceAll("_", " ")}</p>
                                            {value.field === 'slider' && <p>{typeof value.default === 'object' ? JSON.stringify(value) : value.default}</p>}
                                        </div>
                                        {value.field === "slider" ?
                                            <input
                                                id={key} // Add this id attribute
                                                type="range"
                                                min={value?.min}
                                                max={value?.max}
                                                step={value?.step}
                                                value={value?.default}
                                                onChange={(e) => handleInputChange(e, key)}
                                                className="range range-xs w-full"
                                                name={key} // Add name attribute
                                            />
                                            : value.field === 'text' ?
                                                <input
                                                    type="text"
                                                    required={value?.level === 1 ? true : false}
                                                    value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                    onChange={(e) => handleInputChange(e, key)}
                                                    className="input w-full input-bordered"
                                                    name={key} // Add name attribute
                                                />
                                                : value.field === 'number' ?
                                                    <input
                                                        type="number"
                                                        required={value?.level === 1 ? true : false}
                                                        value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        className="input w-full input-bordered"
                                                        name={key} // Add name attribute
                                                    /> :
                                                    value.field === 'boolean' ?
                                                        <input
                                                            type="checkbox"
                                                            required={value?.level === 1 ? true : false}
                                                            checked={value.default.type === "json_object" ? true : value.default.type === "text" ? false : value.default} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
                                                            onChange={(e) => handleInputChange(e, key)}
                                                            className="checkbox"
                                                            name={key} // Add name attribute
                                                        /> :
                                                        value.field === "dropdown" ? (
                                                            <select
                                                                onChange={(e) => handleInputChange(e, key)}
                                                                className="select w-full "
                                                                name={key}
                                                            >
                                                                <option disabled selected>Select a {key.replaceAll("_", " ")}</option>
                                                                {value.values.map((element, index) => (
                                                                    <option key={index}>{element}</option>
                                                                ))}
                                                            </select>
                                                        )
                                                            :
                                                            "this field is under development"}

                                    </div>
                                ))}
                                <div className="collapse collapse-arrow bg-base-200">
                                    <input type="radio" name="my-accordion-2" checked={toggle} onClick={toggleAccordion} />
                                    <div className="collapse-title text-xl font-medium">
                                        Advanced Parameters
                                    </div>
                                    <div className="collapse-content">
                                        {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                                            key !== 'model' && key !== 'tools' && key !== 'tool_choice' && key !== "stream" && value.level === 0 &&
                                            <div className={`mb-2 ${value.field === "boolean" ? "flex justify-between item-center" : ""} w-full`}>

                                                <div className='flex justify-between items-center w-full'>
                                                    <p className='capitalize'> {key.replaceAll("_", " ")}</p>
                                                    {value.field === 'slider' && <p>{typeof value.default === 'object' ? JSON.stringify(value) : value.default}</p>}
                                                </div>
                                                {value.field === "slider" ?
                                                    <input
                                                        id={key} // Add this id attribute
                                                        type="range"
                                                        min={value?.min}
                                                        max={value?.max}
                                                        step={value?.step}
                                                        value={value?.default}
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        className="range range-xs w-full"
                                                        name={key} // Add name attribute
                                                    />
                                                    : value.field === 'text' ?
                                                        <input
                                                            type="text"
                                                            required={value?.level === 1 ? true : false}
                                                            value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                            onChange={(e) => handleInputChange(e, key)}
                                                            className="input w-full input-bordered"
                                                            name={key} // Add name attribute
                                                        />
                                                        : value.field === 'number' ?
                                                            <input
                                                                type="number"
                                                                required={value?.level === 1 ? true : false}
                                                                value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                                onChange={(e) => handleInputChange(e, key)}
                                                                className="input w-full input-bordered"
                                                                name={key} // Add name attribute
                                                            /> :
                                                            value.field === 'boolean' ?
                                                                <input
                                                                    type="checkbox"
                                                                    required={value?.level === 1 ? true : false}
                                                                    checked={value.default.type === "text" ? false : value.default.type === "json_object" ? true : !!value} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
                                                                    onChange={(e) => handleInputChange(e, key)}
                                                                    className="checkbox"
                                                                    name={key} // Add name attribute
                                                                />
                                                                :
                                                                value.field === 'json_object' ?
                                                                    <input
                                                                        type="checkbox"
                                                                        required={value?.level === 1 ? true : false}
                                                                        checked={!value.default} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
                                                                        onChange={(e) => handleInputChange(e, key)}
                                                                        className="checkbox"
                                                                        name={key} // Add name attribute
                                                                    /> :
                                                                    "this field is under development "}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className="w-full border-r border-gray-300 bg-gray-100 md:max-w-xs">
                        <div className="p-4 overflow-auto h-" style={{ height: "90vh" }}>
                            {/* <div className='float-right cursor-pointer'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 11.9998C2 11.1348 2.11 10.2968 2.316 9.49582C2.86847 9.52486 3.4182 9.40057 3.90444 9.13668C4.39068 8.8728 4.79448 8.47961 5.07121 8.00056C5.34793 7.52152 5.48681 6.97528 5.47247 6.42224C5.45814 5.8692 5.29117 5.33089 4.99 4.86682C6.19894 3.67739 7.69079 2.81531 9.325 2.36182C9.57599 2.85529 9.95864 3.26968 10.4306 3.55913C10.9025 3.84857 11.4454 4.00177 11.999 4.00177C12.5526 4.00177 13.0955 3.84857 13.5674 3.55913C14.0394 3.26968 14.422 2.85529 14.673 2.36182C16.3072 2.81531 17.7991 3.67739 19.008 4.86682C18.7065 5.33097 18.5393 5.86949 18.5248 6.42278C18.5104 6.97608 18.6493 7.52258 18.9262 8.00183C19.2031 8.48108 19.6071 8.87438 20.0937 9.13823C20.5802 9.40208 21.1303 9.52619 21.683 9.49682C21.889 10.2968 21.999 11.1348 21.999 11.9998C21.999 12.8648 21.889 13.7028 21.683 14.5038C21.1305 14.4746 20.5806 14.5987 20.0942 14.8625C19.6078 15.1263 19.2039 15.5195 18.927 15.9986C18.6502 16.4777 18.5112 17.024 18.5255 17.5771C18.5398 18.1303 18.7068 18.6687 19.008 19.1328C17.7991 20.3222 16.3072 21.1843 14.673 21.6378C14.422 21.1443 14.0394 20.7299 13.5674 20.4405C13.0955 20.1511 12.5526 19.9979 11.999 19.9979C11.4454 19.9979 10.9025 20.1511 10.4306 20.4405C9.95864 20.7299 9.57599 21.1443 9.325 21.6378C7.69079 21.1843 6.19894 20.3222 4.99 19.1328C5.29151 18.6687 5.45873 18.1301 5.47317 17.5769C5.48761 17.0236 5.3487 16.4771 5.07181 15.9978C4.79492 15.5186 4.39085 15.1252 3.90431 14.8614C3.41776 14.5976 2.8677 14.4734 2.315 14.5028C2.11 13.7038 2 12.8658 2 11.9998ZM6.804 14.9998C7.434 16.0908 7.614 17.3458 7.368 18.5238C7.776 18.8138 8.21 19.0648 8.665 19.2738C9.58167 18.4527 10.7693 17.999 12 17.9998C13.26 17.9998 14.438 18.4708 15.335 19.2738C15.79 19.0648 16.224 18.8138 16.632 18.5238C16.3794 17.3198 16.5803 16.0649 17.196 14.9998C17.8106 13.9342 18.797 13.133 19.966 12.7498C20.0122 12.2509 20.0122 11.7487 19.966 11.2498C18.7966 10.8669 17.8099 10.0656 17.195 8.99982C16.5793 7.93475 16.3784 6.67985 16.631 5.47582C16.2231 5.18574 15.7889 4.93464 15.334 4.72582C14.4176 5.54675 13.2303 6.00043 12 5.99982C10.7693 6.00067 9.58167 5.54698 8.665 4.72582C8.21013 4.93464 7.77589 5.18574 7.368 5.47582C7.62056 6.67985 7.41972 7.93475 6.804 8.99982C6.18937 10.0654 5.20298 10.8667 4.034 11.2498C3.98775 11.7487 3.98775 12.2509 4.034 12.7498C5.20335 13.1328 6.19013 13.934 6.805 14.9998H6.804ZM12 14.9998C11.2044 14.9998 10.4413 14.6837 9.87868 14.1211C9.31607 13.5585 9 12.7955 9 11.9998C9 11.2042 9.31607 10.4411 9.87868 9.8785C10.4413 9.31589 11.2044 8.99982 12 8.99982C12.7956 8.99982 13.5587 9.31589 14.1213 9.8785C14.6839 10.4411 15 11.2042 15 11.9998C15 12.7955 14.6839 13.5585 14.1213 14.1211C13.5587 14.6837 12.7956 14.9998 12 14.9998ZM12 12.9998C12.2652 12.9998 12.5196 12.8945 12.7071 12.7069C12.8946 12.5194 13 12.265 13 11.9998C13 11.7346 12.8946 11.4802 12.7071 11.2927C12.5196 11.1052 12.2652 10.9998 12 10.9998C11.7348 10.9998 11.4804 11.1052 11.2929 11.2927C11.1054 11.4802 11 11.7346 11 11.9998C11 12.265 11.1054 12.5194 11.2929 12.7069C11.4804 12.8945 11.7348 12.9998 12 12.9998Z" fill="#03053D" />
                                </svg>
                            </div> */}
                            <div className="drawer-content float-right ">
                                {/* Page content here */}
                                <label htmlFor="my-drawer-4" className="drawer-button cursor-pointer ">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 11.9998C2 11.1348 2.11 10.2968 2.316 9.49582C2.86847 9.52486 3.4182 9.40057 3.90444 9.13668C4.39068 8.8728 4.79448 8.47961 5.07121 8.00056C5.34793 7.52152 5.48681 6.97528 5.47247 6.42224C5.45814 5.8692 5.29117 5.33089 4.99 4.86682C6.19894 3.67739 7.69079 2.81531 9.325 2.36182C9.57599 2.85529 9.95864 3.26968 10.4306 3.55913C10.9025 3.84857 11.4454 4.00177 11.999 4.00177C12.5526 4.00177 13.0955 3.84857 13.5674 3.55913C14.0394 3.26968 14.422 2.85529 14.673 2.36182C16.3072 2.81531 17.7991 3.67739 19.008 4.86682C18.7065 5.33097 18.5393 5.86949 18.5248 6.42278C18.5104 6.97608 18.6493 7.52258 18.9262 8.00183C19.2031 8.48108 19.6071 8.87438 20.0937 9.13823C20.5802 9.40208 21.1303 9.52619 21.683 9.49682C21.889 10.2968 21.999 11.1348 21.999 11.9998C21.999 12.8648 21.889 13.7028 21.683 14.5038C21.1305 14.4746 20.5806 14.5987 20.0942 14.8625C19.6078 15.1263 19.2039 15.5195 18.927 15.9986C18.6502 16.4777 18.5112 17.024 18.5255 17.5771C18.5398 18.1303 18.7068 18.6687 19.008 19.1328C17.7991 20.3222 16.3072 21.1843 14.673 21.6378C14.422 21.1443 14.0394 20.7299 13.5674 20.4405C13.0955 20.1511 12.5526 19.9979 11.999 19.9979C11.4454 19.9979 10.9025 20.1511 10.4306 20.4405C9.95864 20.7299 9.57599 21.1443 9.325 21.6378C7.69079 21.1843 6.19894 20.3222 4.99 19.1328C5.29151 18.6687 5.45873 18.1301 5.47317 17.5769C5.48761 17.0236 5.3487 16.4771 5.07181 15.9978C4.79492 15.5186 4.39085 15.1252 3.90431 14.8614C3.41776 14.5976 2.8677 14.4734 2.315 14.5028C2.11 13.7038 2 12.8658 2 11.9998ZM6.804 14.9998C7.434 16.0908 7.614 17.3458 7.368 18.5238C7.776 18.8138 8.21 19.0648 8.665 19.2738C9.58167 18.4527 10.7693 17.999 12 17.9998C13.26 17.9998 14.438 18.4708 15.335 19.2738C15.79 19.0648 16.224 18.8138 16.632 18.5238C16.3794 17.3198 16.5803 16.0649 17.196 14.9998C17.8106 13.9342 18.797 13.133 19.966 12.7498C20.0122 12.2509 20.0122 11.7487 19.966 11.2498C18.7966 10.8669 17.8099 10.0656 17.195 8.99982C16.5793 7.93475 16.3784 6.67985 16.631 5.47582C16.2231 5.18574 15.7889 4.93464 15.334 4.72582C14.4176 5.54675 13.2303 6.00043 12 5.99982C10.7693 6.00067 9.58167 5.54698 8.665 4.72582C8.21013 4.93464 7.77589 5.18574 7.368 5.47582C7.62056 6.67985 7.41972 7.93475 6.804 8.99982C6.18937 10.0654 5.20298 10.8667 4.034 11.2498C3.98775 11.7487 3.98775 12.2509 4.034 12.7498C5.20335 13.1328 6.19013 13.934 6.805 14.9998H6.804ZM12 14.9998C11.2044 14.9998 10.4413 14.6837 9.87868 14.1211C9.31607 13.5585 9 12.7955 9 11.9998C9 11.2042 9.31607 10.4411 9.87868 9.8785C10.4413 9.31589 11.2044 8.99982 12 8.99982C12.7956 8.99982 13.5587 9.31589 14.1213 9.8785C14.6839 10.4411 15 11.2042 15 11.9998C15 12.7955 14.6839 13.5585 14.1213 14.1211C13.5587 14.6837 12.7956 14.9998 12 14.9998ZM12 12.9998C12.2652 12.9998 12.5196 12.8945 12.7071 12.7069C12.8946 12.5194 13 12.265 13 11.9998C13 11.7346 12.8946 11.4802 12.7071 11.2927C12.5196 11.1052 12.2652 10.9998 12 10.9998C11.7348 10.9998 11.4804 11.1052 11.2929 11.2927C11.1054 11.4802 11 11.7346 11 11.9998C11 12.265 11.1054 12.5194 11.2929 12.7069C11.4804 12.8945 11.7348 12.9998 12 12.9998Z" fill="#03053D" />
                                    </svg>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-5 md:grid-cols-1">
                                {inputConfig && Object.entries(inputConfig).map(([key, value]) => (
                                    <>
                                        {key !== "rawData" && key !== "stream" && (
                                            <div className="form-control w-full " key={key}>
                                                <div className="label">
                                                    <span className="label-text capitalize">{key}</span>
                                                </div>
                                                <input
                                                    readOnly // Make this readOnly or replace with a div/span as needed
                                                    className="input input-bordered w-full"
                                                    value={value?.default?.content || value?.prompt || value?.input || ""}
                                                    onClick={() => openPopup(key, value?.default?.content || value?.prompt || value?.input || "")}
                                                />
                                            </div>
                                        )}
                                    </>
                                ))}

                                {isPopupVisible && (
                                    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
                                        <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl">
                                            <div className="flex justify-end p-2">
                                                <button onClick={closePopup} className="text-gray-600 hover:text-gray-800 transition-colors duration-150">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </div>
                                            <div className="px-4 pb-4 pt-2">
                                                <textarea
                                                    autoFocus
                                                    className="textarea textarea-bordered w-full h-60 resize-none"
                                                    value={tempInput}
                                                    onChange={handlePopupInputChange}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="form-control w-full ">
                                        <div className="label">
                                            <span className="label-text">Function call</span>
                                        </div>
                                        <input
                                            className={`input input-bordered w-full `}
                                            value={jsonString}
                                            onClick={handleInputClick}
                                            readOnly
                                        />
                                    </div>


                                    {modalOpen && (
                                        <div className="fixed inset-0 bg-opacity-50 overflow-y-auto flex justify-center items-center p-4 z-50">
                                            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl">
                                                <div className="flex justify-end p-2">
                                                    <button onClick={handleModalClose} className="text-gray-600 hover:text-gray-800 transition-colors duration-150">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                                <div className="px-4 pb-4 pt-2">
                                                    <textarea
                                                        autoFocus
                                                        placeholder={jsonPlaceholder}
                                                        className="textarea textarea-bordered w-full h-80 md:h-96 resize-none"
                                                        value={tempJsonString}
                                                        onChange={handleTextAreaChange}
                                                    ></textarea>
                                                    {!isValid && <p className="text-red-500">Invalid JSON</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {embed && embed?.length > 0 ?
                                    <ul className="menu bg-base-200 w-full rounded-box">
                                        <li>
                                            <h2 className="menu-title flex justify-between items-center">Embeded viasocket     <span onClick={() => openViasocket()} className='text-2xl cursor-pointer flex justify-center items-center'>+</span> </h2>

                                            {embed && embed?.map((value) => (
                                                <ul>
                                                    <li className='' id={value?.id} onClick={() => openViasocket(value?.id)} >
                                                        <div className='w-full flex justify-between items-center'>
                                                            <div > <div>{value.title}  </div><div className={`badge badge-sm ${value.status === "active" ? "bg-green-300" : value.status === "drafted" ? "bg-orange-300" : value.status === "deleted" ? "bg-red-300" : value.status === "paused" ? "bg-grey-300" : ""}`}>{value.status}</div></div>
                                                            <svg className='float-right' width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M27.1421 17.1213C27.5327 16.7308 28.1658 16.7308 28.5563 17.1213L31.3848 19.9497C31.7753 20.3403 31.7753 20.9734 31.3848 21.364L22.6084 30.1403L16.598 31.9081L18.3658 25.8977L27.1421 17.1213Z" stroke="#222222" stroke-width="2" />
                                                            </svg>
                                                        </div>
                                                    </li>
                                                </ul>
                                            ))}
                                        </li>
                                    </ul>
                                    :
                                    <button onClick={() => openViasocket()} className="btn">Add new embed</button>
                                }

                            </div>
                        </div>

                    </div>
                    <div className="flex-1">
                        <div className="pl-4 pr-4 pb-4">
                            {console.log(dataToSend, "data to send ")}
                            <Chat dataToSend={dataToSend} params={params} />
                        </div>
                    </div>
                </div>
                <div className="drawer drawer-end">
                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                    {/* <div className="drawer-content">
                            <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">Open drawer</label>
                        </div> */}
                    <div className="drawer-side z-10">
                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <ul className="menu p-4 w-1/2 min-h-full bg-base-200 text-base-content">
                            {/* Sidebar content here */}
                            {/* <li><a>Sidebar Item 1</a></li> */}
                            {/* <li><a>Sidebar Item 2</a></li> */}
                            Ways to get response using ai middleware
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Default </span>
                                    <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'default'} onChange={() => { setSelectedOption('default'); handleResponseChange("default") }} />
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">RTLayer</span>
                                    <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'rtlayer'} onChange={() => { setSelectedOption('rtlayer'); handleResponseChange("rtlayer") }} />
                                </label>
                            </div>
                            <div className={selectedOption === 'custom' ? "border rounded" : ""}>
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text">Custom</span>
                                        <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'custom'} onChange={() => { setSelectedOption('custom'); }} />
                                    </label>
                                </div>

                                {selectedOption === 'custom' &&
                                      <div className='border-t p-4'>
                                      <label className="form-control w-full">
                                          <div className="label">
                                              <span className="label-text">Webhook</span>
                                          </div>
                                          <input
                                              type="text"
                                              placeholder="Url"
                                              className="input input-bordered w-full"
                                              value={webhook}
                                              onChange={e => {
                                                  setWebhook(e.target.value);
                                                  validateWebhook(e.target.value);
                                              }}
                                          />
                                          {errors.webhook && <p className="text-red-500">{errors.webhook}</p>}
                                      </label>
                                      <label className="form-control">
                                          <div className="label">
                                              <span className="label-text">Header</span>
                                          </div>
                                          <textarea
                                              className="textarea textarea-bordered h-24 w-full"
                                              value={headers}
                                              onChange={e => {
                                                  setHeaders(e.target.value);
                                                  validateHeaders(e.target.value);
                                              }}
                                              placeholder="Type here"
                                          ></textarea>
                                          {errors.headers && <p className="text-red-500">{errors.headers}</p>}
                                      </label>
                                      <button className="btn btn-primary btn-sm my-5 float-right" onClick={() => handleResponseChange("custom", document.getElementById('webhook').value, document.getElementById('headers').value)}>
                                          Apply
                                      </button>
                                  </div>
                                }
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DropdownMenu;
