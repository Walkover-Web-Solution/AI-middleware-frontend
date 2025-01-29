import { batchApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { webhookURLForBatchAPIReducer } from '@/store/reducer/bridgeReducer';
import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const WebhookForm = ({ params }) => {
    const { reduxWebhookUrl } = useCustomSelector((state) => ({
        reduxWebhookUrl: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.[params.version]?.webhookUrl,
    }));
    const dispatch = useDispatch();
    const [webhookUrl, setWebhookUrl] = useState(reduxWebhookUrl);
    const [headers, setHeaders] = useState('');
    const [messages, setMessages] = useState(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [isValidJson, setIsValidJson] = useState(true);

    const handleHeadersChange = (e) => {
        const value = e.target.value;
        setHeaders(value);
        try {
            JSON.parse(value);
            setIsValidJson(true);
        } catch {
            setIsValidJson(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidJson) {
            toast.error('Headers must be valid JSON');
            return;
        }
        setIsSubmitting(true);

        const payload = {
            webhookUrl,
            headers: headers ? JSON.parse(headers) : {},
            batch: messages,
            bridge_id: params.id,
            version_id: params.version
        };

        const data = await batchApi({ payload });
        dispatch(webhookURLForBatchAPIReducer(payload));
        if (data) {
            setResponseData(data?.response);
            toast.success(data?.response);
        } else {
            setResponseData(data?.error);
            toast.error(data?.error);
        }

        setIsSubmitting(false);
    };

    const isFormValid = webhookUrl && headers && messages.length > 0 && isValidJson;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow-lg">
            <div className="form-control mb-4">
                <label htmlFor="webhookUrl" className="label">
                    <span className="label-text text-lg font-semibold">Webhook URL</span>
                </label>
                <input
                    type="url"
                    id="webhookUrl"
                    value={webhookUrl}
                    placeholder="Enter Webhook URL"
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    required
                    className="input input-bordered w-full"
                />
            </div>

            <div className="form-control mb-4">
                <label htmlFor="headers" className="label">
                    <span className="label-text text-lg font-semibold">Headers (JSON)</span>
                </label>
                <textarea
                    id="headers"
                    value={headers}
                    onChange={handleHeadersChange}
                    placeholder='Example: { "Authorization": "Bearer token" }'
                    className={`textarea textarea-bordered w-full ${!isValidJson ? 'border-red-500' : ''}`}
                    rows={4}
                />
                {!isValidJson && <span className="text-error mt-2">Invalid Header format</span>}
            </div>

            <hr className="my-4 border-t border-gray-300" />

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text text-lg font-semibold">Messages</span>
                </label>
                <textarea
                    onBlur={(e) => setMessages(e.target.value.split(',').filter(msg => msg !== ''))}
                    placeholder="Enter messages separated by commas"
                    className="textarea textarea-bordered w-full min-h-80"
                    rows={4}
                />
            </div>

            {responseData && (
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text text-lg font-semibold">Response Data</span>
                    </label>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(responseData, null, 2)}</pre>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`btn ${!isFormValid || isSubmitting ? 'btn-disabled' : 'btn-primary'}`}
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </div>
        </form>
    );
};

export default WebhookForm;