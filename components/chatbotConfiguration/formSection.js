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

function BridgesToSwitch({ chatBotId, handleSave, orgId }) {
    let { eligibleBridges, unEligibleBrigdes } = useCustomSelector((state) => ({
        ...(() => {
            const eligibleBridges = []
            const unEligibleBrigdes = []
            Object.values(state.bridgeReducer.allBridgesMap || {})?.forEach((item) => {
                if(item?.org_id === orgId){
                    if (!!item?.slugName && !!item?.published_version_id ) {
                        const allowedBridge = state?.ChatBot?.ChatBotMap?.[chatBotId]?.config?.bridges?.find(bridge => bridge?.id === item?._id);
                        const newItem = { ...item };
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

    return (
        <div className="border border-base-content/20 p-4 rounded-lg bg-base-200">
            <div className="overflow-x-auto min-h-20 h-auto max-h-72 overflow-y-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Agent Name</th>
                            <th>Display Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eligibleBridgesArr?.map((bridge, index) => (
                            <tr key={index}>
                                <th>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            className="checkbox" 
                                            onChange={(e) => handleBridgeCheck(e, bridge)} 
                                            checked={bridge?.checked} 
                                        />
                                    </label>
                                </th>
                                <td>
                                    <div 
                                        className="cursor-pointer hover:text-blue-600" 
                                        onClick={() => handleNavigation(bridge._id, bridge?.published_version_id || bridge?.versions?.[0])}
                                    >
                                        {bridge?.name}
                                    </div>
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
                        ))}
                        {unEligibleBrigdes?.map((bridge, index) => (
                            <tr key={index} className="opacity-50">
                                <th>
                                    <label>
                                        <div className="tooltip tooltip-right cursor-pointer" data-tip="Publish a version and add a slug name to select.">
                                            <input type="checkbox" className="checkbox" disabled />
                                        </div>
                                    </label>
                                </th>
                                <td>
                                    <div 
                                        className="cursor-pointer" 
                                        onClick={() => handleNavigation(bridge._id, bridge?.published_version_id || bridge?.versions?.[0])}
                                    >
                                        {bridge?.name}
                                    </div>
                                </td>
                                <td>-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
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
                    Save Changes
                </button>
            </div>
        </div>
    );
}

export default function FormSection({ params, chatbotId = null }) {
    const dispatch = useDispatch();
    const { chatbots } = useCustomSelector((state) => ({
        chatbots: state?.ChatBot?.org?.[params?.org_id] || [],
    }));
    const [chatBotId, setChatBotId] = useState(chatbotId || params?.chatbot_id || chatbots[0]?._id);
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
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    }, [params?.chatbot_id]);

    const handleBlur = useCallback((event) => {
        const { name, value } = event.target;

        setFormData((prevFormData) => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };
            dispatch(updateChatBotConfigAction(chatBotId, updatedFormData));
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'chatbotConfig', data: updatedFormData },
                    '*'
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
        const intervalId = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow && chatBotConfig) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'chatbotConfig', data: chatBotConfig },
                    '*'
                );
                clearInterval(intervalId);
            }
        }, 1800);

        return () => {
            clearInterval(intervalId);
        };
    }, [chatBotId]);

    const handleRefreshConfiguration = () => {
        setIsRefreshing(true);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'chatbotConfig', data: chatBotConfig },
                '*'
            );
        }
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    }

    return (
        <div className="space-y-6">
            {/* Display Settings Section */}
            <div className="bg-base-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6 border-b border-base-content/20 pb-2">Display Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-medium">Chatbot Title</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter chatbot title"
                                className="input input-bordered w-full input-sm"
                                value={formData.chatbotTitle}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                name="chatbotTitle"
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-medium">Chatbot Subtitle</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter chatbot subtitle"
                                className="input input-bordered w-full input-sm"
                                value={formData.chatbotSubtitle}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                name="chatbotSubtitle"
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-medium">Button Title</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter button title"
                                className="input input-bordered w-full input-sm"
                                value={formData.buttonName}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                name="buttonName"
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-medium">Button Icon URL</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter icon URL"
                                className="input input-bordered w-full input-sm"
                                value={formData.iconUrl}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                name="iconUrl"
                            />
                        </label>
                    </div>

                    {/* Dimensions and Styling */}
                    <div className="space-y-4">
                        <div className="flex items-end gap-4">
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

                        <div>
                            <RadioGroup
                                value={formData.type}
                                onChange={handleBlur}
                                name="type"
                            />
                        </div>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-medium">Theme Color</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    key={formData?.themeColor}
                                    defaultValue={formData.themeColor}
                                    onBlur={handleBlur}
                                    name="themeColor"
                                    className="w-12 h-8 rounded border"
                                />
                                <span className="text-sm text-gray-600">{formData.themeColor}</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Agent Switch Section */}
            <div className="bg-base-100 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 border-b border-base-content/20 pb-2">Agent Configuration</h3>
                
                <div className="space-y-4">
                    <label className="flex items-center gap-3">
                        <span className="label-text font-medium">Allow Agent Switch</span>
                        <input 
                            type="checkbox" 
                            className="toggle toggle-primary" 
                            onChange={(e) => handleBlur({
                                ...e,
                                target: {
                                    ...e.target,
                                    name: 'allowBridgeSwitch',
                                    value: e.target.checked
                                }
                            })} 
                            defaultChecked={formData?.allowBridgeSwitch} 
                            checked={formData?.allowBridgeSwitch} 
                            name="allowBridgeSwitch" 
                        />
                    </label>
                    
                    {formData?.allowBridgeSwitch && (
                        <BridgesToSwitch 
                            chatBotId={chatBotId} 
                            handleSave={handleBlur} 
                            orgId={params?.org_id}
                        />
                    )}
                </div>
            </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg shadow-lg border border-base-content/40">
                {/* Header */}
                <div className="bg-base-200 px-6 py-4 border-b border-base-content/20 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-base-content">Live Preview</h3>
                                <p className="text-sm text-base-content">See how your chatbot will appear to users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                className={`btn btn-sm gap-2 transition-all duration-200 ${
                                    isRefreshing 
                                        ? 'bg-base-200 text-blue-600' 
                                        : 'hover:bg-base-200 hover:text-blue-600'
                                }`}
                                onClick={handleRefreshConfiguration}
                                disabled={isRefreshing}
                            >
                                <RefreshIcon 
                                    className={`transition-transform duration-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} 
                                    size={16} 
                                />
                                {isRefreshing ? 'Refreshing...' : 'Refresh Preview'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                    <div className="relative">
                        {/* Loading Overlay */}
                        {isRefreshing && (
                            <div className="absolute inset-0 bg-base-100 bg-opacity-90 flex items-center justify-center z-10 rounded-b-lg">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-base-content font-medium">Updating preview...</p>
                                </div>
                            </div>
                        )}

                        {/* Iframe Container */}
                        <div className="relative bg-base-200 rounded-b-lg overflow-hidden shadow-inner h-[80vh]">
                            <iframe
                                ref={iframeRef}
                                src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/chatbotPreview`}
                                className="w-full h-full border-none transition-opacity duration-300 bg-transparent"
                                style={{ opacity: isRefreshing ? 0.5 : 1 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}