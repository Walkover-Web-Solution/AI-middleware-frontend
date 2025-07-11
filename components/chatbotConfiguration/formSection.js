import { useCustomSelector } from "@/customHooks/customSelector";
import { getChatBotDetailsAction, updateChatBotConfigAction } from "@/store/action/chatBotAction";
import { RefreshIcon } from "@/components/Icons";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

function RadioButton({ name, label, checked, onChange }) {
    return (
        <div className="form-control">
            <label className="label gap-2 cursor-pointer">
                <input
                    type="radio"
                    name={name}
                    className="radio checked:bg-blue-500"
                    checked={checked}
                    onChange={() => onChange({ target: { name, value: label.replaceAll(' ', '_').toLowerCase() } })}
                />
                <span className="label-text">{label}</span>
            </label>
        </div>
    );
}

function RadioGroup({ onChange, name, value }) {
    const options = [
        { label: "All Available space" },
        { label: "Left slider" },
        { label: "Right slider" },
        { label: "Pop over" },
        { label: "Popup" },
    ];

    return (
        <div>
            <div className="label">
                <span className="label-text">Position</span>
            </div>
            <div className="flex items-center justify-start gap-2">
                {options.map((option, index) => (
                    <RadioButton
                        key={index}
                        name={name}
                        label={option.label}
                        checked={option.label.replaceAll(' ', '_').toLowerCase() === value}
                        onChange={onChange}
                    />
                ))}
            </div>
        </div>


    );
}

function DimensionInput({ placeholder, options, onChange, name, value, unit }) {
    return (
        <div className="flex flex-col">
            <div className="label">
                <span className="label-text">{placeholder}</span>
            </div>
            <div className="join">
                <input
                    className="input input-bordered join-item input-sm max-w-[90px]"
                    type="number"
                    placeholder={placeholder}
                    defaultValue={value || ''}
                    onBlur={onChange}
                    min={0}
                    name={name}
                />
                <select
                    className="select select-bordered join-item select-sm max-w-[70px]"
                    value={unit || ''}
                    onChange={onChange}
                    name={`${name}Unit`}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value} disabled={option.disabled}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>

    );
}

