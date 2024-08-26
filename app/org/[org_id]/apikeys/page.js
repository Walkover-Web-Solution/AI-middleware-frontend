'use client';
import { useCustomSelector } from '@/customSelector/customSelector';
import { deleteApikeyAction, getAllApikeyAction, saveApiKeysAction, updateApikeyAction } from '@/store/action/apiKeyAction';
import { SquarePen, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const Page = () => {
    const pathName = usePathname();
    const dispatch = useDispatch();
    const path = pathName?.split('?')[0].split('/');
    const orgId = path[2] || '';
   
    const apikeyData = useCustomSelector((state) => {
        const apikeys = state?.bridgeReducer?.apikeys || {};
        return apikeys[orgId] || [];
    });

    const [selectedApiKey, setSelectedApiKey] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdateClick = useCallback((item) => {
        setSelectedApiKey(item);
        setIsEditing(true);
        const modal = document.getElementById('my_modal_6');
        if (modal) {
            modal.showModal();
        }
    }, []);

    const deleteApikey = useCallback((item) => {
        if (window.confirm("Are you sure you want to delete this API key?")) {
            dispatch(deleteApikeyAction({org_id: item.org_id, name: item.name, id: item._id }));
        }
    }, [dispatch]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const data = {
            name: formData.get('name').trim(),
            service: formData.get('service'),
            apikey: formData.get('apikey'),
            comment: formData.get('comment'),
            _id: selectedApiKey ? selectedApiKey._id : null
        };

        if (isEditing) {
            const isIdChange = apikeyData.some(item => item._id === data._id);
            const isNameChange = apikeyData.some(item => item.name === data.name);
            const isCommentChange = apikeyData.some(item => item.comment === data.comment);

            if(!isIdChange) {
                const dataToSend = { org_id: orgId, apikey_object_id: data._id, apikey: data.apikey, comment: data.comment };
                dispatch(updateApikeyAction(dataToSend));
            }
            if (!isNameChange || !isCommentChange) {
                const dataToSend = { org_id: orgId, apikey_object_id: data._id, name: data.name, comment: data.comment };
                dispatch(updateApikeyAction(dataToSend));
            }
        } else {
            dispatch(saveApiKeysAction(data));
            dispatch(getAllApikeyAction(orgId));
        }

        event.target.reset();
        setSelectedApiKey(null);
        setIsEditing(false);

        const modal = document.getElementById('my_modal_6');
        if (modal) {
            modal.close();
        }
    }, [dispatch, orgId, isEditing, selectedApiKey, apikeyData]);

    const handleClose = useCallback(() => {
        const modal = document.getElementById('my_modal_6');
        if (modal) {
            modal.close();
        }
        setSelectedApiKey(null);
        setIsEditing(false);
    }, []);
        useEffect(() => {
        dispatch(getAllApikeyAction(orgId));
    }, [dispatch, orgId]);

    const columns = ["name", "apikey", "comment", "service"];

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map(column => (
                            <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {apikeyData.length > 0 ? apikeyData.map((item) => (
                        item ? (
                            <tr key={item._id} className="hover-row hover">
                                {columns.map(column => (
                                    <td key={`${item._id}-${column}`}>
                                        {column === "apikey" ? '************' : item[column]}
                                    </td>
                                ))}
                                <td className="gap-3 flex justify-center items-center">
                                    <div className="tooltip tooltip-primary" data-tip="Update">
                                        <a onClick={() => handleUpdateClick(item)}>
                                            <SquarePen strokeWidth={2} size={20} />
                                        </a>
                                    </div>
                                    <div className="tooltip tooltip-primary" data-tip="Delete">
                                        <a onClick={() => deleteApikey(item)}>
                                            <Trash2 strokeWidth={2} size={20} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ) : null
                    )) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center">No API keys available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
                <form onSubmit={handleSubmit} className="modal-box flex flex-col gap-4">
                    <h3 className="font-bold text-lg">{isEditing ? 'Update API Key' : 'Create New API Key'}</h3>
                    {['name', 'apikey', 'comment'].map((field) => (
                        <label key={field} className="input input-bordered flex justify-evenly items-center gap-5">
                            {field.charAt(0).toUpperCase() + field.slice(1)}:
                            <input
                                type="text"
                                className="grow"
                                name={field}
                                placeholder="Type here"
                                defaultValue={selectedApiKey ? selectedApiKey[field] : ''}
                                required
                            />
                        </label>
                    ))}
                    <label className="dropdown input input-bordered flex items-center gap-2">
                        Service:
                        <select
                            name="service"
                            className="grow"
                            defaultValue={selectedApiKey ? selectedApiKey.service : ''}
                            required
                        >
                            <option value="openai">OpenAI</option>
                            <option value="groq">Groq</option>
                            <option value="anthropic">Anthropic</option>
                        </select>
                    </label>
                    <div className="modal-action">
                        <button type="submit" className="btn">{isEditing ? 'Update' : 'Submit'}</button>
                        <button type="button" className="btn" onClick={handleClose}>Cancel</button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default Page;
