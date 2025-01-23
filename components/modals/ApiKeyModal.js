import { saveApiKeysAction, updateApikeyAction } from '@/store/action/apiKeyAction';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { API_KEY_MODAL_INPUT, MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { usePathname } from 'next/navigation';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyModal = ({ params, isEditing, selectedApiKey, setSelectedApiKey = () => { }, setIsEditing = () => { }, apikeyData, service, bridgeApikey_object_id }) => {
    const pathName = usePathname();
    const path = pathName?.split('?')[0].split('/');
    const orgId = path[2] || '';
    const dispatch = useDispatch();
    const handleClose = useCallback(() => {
        closeModal(MODAL_TYPE.API_KEY_MODAL)
        setSelectedApiKey(null);
        setIsEditing(false);
    }, [setSelectedApiKey, setIsEditing]);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const data = {
            name: formData.get('name').trim().replace(/\s+/g, ''),
            service: service || formData.get('service'),
            apikey: formData.get('apikey'),
            comment: formData.get('comment'),
            _id: selectedApiKey ? selectedApiKey._id : null
        };

        if (isEditing) {
            const isIdChange = apikeyData.some(item => item.apikey === data.apikey);
            const isNameChange = apikeyData.some(item => item.name === data.name);
            const isCommentChange = apikeyData.some(item => item.comment === data.comment);

            if (!isIdChange) {
                const dataToSend = { org_id: orgId, apikey_object_id: data._id, name: data.name, apikey: data.apikey, comment: data.comment };
                dispatch(updateApikeyAction(dataToSend));
            }
            if (!isNameChange || !isCommentChange) {
                const dataToSend = { org_id: orgId, apikey_object_id: data._id, name: data.name, comment: data.comment };
                dispatch(updateApikeyAction(dataToSend));
            }
        } else {
            const response = await dispatch(saveApiKeysAction(data, orgId));
            console.log(response);

            if (service && response?._id) {
                const updated = { ...bridgeApikey_object_id, [service]: response._id };
                dispatch(updateBridgeVersionAction({
                    bridgeId: params?.id,
                    versionId: params?.version,
                    dataToSend: { apikey_object_id: updated }
                }));
            }
        }

        event.target.reset();
        setSelectedApiKey(null);
        setIsEditing(false);
        closeModal(MODAL_TYPE.API_KEY_MODAL)
    }, [isEditing, selectedApiKey, service]);

    return (
        <dialog id={MODAL_TYPE?.API_KEY_MODAL} className="modal modal-bottom sm:modal-middle">
            <form onSubmit={handleSubmit} className="modal-box flex flex-col gap-4">
                <h3 className="font-bold text-lg">
                    {isEditing ? 'Update API Key' : 'Add New API Key'}
                </h3>
                {API_KEY_MODAL_INPUT.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                        <label htmlFor={field} className="label-text">
                            {field.charAt(0).toUpperCase() + field.slice(1)}:
                        </label>
                        <input
                            id={field}
                            type={field === 'apikey' && isEditing ? 'password' : 'text'}
                            className="input input-bordered"
                            name={field}
                            placeholder={`Enter ${field}`}
                            defaultValue={selectedApiKey ? selectedApiKey[field] : ''}
                            required={field !== 'comment'}
                        />
                    </div>
                ))}
                <div className="flex flex-col gap-2">
                    <label htmlFor="service" className="label-text">
                        Service:
                    </label>
                    <select
                        id="service"
                        name="service"
                        className="select select-bordered"
                        key={selectedApiKey?.service || service}
                        defaultValue={service || (selectedApiKey ? selectedApiKey.service : '')}
                        disabled={service || (selectedApiKey && selectedApiKey.service)}
                        required
                    >
                        <option value="openai">OpenAI</option>
                        <option value="groq">Groq</option>
                        <option value="anthropic">Anthropic</option>
                    </select>
                </div>
                <div className="modal-action">
                    <button type="button" className="btn" onClick={handleClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                </div>
            </form>
        </dialog>
    )
}

export default ApiKeyModal