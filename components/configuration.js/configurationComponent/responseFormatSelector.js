"use client";

import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { isValidJson, validateWebhook } from '@/utils/utility';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ResponseFormatSelector = ({ params, dataToSend }) => {
    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const [selectedOption, setSelectedOption] = useState('default');
    const [webhook, setWebhook] = useState("");
    const [headers, setHeaders] = useState("");
    const [errors, setErrors] = useState({ webhook: "", headers: "" });
    const dispatch = useDispatch();

    useEffect(() => {
        if (bridge?.responseFormat) {
            if (bridge.responseFormat.RTLayer === true) {
                setSelectedOption('RTLayer');
            } else if (bridge.responseFormat.webhook) {
                setSelectedOption('custom');
            }
        }
    }, [bridge]);

    useEffect(() => {
        setWebhook(bridge?.responseFormat?.webhook || "");
        setHeaders(bridge?.responseFormat?.headers || "");
    }, [bridge, params]);

    const handleChangeWebhook = (value) => {
        if (value.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, webhook: '' }));
            return;
        }
        const isValid = validateWebhook(value);
        setErrors(prevErrors => ({ ...prevErrors, webhook: isValid ? '' : 'Invalid URL' }));
    };

    const handleChangeHeaders = (value) => {
        if (value.trim() === "") {
            setErrors(prevErrors => ({ ...prevErrors, headers: '' }));
            return;
        }
        const isValid = isValidJson(value);
        setErrors(prevErrors => ({ ...prevErrors, headers: isValid ? '' : 'Invalid JSON' }));
    };

    const handleResponseChange = (key, webhook, headers) => {
        let updatedDataToSend = { ...dataToSend };
        if (key === "default") {
            updatedDataToSend.configuration = {
                ...updatedDataToSend.configuration,
                RTLayer: false,
                webhook: "", // Set webhook to an empty string for default option
                headers: {}
            };
        } else if (key === 'RTLayer') {
            updatedDataToSend.configuration = {
                ...updatedDataToSend.configuration,
                RTLayer: true,
                webhook: "", // Set webhook to an empty string for RTLayer option
                headers: {}
            };
        } else if (key === 'custom') {
            updatedDataToSend.configuration = {
                ...updatedDataToSend.configuration,
                RTLayer: false,
                webhook: webhook, // Set webhook to the valid input
                headers: headers // Set headers to the parsed JSON
            };
        }
        UpdateBridge(updatedDataToSend);
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    };

    const responseOptions = [
        { value: 'default', label: 'Default' },
        { value: 'RTLayer', label: 'RTLayer' },
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
                            onChange={() => { setSelectedOption(value); handleResponseChange(value, webhook, headers); }}
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
                    <button className="btn btn-primary btn-sm my-2 float-right" onClick={() => handleResponseChange("custom", webhook, headers)} disabled={errors.webhook !== '' || errors.headers !== ''}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponseFormatSelector;
