import { useCustomSelector } from '@/customHooks/customSelector';
import { saveApiKeysAction, updateApikeyAction } from '@/store/action/apiKeyAction';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { API_KEY_MODAL_INPUT, MODAL_TYPE } from '@/utils/enums';
import { closeModal, RequiredItem } from '@/utils/utility';
import { usePathname } from 'next/navigation';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../UI/Modal';

const ApiKeyModal = ({ params, isEditing, selectedApiKey, setSelectedApiKey = () => { }, setIsEditing = () => { }, apikeyData, service, bridgeApikey_object_id }) => {
    const pathName = usePathname();
    const path = pathName?.split('?')[0].split('/');
    const orgId = path[2] || '';
    const dispatch = useDispatch();
    const { SERVICES } = useCustomSelector((state) => ({ SERVICES: state?.serviceReducer?.services }));
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
            service: service === 'openai_response' ? 'openai' : service || formData.get('service'),
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
        <Modal MODAL_ID={MODAL_TYPE?.API_KEY_MODAL}>
            <form onSubmit={handleSubmit} className="modal-box flex flex-col gap-4">
                <h3 className="font-bold text-lg">
                    {isEditing ? 'Update API Key' : 'Add New API Key'}
                </h3>
                {API_KEY_MODAL_INPUT.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                        <label htmlFor={field} className="label-text">
                            {field.charAt(0).toUpperCase() + field.slice(1)}{field !=="comment" && RequiredItem()}
                        </label>
                        <input
                            id={field}
                            required = {field !== "comment"}
                            type={field === 'apikey' && isEditing ? 'password' : 'text'}
                            className="input input-bordered"
                            name={field}
                            placeholder={`Enter ${field}`}
                            defaultValue={selectedApiKey ? selectedApiKey[field] : ''}
                            readOnly={field === 'apikey' && isEditing}
                        />
                    </div>
                ))}
                <div className="flex flex-col gap-2">
                    <label htmlFor="service" className="label-text">
                        Service{RequiredItem()}
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
                        {Array.isArray(SERVICES) ? SERVICES.map(({ value, displayName }) => (
                            <option key={value} value={value}>{displayName}</option>
                        )) : null}
                    </select>
                </div>
                <div className="modal-action">
                    <button type="reset" className="btn" onClick={handleClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Add'}</button>
                </div>
            </form>
        </Modal>
    )
}

export default ApiKeyModal