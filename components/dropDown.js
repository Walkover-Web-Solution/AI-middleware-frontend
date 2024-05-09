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
    const [isValid, setIsValid] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [tempJsonString, setTempJsonString] = useState('');
    const [selectedOption, setSelectedOption] = useState('default');
    const [webhook, setWebhook] = useState(data?.responseFormat?.webhook || "");
    const [headers, setHeaders] = useState(data?.responseFormat?.headers || "");
    const [errors, setErrors] = useState({ webhook: "", headers: "" });
    const dispatch = useDispatch()

    // Check conditions and set the selected option accordingly
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
        if (key === "default") {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: false,
                    webhook: "", // Set webhook to an empty string for default option
                    headers: {}
                }
            }));
        }
        if (key === 'RTLayer') {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: true,
                    webhook: "", // Set webhook to an empty string for RTLayer option
                    headers: {}
                }
            }));
        }
        if (key === 'custom') {
            setDataToSend(prevDataToSend => ({
                ...prevDataToSend,
                configuration: {
                    ...prevDataToSend.configuration,
                    RTLayer: false,
                    webhook: webhook, // Set webhook to the valid input
                    headers: headers // Set headers to the parsed JSON
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




    const handleModalClose = () => {
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
            console.error("Error parsing JSON:", error); // Log the error
        }
    };
    // };




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
    const UpdateBridge = async () => {
        // const updatedConfigration = removeUndefinedOrNull(localDataToSend.configuration)
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: dataToSend.configuration, service: dataToSend.service, apikey: dataToSend.apikey } }))
    }


    useEffect(() => {
        if (dataToSend?.length > 0 || apiKey?.length > 0)
            UpdateBridge();
    }, [dataToSend, apiKey]);


    return (
        <>
            <div className="h-[90vh]">
                <div className=" w-screen flex flex-col   border border-gray-300 md:flex-row">
                    <div className="w-1/3 overflow-auto border-r border-gray-300 bg-gray-100  configurationPage">
                        <div className="drawer-content float-right ">
                            {/* Page content here */}
                            <label htmlFor="my-drawer-4" className="drawer-button cursor-pointer ">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 11.9998C2 11.1348 2.11 10.2968 2.316 9.49582C2.86847 9.52486 3.4182 9.40057 3.90444 9.13668C4.39068 8.8728 4.79448 8.47961 5.07121 8.00056C5.34793 7.52152 5.48681 6.97528 5.47247 6.42224C5.45814 5.8692 5.29117 5.33089 4.99 4.86682C6.19894 3.67739 7.69079 2.81531 9.325 2.36182C9.57599 2.85529 9.95864 3.26968 10.4306 3.55913C10.9025 3.84857 11.4454 4.00177 11.999 4.00177C12.5526 4.00177 13.0955 3.84857 13.5674 3.55913C14.0394 3.26968 14.422 2.85529 14.673 2.36182C16.3072 2.81531 17.7991 3.67739 19.008 4.86682C18.7065 5.33097 18.5393 5.86949 18.5248 6.42278C18.5104 6.97608 18.6493 7.52258 18.9262 8.00183C19.2031 8.48108 19.6071 8.87438 20.0937 9.13823C20.5802 9.40208 21.1303 9.52619 21.683 9.49682C21.889 10.2968 21.999 11.1348 21.999 11.9998C21.999 12.8648 21.889 13.7028 21.683 14.5038C21.1305 14.4746 20.5806 14.5987 20.0942 14.8625C19.6078 15.1263 19.2039 15.5195 18.927 15.9986C18.6502 16.4777 18.5112 17.024 18.5255 17.5771C18.5398 18.1303 18.7068 18.6687 19.008 19.1328C17.7991 20.3222 16.3072 21.1843 14.673 21.6378C14.422 21.1443 14.0394 20.7299 13.5674 20.4405C13.0955 20.1511 12.5526 19.9979 11.999 19.9979C11.4454 19.9979 10.9025 20.1511 10.4306 20.4405C9.95864 20.7299 9.57599 21.1443 9.325 21.6378C7.69079 21.1843 6.19894 20.3222 4.99 19.1328C5.29151 18.6687 5.45873 18.1301 5.47317 17.5769C5.48761 17.0236 5.3487 16.4771 5.07181 15.9978C4.79492 15.5186 4.39085 15.1252 3.90431 14.8614C3.41776 14.5976 2.8677 14.4734 2.315 14.5028C2.11 13.7038 2 12.8658 2 11.9998ZM6.804 14.9998C7.434 16.0908 7.614 17.3458 7.368 18.5238C7.776 18.8138 8.21 19.0648 8.665 19.2738C9.58167 18.4527 10.7693 17.999 12 17.9998C13.26 17.9998 14.438 18.4708 15.335 19.2738C15.79 19.0648 16.224 18.8138 16.632 18.5238C16.3794 17.3198 16.5803 16.0649 17.196 14.9998C17.8106 13.9342 18.797 13.133 19.966 12.7498C20.0122 12.2509 20.0122 11.7487 19.966 11.2498C18.7966 10.8669 17.8099 10.0656 17.195 8.99982C16.5793 7.93475 16.3784 6.67985 16.631 5.47582C16.2231 5.18574 15.7889 4.93464 15.334 4.72582C14.4176 5.54675 13.2303 6.00043 12 5.99982C10.7693 6.00067 9.58167 5.54698 8.665 4.72582C8.21013 4.93464 7.77589 5.18574 7.368 5.47582C7.62056 6.67985 7.41972 7.93475 6.804 8.99982C6.18937 10.0654 5.20298 10.8667 4.034 11.2498C3.98775 11.7487 3.98775 12.2509 4.034 12.7498C5.20335 13.1328 6.19013 13.934 6.805 14.9998H6.804ZM12 14.9998C11.2044 14.9998 10.4413 14.6837 9.87868 14.1211C9.31607 13.5585 9 12.7955 9 11.9998C9 11.2042 9.31607 10.4411 9.87868 9.8785C10.4413 9.31589 11.2044 8.99982 12 8.99982C12.7956 8.99982 13.5587 9.31589 14.1213 9.8785C14.6839 10.4411 15 11.2042 15 11.9998C15 12.7955 14.6839 13.5585 14.1213 14.1211C13.5587 14.6837 12.7956 14.9998 12 14.9998ZM12 12.9998C12.2652 12.9998 12.5196 12.8945 12.7071 12.7069C12.8946 12.5194 13 12.265 13 11.9998C13 11.7346 12.8946 11.4802 12.7071 11.2927C12.5196 11.1052 12.2652 10.9998 12 10.9998C11.7348 10.9998 11.4804 11.1052 11.2929 11.2927C11.1054 11.4802 11 11.7346 11 11.9998C11 12.265 11.1054 12.5194 11.2929 12.7069C11.4804 12.8945 11.7348 12.9998 12 12.9998Z" fill="#03053D" />
                                </svg>
                            </label>
                        </div>
                        <div className="p-4 " style={{ height: "90vh" }}>
                            <div className="">
                                <div className="">
                                    {inputConfig && Object.entries(inputConfig).map(([key, value]) => (
                                        <>
                                            {key !== "rawData" && key !== "stream" && (
                                                <div className="form-control w-full " key={key}>
                                                    <div className="label">
                                                        <span className="label-text capitalize">{key}</span>
                                                    </div>
                                                    <textarea
                                                        autoFocus
                                                        className="textarea textarea-bordered w-full min-h-40 resize-y"
                                                        defaultValue={value?.default?.content || value?.prompt || value?.input || ""}
                                                        onBlur={(e) => { handleInputConfigChanges(e.target.value, key); SaveData(e.target.value, key) }}
                                                    ></textarea>
                                                </div>
                                            )}
                                        </>
                                    ))}

                                    <div>
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
                                    </div>



                                </div>


                                <label className="form-control w-full ">
                                    <div className="label">
                                        <span className="label-text">Service</span>
                                    </div>
                                    <select value={selectedService} onChange={handleService} className="select select-sm max-w-xs  select-bordered">
                                        <option disabled selected>Select a Service</option>
                                        <option value="google">google</option>
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
                                <div className="collapse bg-base-200">
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
                                                        id={key} // Add this id attribute
                                                        type="range"
                                                        min={value?.min}
                                                        max={value?.max}
                                                        step={value?.step}
                                                        value={value?.default}
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        className="range range-xs  w-full"
                                                        name={key} // Add name attribute
                                                    />
                                                    : value.field === 'text' ?
                                                        <input
                                                            type="text"
                                                            required={value?.level === 1 ? true : false}
                                                            value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                            onChange={(e) => handleInputChange(e, key)}
                                                            className="input w-full input-bordered max-w-xs  input-sm"
                                                            name={key} // Add name attribute
                                                        />
                                                        : value.field === 'number' ?
                                                            <input
                                                                type="number"
                                                                required={value?.level === 1 ? true : false}
                                                                value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                                                onChange={(e) => handleInputChange(e, key)}
                                                                className="input w-full input-bordered max-w-xs  input-sm"
                                                                name={key} // Add name attribute
                                                            />
                                                            :
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
                                                                    />
                                                                    :
                                                                    "this field is under development "}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className="resizer w-1 bg-base-500 cursor-col-resize hover:bg-primary" ></div>
                    <div className="w-2/3 flex-1 chatPage">
                        <div className="p-4">
                            <Chat dataToSend={dataToSend} params={params} />
                        </div>
                    </div>
                </div>

                {/* response slider */}
                {/* <div className="drawer drawer-end">
                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-side z-10">
                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <ul className="menu p-4 w-1/2 min-h-full bg-base-200 text-base-content">
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
                                    <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'RTLayer'} onChange={() => { setSelectedOption('RTLayer'); handleResponseChange("RTLayer") }} />
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
                                                className="input input-bordered max-w-xs  input-sm  w-full"
                                                id="webhook"
                                                value={webhook}
                                                onChange={e => {
                                                    setWebhook(e.target.value);
                                                    handleChangeWebhook(e.target.value);
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
                                                id="headers"
                                                value={(headers)}
                                                onChange={e => {
                                                    setHeaders(e.target.value);
                                                    handleChangeHeaders(e.target.value);
                                                }}
                                                placeholder="Type here"
                                            ></textarea>
                                            {errors.headers && <p className="text-red-500">{errors.headers}</p>}
                                        </label>
                                        <button className="btn btn-primary btn-sm my-5 float-right" onClick={() => handleResponseChange("custom", document.getElementById('webhook').value, document.getElementById('headers').value)} disabled={errors.webhook !== '' || errors.headers !== ''}>
                                            Apply
                                        </button>
                                    </div>
                                }
                            </div>
                        </ul>
                    </div>
                </div> */}
                <div className="drawer drawer-end">
                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-side z-10">
                        <label htmlFor="my-drawer-4" className="drawer-overlay" aria-label="close sidebar"></label>
                        <ul className="menu p-4 md:w-80 w-full min-h-full bg-base-200 text-base-content">
                            {/* <li className="text-lg font-semibold mb-4">Ways to get response using AI middleware</li> */}
                            <li className="text-lg font-semibold mb-4">Methods for Receiving Responses via AI Middleware</li>
                            <div className="form-control">
                                <label className="label cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'default'} onChange={() => { setSelectedOption('default'); handleResponseChange("default") }} />
                                    <span className="label-text">Default</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'RTLayer'} onChange={() => { setSelectedOption('RTLayer'); handleResponseChange("RTLayer") }} />
                                    <span className="label-text">RTLayer</span>
                                </label>
                            </div>
                            <div className={`${selectedOption === 'custom' ? "border rounded" : ""} mt-4`}>
                                <div className="form-control">
                                    <label className="label cursor-pointer flex items-center gap-2">
                                        <input type="radio" name="radio-10" className="radio checked:bg-blue-500" checked={selectedOption === 'custom'} onChange={() => { setSelectedOption('custom'); }} />
                                        <span className="label-text">Custom</span>
                                    </label>
                                </div>

                                {selectedOption === 'custom' &&
                                    <div className='border-t pt-4 px-4'>
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
                                }
                            </div>
                        </ul>
                    </div>
                </div>
            </div >
        </>
    );
};

export default DropdownMenu;

