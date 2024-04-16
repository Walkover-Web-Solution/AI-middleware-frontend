"use client"
import React, { useEffect, useState } from 'react';
import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file
import { useSelector } from 'react-redux';
import { modelInfo } from '@/jsonFiles/allModelsConfig (1)';
import Chat from './chat';

const DropdownMenu = ({ params, data }) => {
    // const openaiData = services.openai;
    const { bridgeData } = useSelector((state) => ({
        bridgeData: state?.bridgeReducer?.allBridgesMap?.[params?.id] || {}
    }))

    const [toggle, setToggle] = useState(false)
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState(bridgeData?.bridges?.configuration?.model?.default);
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


    useEffect(() => {
        setSelectedService(bridgeData?.bridges?.service?.toLowerCase());
        setApiKey(bridgeData?.bridges?.apikey || "");
        setJsonString(JSON.stringify(data?.configuration?.tools) || "")
        setSelectedModel(bridgeData?.bridges?.configuration?.model?.default)
        setModelInfoData(data?.configuration)
        // setInputConfig(modelInfo?.bridgeData?.bridges?.configuration?.model?.default?.inputConfig); // Default to an empty object if data?.inputConfig is undefined
        setInputConfig(data?.inputConfig || {});

        // Find the key associated with the targetValue
        let foundKey = null;
        for (const key in services[bridgeData?.bridges?.service?.toLowerCase()]) {
            if (services[bridgeData?.bridges?.service?.toLowerCase()][key].has(bridgeData?.bridges?.configuration?.model?.default)) {
                foundKey = key;
                break;
            }
        }
        if (foundKey === 'chat')
            setDataToSend({
                "configuration": {
                    "model": selectedModel,
                    "prompt": [...bridgeData?.bridges?.configuration?.prompt || ""],
                    "type": foundKey,
                    "user": [],
                    "conversation": []
                },
                "service": selectedService,
                // "org_id":"124dfgh67ghj",
                "apikey": apiKey
            })
        else if (foundKey === "embedding")
            setDataToSend({
                "configuration": {
                    "model": selectedModel,
                    "input":  bridgeData?.bridges?.configuration?.input,
                    "type": foundKey

                },
                "service": selectedService,
                // "org_id":"124dfgh67ghj",
                "apikey": apiKey
            })

        else {
            setDataToSend(
                {
                    "configuration": {
                        "model": selectedModel,
                        "prompt":  bridgeData?.bridges?.configuration?.prompt ,
                        "type": foundKey

                    },
                    'service': selectedService,
                    // "org_id":"124dfgh67ghj",
                    "apikey": apiKey
                }
            )
        }

    }, [bridgeData, data, params]);



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
                apiKey: apiKey // Keep the same apiKey
            }));
        }
        // If the newly selected model is not of the same type as the current type, we need to create a new dataToSend object
        // Depending on the type of the newly selected model, we set the inputConfig and modelInfoData states accordingly
        // Then we set the new dataToSend object
        else {

            if (e.target.selectedOptions[0].parentNode.label === 'chat') {

                setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend({
                    "configuration": {
                        "model": e.target.value,
                        "prompt": [],
                        "type": e.target.selectedOptions[0].parentNode.label,
                        "user": [],
                        "conversation": []
                    },
                    "service": selectedService,
                    // "org_id":"124dfgh67ghj",
                    "apikey": apiKey
                })
            }
            else if (e.target.selectedOptions[0].parentNode.label === "embedding") {

                setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend({
                    "configuration": {
                        "model": e.target.value,
                        "input": "",
                        "type": e.target.selectedOptions[0].parentNode.label

                    },
                    "service": selectedService,
                    // "org_id":"124dfgh67ghj",
                    "apikey": apiKey
                })
            }
            else if (e.target.selectedOptions[0].parentNode.label === "completion") {

                setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
                setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});

                setDataToSend(
                    {
                        "configuration": {
                            "model": e.target.value,
                            "prompt": "",
                            "type": e.target.selectedOptions[0].parentNode.label

                        },
                        "service": selectedService,
                        // "org_id":"124dfgh67ghj",
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
    const handleInputChange = (e, key) => {
        let newValue;
        // If the field is a checkbox or a boolean, use the checked property of the event target
        if (modelInfoData[key]?.field === "checkbox" || modelInfoData[key]?.field === "boolean") {
            newValue = e.target.checked; // Use checked for checkboxes
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
                [key]: modelInfoData[key]?.field === "number" || modelInfoData[key]?.field === "slider" ? Number(newValue) : newValue
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
        setJsonString(tempJsonString); // Save the JSON string in state
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

        try {
            JSON.parse(newJsonString); // Try to parse the new JSON string
            setIsValid(true); // If it parses correctly, set isValid to true
        } catch (error) {
            setIsValid(false); // If it doesn't parse correctly, set isValid to false
        }
    };




    return (
        <>
        <div className=" " style={{height : "90vh"}}>
        <div className=" flex flex-col overflow-hidden  border border-gray-300 md:flex-row">
          <div className="w-full border-r border-gray-300 bg-gray-100 md:max-w-xs">
            <div className="p-4 overflow-auto" style={{height : "90vh"}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-5 md:grid-cols-1">
              <label className="form-control w-full ">
                    <div className="label">
                        <span className="label-text">Service</span>
                    </div>
                    <select value={selectedService} onChange={handleService} className="select select-bordered">
                        <option disabled selected>Select a Service</option>
                        <option value="google">google</option>
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
                    key !== 'model' && value.level !== 0 &&
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
                                            checked={!!value.default} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
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
                            key !== 'model' && key !== 'tool' && key !== "response_format" && key !== 'tool_choice' && value.level === 0 &&
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
                                                    checked={!!value.default} // Ensure this is a boolean value. Use `!!` to coerce to boolean if necessary.
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
                <p>Provide Your ApiKey</p>
                <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="input w-full input-bordered"
                    onBlur={(e) => SaveData(e.target.value, "apikey")}
                />

              </div>
            </div>
            
          </div>
          <div className="w-full border-r border-gray-300 bg-gray-100 md:max-w-xs">
            <div className="p-4 overflow-auto h-" style={{height : "90vh"}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-5 md:grid-cols-1">
              {inputConfig && Object.entries(inputConfig).map(([key, value]) => (
                            <>
                                {key !== "rawData" && (
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
                                                placeholder='{ "key" : "value" }'
                                                className="textarea textarea-bordered w-full h-80 md:h-96 resize-none"
                                                value={tempJsonString}
                                                onChange={handleTextAreaChange}
                                            // onBlur={(e)=> }
                                            ></textarea>
                                            {!isValid && <p className="text-red-500">Invalid JSON</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
              </div>
            </div>
            
          </div>
          <div className="flex-1">
            <div className="pl-4 pr-4 pb-4">
         
                        <Chat dataToSend={dataToSend} params={params} />
            </div>
          </div>
        </div>
      </div>
        </>
    );
};

export default DropdownMenu;
