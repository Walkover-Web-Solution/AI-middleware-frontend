import { useCustomSelector } from "@/customSelector/customSelector";
import { updateChatBotConfigAction } from "@/store/action/chatBotAction";
import { useEffect, useState, useCallback } from "react";
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

export default function FormSection({ params }) {
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
    });

    const { chatBotConfig } = useCustomSelector((state) => ({
        chatBotConfig: state?.ChatBot?.ChatBotMap?.[params?.chatbot_id]?.config
    }));

    const dispatch = useDispatch();

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };
            dispatch(updateChatBotConfigAction(params?.chatbot_id, updatedFormData));
            return updatedFormData;
        });
    }, [dispatch, params?.chatbot_id]);

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
                    key={formData.chatbotTitle}
                    className="input input-bordered w-full max-w-xs input-sm"
                    defaultValue={formData.chatbotTitle}
                    onBlur={handleInputChange}
                    name="chatbotTitle"
                />
                <div className="label">
                    <span className="label-text">Chatbot subtitle </span>
                </div>
                <input
                    type="text"
                    placeholder="Chatbot subtitle here"
                    key={formData.chatbotSubtitle}
                    className="input input-bordered w-full max-w-xs input-sm"
                    defaultValue={formData.chatbotSubtitle}
                    onBlur={handleInputChange}
                    name="chatbotSubtitle"
                />
                <div className="label">
                    <span className="label-text">Button title </span>
                </div>
                <input
                    type="text"
                    placeholder="Button title here"
                    key={formData.buttonName}
                    className="input input-bordered w-full max-w-xs input-sm"
                    defaultValue={formData.buttonName}
                    onBlur={handleInputChange}
                    name="buttonName"
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    name="width"
                    value={formData.width}
                    unit={formData.widthUnit}
                />
            </div>
            <div className="flex items-center justify-start gap-2">
                <RadioGroup
                    value={formData.type}
                    onChange={handleInputChange}
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
                        onBlur={handleInputChange}
                        name="themeColor"
                    />
                    <span>{formData.themeColor}</span>
                </div>

            </label>
        </div>
    );
}
