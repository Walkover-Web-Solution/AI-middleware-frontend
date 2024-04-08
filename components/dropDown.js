    "use client"
    import React, { useEffect, useState } from 'react';
    import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file
    import { useCustomSelector } from '@/customSelector/customSelector';
    import { useSelector } from 'react-redux';
    import { modelInfo } from '@/jsonFiles/allModelsConfig (1)';
    import Chat from './chat';

    const DropdownMenu = ({ params, data }) => {
        const openaiData = services.openai;
        const { bridgeData } = useSelector((state) => ({
            bridgeData: state?.bridgeReducer?.allBridgesMap?.[params?.id] || {}
        }))

        const [toggle, setToggle] = useState(false)
        const [selectedService, setSelectedService] = useState('');
        const [selectedModel, setSelectedModel] = useState(bridgeData?.bridges?.configuration?.model?.default);
        const [dataToSend, setDataToSend] = useState({})
        const [apiKey, setApiKey] = useState('')
        const [modelInfoData, setModelInfoData] = useState({})
        const [inputConfig, setInputConfig] = useState(data?.inputConfig ?? modelInfo?.data?.configuration?.model?.default?.inputConfig)
        const [isPopupVisible, setPopupVisible] = useState(false);
        const [tempInput, setTempInput] = useState('');
        const [activeKey, setActiveKey] = useState('');
        const [jsonString, setJsonString] = useState('');
        const [isValid, setIsValid] = useState(true);
        const [modalOpen, setModalOpen] = useState(false);
        const [tempJsonString, setTempJsonString] = useState('');

          const jsonTemplate = [{
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
                            "description": "The temperature unit to use. Infer this from the users location.",
                        },
                    },
                    "required": ["location", "format"],
                },
            }
        }];
          const formattedJsonTemplate = JSON.stringify(jsonTemplate, null, 2);

      
        // console.log(inputConfig)

        useEffect(() => {
            setSelectedService(bridgeData?.bridges?.service?.toLowerCase());
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
                        "prompt": [],
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
                        "input": "",
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
                            "prompt": "",
                            "type": foundKey

                        },
                        'service': selectedService,
                        // "org_id":"124dfgh67ghj",
                        "apikey": apiKey
                    }
                )
            }

        }, [bridgeData, data]);



        const handleService = (e) => {
            const newSelectedService = e.target.value;
            
            setModelInfoData(modelInfo[selectedService][selectedModel]?.configuration || {});
            setInputConfig(modelInfo[selectedService][selectedModel]?.inputConfig || {});
            // setInputConfig(defaultdata);
            setSelectedService(newSelectedService);
            // setSelectedModel("")
        }

        const handleModel = (e) => {
            const newSelectedModel = e.target.value;
            // setModelInfoData(modelInfo[selectedService][newSelectedModel]?.configuration || {});
            // setInputConfig(modelInfo[selectedService][newSelectedModel]?.inputConfig || {});
            setSelectedModel(newSelectedModel); // Update selectedModel state with the newly selected model
            if (dataToSend.configuration.type === e.target.selectedOptions[0].parentNode.label) {
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    configuration: {
                        ...prevDataToSend.configuration,
                        model: e.target.value, // Update the model in the configuration
                        type: e.target.selectedOptions[0].parentNode.label
                    },
                    service: selectedService,
                    apiKey: apiKey
                }));
            }
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
                else if (e.target.selectedOptions[0].parentNode.label === "completion"){

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
        const handleInputChange = (e, key) => {
            let newValue;
            if (modelInfoData[key]?.field === "checkbox" || modelInfoData[key]?.field === "boolean") {

                newValue = e.target.checked; // Use checked for checkboxes

            } else {
                newValue = e.target.value;
            }
            const updatedModelInfo = {
                ...modelInfoData,
                [key]: {
                    ...modelInfoData[key],
                    default: newValue,
                },
            };
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    [key]: modelInfoData[key]?.field === "number" || modelInfoData[key]?.field === "slider" ? Number(newValue) : newValue
                }
            }));
            setModelInfoData(updatedModelInfo);
        };
        const toggleAccordion = () => {
            setToggle(!toggle)
        }

        const handleInputConfigChanges = (value, key) => {
            // Update the inputConfig state with the new value
            setInputConfig(prevInputConfig => ({
                ...prevInputConfig,
                [key]: {
                    default: {
                        content: value
                    }
                }
            }));

            // Update the dataToSend state with the new prompt string

        };

        const SaveData = (value, key) => {
            const promptString = { "role": key, "content": value };
            if (key === "input") {
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    configuration: {
                        ...prevDataToSend.configuration,
                        [key]: value
                    }
                }));


            }
            else if (key === "prompt") {
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    configuration: {
                        ...prevDataToSend.configuration,
                        [key]: value
                    }
                }));
            }
            else if (key === "apikey") {
                setDataToSend(prevDataToSend => ({
                    ...prevDataToSend,
                    [key]: value
                }));
            }
            else {
        // Check if the key already exists in the prompt array
        const keyIndex = dataToSend?.configuration?.prompt?.findIndex(item => (item).role === key);
        if (keyIndex !== -1) {
            // Key already exists, update the value
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    prompt: prevDataToSend.configuration.prompt.map((item, index) => index === keyIndex ? promptString : item)
                }
            }));
        } else {
            // Key does not exist, add it to the prompt array
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

        const openPopup = (key, currentValue) => {
            setTempInput(currentValue);
            setActiveKey(key);
            setPopupVisible(true);
          };
        
          // Function to handle popup input changes
          const handlePopupInputChange = (e) => {
            setTempInput(e.target.value);
          };
        
          // Function to close the popup and save the data
          const closePopup = () => {
            handleInputConfigChanges(tempInput, activeKey);
            SaveData(tempInput, activeKey);
            setPopupVisible(false);
          };

        
          const handleModalClose = () => {
            setModalOpen(false);
          };
        
          const handleTextAreaChange = (event) => {
            const input = event.target.value;
            setTempJsonString(input);
            try {
              JSON.parse(input);
              setIsValid(true);
            } catch (error) {
              setIsValid(false);
            }
          };
        
          const handleInputClick = () => {
            setModalOpen(true);
            setTempJsonString(jsonString || formattedJsonTemplate);
            setIsValid(true);
          };
        
          const handleCrossClick = () => {
            setJsonString(tempJsonString);
            setModalOpen(false);
          };


    return (
        <div className='flex items-start h-full justify-start'>

            <div className='    w-1/5 h-full pr-2'>
                <label className="form-control w-full max-w-xs">
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

                <label className="form-control w-full mb-2 max-w-xs">
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
                                                className="select w-full max-w-xs"
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

            <div className="hero h-full w-full ">
                <div className="hero-content justify-between items-start max-w-full flex-col lg:flex-row">
                <div>
      {inputConfig && Object.entries(inputConfig).map(([key, value]) => (
        <>
          {key !== "rawData" && (
            <div className="form-control w-full max-w-xs" key={key}>
              <div className="label">
                <span className="label-text">{key}</span>
              </div>
              <input
                readOnly // Make this readOnly or replace with a div/span as needed
                className="input input-bordered w-full max-w-xs"
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
      <div className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Function Call</span>
        </div>
        <input
          className="input input-bordered w-full max-w-xs"
          value={jsonString}
          onClick={handleInputClick}
          readOnly
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-opacity-50 overflow-y-auto flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl">
            <div className="flex justify-end p-2">
              <button onClick={handleCrossClick} className="text-gray-600 hover:text-gray-800 transition-colors duration-150">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="px-4 pb-4 pt-2">
              <textarea
                autoFocus
                placeholder='Enter or paste JSON here'
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

    </div>
                    <div className='w-full'>
                        <Chat dataToSend={dataToSend} params={params} />
                    </div>
                </div>
            </div>

        </div>
    );
    };

    export default DropdownMenu;