export default function FormSection({ params, chatbotId = null }) {
    const chatBotId = chatbotId || params?.chatbot_id;
    const dispatch = useDispatch();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const iframeRef = useRef(null);
    const [formData, setFormData] = useState({
        buttonName: '',
        height: '',
        heightUnit: '',
        width: '',
        widthUnit: '',
        type: '',
        themeColor: "",
        chatbotTitle: "Chatbot",
        chatbotSubtitle: "Smart Help, On Demand",
        iconUrl: "",
        allowBridgeSwitch: false,
        bridges: []
    });

    const { chatBotConfig } = useCustomSelector((state) => ({
        chatBotConfig: state?.ChatBot?.ChatBotMap?.[chatBotId]?.config
    }));

    useEffect(() => {
        dispatch(getChatBotDetailsAction(chatBotId))
    }, [chatBotId])

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        // Update local state without making API calls
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    }, [params?.chatbot_id]);

    const handleBlur = useCallback((event) => {
        const { name, value } = event.target;

        // Dispatch the action to update the chatbot config on blur
        setFormData((prevFormData) => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };
            dispatch(updateChatBotConfigAction(chatBotId, updatedFormData));
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'chatbotConfig', data: updatedFormData },
                    '*' // You can specify a target origin here for security, replacing '*' with the domain of the iframe
                );
            }
            return updatedFormData;
        });
    }, [dispatch, params?.chatbot_id, chatBotId]);

    useEffect(() => {
        if (chatBotConfig) {
            setFormData((prevFormData) => {
                const updatedFormData = {
                    ...prevFormData,
                    ...chatBotConfig
                };
                return updatedFormData;
            })
        }
    }, [chatBotConfig]);


    useEffect(() => {

        // Use setInterval to repeatedly try sending the message
        const intervalId = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow && chatBotConfig) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'chatbotConfig', data: chatBotConfig },
                    '*' // Replace '*' with the domain of the iframe for security
                );
                clearInterval(intervalId); // Clear interval once the message is successfully sent
            }
        }, 1800); // Attempt to send every 500ms

        // Clean up the interval and event listener on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, [chatBotId]);

    const handleRefreshConfiguration = () => {
        setIsRefreshing(true);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'chatbotConfig', data: chatBotConfig },
                '*' // Replace '*' with the domain of the iframe for security
            );
        }
        setTimeout(() => {
            setIsRefreshing(false); // Stop the animation after 1 second or when the action is complete
        }, 1000);
    }

    return (
        <div className="flex flex-col gap-4 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Display</h3>
            <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">Chatbot title</span>
                </div>
                <input
                    type="text"
                    placeholder="Chatbot title"
                    className="input input-bordered w-full max-w-xs input-sm"
                    value={formData.chatbotTitle}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    name="chatbotTitle"
                />
                <div className="label">
                    <span className="label-text">Chatbot subtitle </span>
                </div>
                <input
                    type="text"
                    placeholder="Chatbot subtitle here"
                    className="input input-bordered w-full max-w-xs input-sm"
                    value={formData.chatbotSubtitle}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    name="chatbotSubtitle"
                />
                <div className="label">
                    <span className="label-text">Button title </span>
                </div>
                <input
                    type="text"
                    placeholder="Button title here"
                    className="input input-bordered w-full max-w-xs input-sm"
                    value={formData.buttonName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    name="buttonName"
                />
                <div className="label">
                    <span className="label-text">Button Icon URL</span>
                </div>
                <input
                    type="text"
                    placeholder="Button Icon URL here"
                    className="input input-bordered w-full max-w-xs input-sm"
                    value={formData.iconUrl}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    name="iconUrl"
                />
            </label>
            <div className="flex items-center justify-start gap-2">
                <DimensionInput
                    placeholder="Height"
                    options={[
                        { label: "Select unit", value: "", disabled: true },
                        { label: "px", value: "px" },
                        { label: "%", value: "%" }
                    ]}
                    onChange={handleBlur}
                    name="height"
                    value={formData.height}
                    unit={formData.heightUnit}
                />
                <DimensionInput
                    placeholder="Width"
                    options={[
                        { label: "Select unit", value: "", disabled: true },
                        { label: "px", value: "px" },
                        { label: "%", value: "%" }
                    ]}
                    onChange={handleBlur}
                    name="width"
                    value={formData.width}
                    unit={formData.widthUnit}
                />
            </div>
            <div className="flex items-center justify-start gap-2">
                <RadioGroup
                    value={formData.type}
                    onChange={handleBlur}
                    name="type"
                />
            </div>
            <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">ChatBot Theme Color </span>
                </div>
                <div className="flex justify-start items-start gap-2">
                    <input
                        type="color"
                        key={formData?.themeColor}
                        defaultValue={formData.themeColor}
                        onBlur={handleBlur}
                        name="themeColor"
                    />
                    <span>{formData.themeColor}</span>
                </div>

            </label>
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                    <span className="label-text">Allow Agent Switch</span>
                    <input type="checkbox" className="toggle" onChange={(e) => handleBlur({
                        ...e,
                        target: {
                            ...e.target,
                            name: 'allowBridgeSwitch',
                            value: e.target.checked
                        }
                    })} defaultChecked={formData?.allowBridgeSwitch} checked={formData?.allowBridgeSwitch} name="allowBridgeSwitch" />
                </label>
                {
                    formData?.allowBridgeSwitch && <BridgesToSwitch chatBotId={chatBotId} handleSave={handleBlur} orgId={params?.org_id}/>
                }
            </div> 
            <div className="">
                <div className="label">
                    <span className="label-text">ChatBot Preview </span>
                    <span className="flex flex-row items-center gap-3 cursor-pointer" onClick={handleRefreshConfiguration}>Refresh <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} size={16} /></span>
                </div>
                <div className="shadow-sm border">
                    <iframe
                        ref={iframeRef}
                        src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/chatbotPreview`}
                        className="w-full h-[500px] border-none"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

function BridgesToSwitch({ chatBotId, handleSave ,orgId}) {

    let { eligibleBridges, unEligibleBrigdes } = useCustomSelector((state) => ({
        ...(() => {
            const eligibleBridges = []
            const unEligibleBrigdes = []
            Object.values(state.bridgeReducer.allBridgesMap || {})?.forEach((item) => {
                if(item?.org_id === orgId){
                    if (!!item?.slugName && !!item?.published_version_id ) {
                        const allowedBridge = state?.ChatBot?.ChatBotMap?.[chatBotId]?.config?.bridges?.find(bridge => bridge?.id === item?._id);
                        const newItem = { ...item }; // Create a shallow copy of the item
                        newItem.displayName = allowedBridge?.displayName || item.name;
                        if (allowedBridge) {
                            newItem.checked = true;
                        }
                        eligibleBridges?.push(newItem);
                    } else {
                        unEligibleBrigdes?.push(item);
                    }
                }
            });
            return { eligibleBridges, unEligibleBrigdes }
        })()
    }));

    const [eligibleBridgesArr, setEligibleBridgesArr] = useState(eligibleBridges)

    const handleBridgeCheck = (e, bridge) => {
        setEligibleBridgesArr(prevState =>
            prevState.map(item =>
                item?._id === bridge?._id ? { ...item, checked: e?.target?.checked } : item
            )
        );
    }

    const handleDisplayNameChange = (e, bridge) => {
        setEligibleBridgesArr(prevState =>
            prevState.map(item =>
                item?._id === bridge?._id ? { ...item, displayName: e?.target?.value } : item
            )
        );
    }

    const pathName = usePathname();
    const router = useRouter();
    const path = pathName.split('?')[0].split('/')
    const handleNavigation = (id, versionId) => {
        router.push(`/org/${path[2]}/agents/configure/${id}?version=${versionId}`);
    }

    return <div className="border p-2 flex flex-col gap-2">
        <div className="overflow-x-auto min-h-20 h-auto max-h-72 overflow-y-auto">
            <table className="table">
                {/* head */}
                <thead>
                    <tr>
                        <th>

                        </th>
                        <th>Agent Name</th>
                        <th>Display Name</th>

                    </tr>
                </thead>
                <tbody>
                    {
                        eligibleBridgesArr?.map((bridge, index) => {
                            return <tr key={index}>
                                <th>
                                    <label>
                                        <input type="checkbox" className="checkbox" onChange={(e) => handleBridgeCheck(e, bridge)} checked={bridge?.checked} />
                                    </label>
                                </th>
                                <td>
                                    <div className="cursor-pointer" onClick={() => handleNavigation(bridge._id, bridge?.published_version_id || bridge?.versions?.[0])}>{bridge?.name}</div>
                                </td>
                                <td>
                                    <input
                                        placeholder="Enter Display Name"
                                        className="input input-bordered w-full max-w-xs input-sm"
                                        defaultValue={bridge?.displayName || bridge?.name}
                                        onChange={(e) => handleDisplayNameChange(e, bridge)}
                                    />
                                </td>
                            </tr>
                        })
                    }
                    {
                        unEligibleBrigdes?.map((bridge, index) => {
                            return <tr key={index}>
                                <th>
                                    <label >
                                        <div className="tooltip tooltip-right cursor-pointer" data-tip="Publish a version and add a slug name to select.">
                                            <input type="checkbox" className="checkbox" disabled />
                                        </div>
                                    </label>
                                </th>
                                <td>
                                    <div className="cursor-pointer" onClick={() => handleNavigation(bridge._id, bridge?.published_version_id || bridge?.versions?.[0])}>{bridge?.name}</div>
                                </td>

                            </tr>
                        })
                    }
                </tbody>

            </table>
        </div>

        <div className="flex justify-end">
            <button
                className="btn btn-primary"
                onClick={() => handleSave({
                    target: {
                        value: eligibleBridgesArr?.filter((item) => item.checked).map((item) => ({
                            id: item?._id,
                            name: item?.name,
                            displayName: item?.displayName || item?.name,
                            slugName: item?.slugName
                        })),
                        name: "bridges"
                    }
                })}
            >
                Save
            </button>
        </div>
    </div>
}