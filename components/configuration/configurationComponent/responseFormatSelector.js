"use client";

import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { isValidJson, validateUrl } from '@/utils/utility';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ResponseFormatSelector = ({ params }) => {
    const { response_format } = useCustomSelector((state) => ({
        response_format: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.response_format,
    }));

    const [selectedOption, setSelectedOption] = useState(response_format?.type || 'default');
    const [webhookData, setWebhookData] = useState({ url: response_format?.cred?.url || "", headers: response_format?.cred?.headers || "" });
    const [errors, setErrors] = useState({ webhook: "", headers: "" });
    const dispatch = useDispatch();

    useEffect(() => {
        if (response_format) {
            setSelectedOption(response_format.type === 'RTLayer' ? 'RTLayer' : response_format.type === 'webhook' ? 'custom' : 'default');
            setWebhookData({ url: response_format?.cred?.url || "", headers: response_format?.cred?.headers || "" });
        }
    }, [response_format, params.id]);

    const handleChangeWebhook = (e) => {
        const newurl = e.target.value;
        if (newurl.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, webhook: 'Please enter a valid webhook URL' }));
            return;
        }
        const isValid = validateUrl(newurl);
        setErrors(prevErrors => ({ ...prevErrors, webhook: isValid ? '' : 'Invalid URL' }));
        setWebhookData((prevData) => ({ ...prevData, url: newurl }));
    };

    const handleChangeHeaders = (e) => {
        const newHeaders = e.target.value;
        if (newHeaders.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, headers: 'Please enter a valid headers' }));
            return;
        }
        const isValid = isValidJson(newHeaders);
        setErrors(prevErrors => ({ ...prevErrors, headers: isValid ? '' : 'Invalid JSON' }));
        setWebhookData((prevData) => ({ ...prevData, headers: newHeaders }));
    };

    const handleResponseChange = (key) => {
        const cred = key === 'custom' ? { url: webhookData?.url, headers: webhookData?.headers } : { url: "", headers: {} };
        const type = key === 'custom' ? 'webhook' : key;

        const updatedDataToSend = {
            configuration: {
                response_format: {
                    type,
                    cred
                }
            }
        };

        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...updatedDataToSend } }));
    }

    const responseOptions = [
        { value: 'default', label: 'Default' },
        // { value: 'RTLayer', label: 'RTLayer' },
        { value: 'custom', label: 'Custom' },
    ];

    return (
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
            <div className={`${selectedOption === 'custom' ? "border rounded" : ""}`}>
                <div className={`border-t pt-4 px-4 ${selectedOption === 'custom' ? "" : "hidden"}`}>
                    <label className="form-control w-full mb-4">
                        <span className="label-text block mb-2">Webhook URL</span>
                        <input
                            type="text"
                            placeholder="https://example.com/webhook"
                            className="input input-bordered max-w-xs input-sm w-full"
                            id="webhook"
                            defaultValue={webhookData?.url}
                            onBlur={handleChangeWebhook}
                        />
                        {errors.webhook && <p className="text-red-500 text-xs mt-2">{errors.webhook}</p>}
                    </label>
                    <label className="form-control mb-4">
                        <span className="label-text block mb-2">Headers (JSON format)</span>
                        <textarea
                            className="textarea textarea-bordered h-24 w-full"
                            id="headers"
                            defaultValue={typeof webhookData?.headers === 'object' ? JSON.stringify(webhookData?.headers, null, 2) : webhookData?.headers}
                            onBlur={handleChangeHeaders}
                            placeholder='{"Content-Type": "application/json"}'
                        ></textarea>
                        {errors.headers && <p className="text-red-500 text-xs mt-2">{errors.headers}</p>}
                    </label>
                    <button className="btn btn-primary btn-sm my-2 float-right" onClick={() => handleResponseChange("custom")} disabled={errors.webhook !== '' || errors.headers !== ''}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponseFormatSelector;