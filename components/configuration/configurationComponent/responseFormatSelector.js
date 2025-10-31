"use client";

import InfoTooltip from '@/components/InfoTooltip';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { isValidJson, validateUrl } from '@/utils/utility';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ResponseFormatSelector = ({ params, searchParams }) => {
    const { response_format } = useCustomSelector((state) => ({
        response_format: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.response_format,
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
        // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...updatedDataToSend } }));
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: searchParams.version, dataToSend: { ...updatedDataToSend } }));
    }

    const responseOptions = [
        { value: 'default', label: 'Default' },
        // { value: 'RTLayer', label: 'RTLayer' },
        { value: 'custom', label: 'Custom' },
    ];

    return (
        <div>
            <label className="label">
                <InfoTooltip tooltipContent="Configure the response format for your API calls">
                  <span className="info label-text">Select Response Format</span>
                </InfoTooltip>
              </label>
            {responseOptions.map(({ value, label }) => (
                <div className="form-control w-fit" key={value}>
                    <label className="label  cursor-pointer mx-w-sm flex items-center gap-5">
                        <input
                            type="radio"
                            name="radio-10"
                            className="radio"
                            checked={selectedOption === value}
                            onChange={() => { setSelectedOption(value); handleResponseChange(value); }}
                        />
                        <span className="text-sm">{label}</span>
                    </label>
                </div>
            ))}
            <div className={`${selectedOption === 'custom' ? "border border-base-300 rounded" : ""}`}>
                <div className={`border-t border-base-300 pt-4 px-4 ${selectedOption === 'custom' ? "" : "hidden"}`}>
                    <label className="form-control w-full mb-4">
                        <span className="text-sm block mb-2">Webhook URL</span>
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
                        <span className="text-sm block mb-2">Headers (JSON format)</span>
                        <textarea
                            className="textarea bg-white dark:bg-black/15 textarea-bordered h-24 w-full"
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