'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customSelector/customSelector';
import { createWebhookAlertAction, deleteWebhookAlertAction, getAllWebhookAlertAction, updateWebhookAlertAction } from '@/store/action/webhookAlertAction';
import { SquarePen, Trash2 } from 'lucide-react';
import { ALERT_TYPE, WEBHOOKALERT_COLUMNS } from '@/utils/enums';

export const runtime = 'edge';

const WebhookPage = ({ params }) => {
    const dispatch = useDispatch();
    const { filteredBridges, webhookAlertData } = useCustomSelector((state) => ({
        filteredBridges: state.bridgeReducer.org[params.org_id].orgs || [],
        webhookAlertData: state.webhookAlertReducer.webhookAlert || []
    }));

    const formRef = useRef(null);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBridges, setSelectedBridges] = useState([]);
    const [headerValue, setHeaderValue] = useState('');
    const [headerError, setHeaderError] = useState('');
    const [alertType, setAlertType] = useState('');
    const [isUpdate,setIsUpdate] = useState(false);

    useEffect(() => {
        dispatch(getAllWebhookAlertAction(params.org_id));
    }, []);

    const resetForm = () => {
        if (modalRef.current) modalRef.current.close();
        if (formRef.current) formRef.current.reset();
        setSelectedBridges([]);
        setSearchQuery('');
        setHeaderValue('');
        setHeaderError('');
        setAlertType('');
        setIsUpdate(false)
    };

    const isValidJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        if (headerValue && !isValidJSON(headerValue)) {
            setHeaderError('Header must be a valid JSON format.');
            return;
        }
        const form = formRef.current;
        const data = {
            name: form.name.value,
            webhookConfiguration: {
                url: form.url.value,
                headers: headerValue ? JSON.parse(headerValue) : "",
            },
            bridges: selectedBridges,
            alertType: form.alertType.value, 
            id: isUpdate? form.id.value : null,
        };

        if (isUpdate) {
            dispatch(updateWebhookAlertAction({ data, id: data.id }));
        } else {
            dispatch(createWebhookAlertAction(data));
        }
        form.id.value= "";
        formRef.current.id.value = null;
        resetForm();
    }, [dispatch, selectedBridges, headerValue, alertType]);

    const handleEdit = (item) => {
      setIsUpdate(true);
        if (formRef.current) {
            formRef.current.name.value = item.name;
            formRef.current.url.value = item.webhookConfiguration.url;
            setHeaderValue(JSON.stringify(item.webhookConfiguration.headers));
            setAlertType(item.alertType || ''); // Set the alert type
            formRef.current.id.value = item._id;
        }

        setSelectedBridges(item.bridges);

        if (modalRef.current) modalRef.current.showModal();
    };

    const handleDeleteClick = (item) => {
        if (window.confirm('Are you sure you want to delete this webhook alert?')) {
            dispatch(deleteWebhookAlertAction(item._id));
        }
    };

    const handleCheckboxChange = (bridgeId) => {
        setSelectedBridges(prevSelected =>
            prevSelected.includes(bridgeId)
                ? prevSelected.filter(id => id !== bridgeId)
                : [...prevSelected, bridgeId]
        );
    };

    const filteredBridgeList = filteredBridges?.filter(bridge =>
        bridge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const truncateText = (text, length) => {
        if (text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    };

    const CHAR_LIMIT = 30;

    const renderTable = () => (
        <div className="w-full">
            <table className="table">
                <thead>
                    <tr>
                        {WEBHOOKALERT_COLUMNS.map(column => (
                            <th key={column}>
                                {column.replace(/_/g, ' ').toUpperCase()}
                            </th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {webhookAlertData.length ? (
                        webhookAlertData.map(item => (
                            <tr key={item._id}>
                                {WEBHOOKALERT_COLUMNS.map(column => (
                                    <td key={`${item._id}-${column}`}>
                                        {column === 'url' || column === 'headers' ? (
                                            truncateText(JSON.stringify(item.webhookConfiguration[column]), CHAR_LIMIT)
                                        ) : column === 'bridges' ? (
                                            <div className="space-x-1 space-y-1">
                                                {filteredBridges
                                                    .filter(bridge => item.bridges.includes(bridge._id))
                                                    .slice(0, 2)
                                                    .map(bridge => (
                                                        <div key={bridge._id} className="badge badge-ghost">
                                                            {bridge.name}
                                                        </div>
                                                    ))
                                                }
                                                {filteredBridges.filter(bridge => item.bridges.includes(bridge._id)).length > 2 && (
                                                    <div className="badge badge-ghost">
                                                        ... and {filteredBridges.filter(bridge => item.bridges.includes(bridge._id)).length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            column === "alert type"?item[column]:truncateText(item[column], CHAR_LIMIT)
                                        )}
                                    </td>
                                ))}
                                <td className="gap-3 flex justify-center items-center">
                                    <div className="tooltip tooltip-primary" data-tip="Update">
                                        <a onClick={() => handleEdit(item)}>
                                            <SquarePen strokeWidth={2} size={20} />
                                        </a>
                                    </div>
                                    <div className="tooltip tooltip-primary" data-tip="Delete">
                                        <a onClick={() => handleDeleteClick(item)}>
                                            <Trash2 strokeWidth={2} size={20} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={WEBHOOKALERT_COLUMNS.length + 1} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                No webhook alerts available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderForm = () => (
        <dialog id="my_modal_7" ref={modalRef} className='w-[60%] h-[80%] p-6 rounded-lg'>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="id" />
                <div className="space-y-4">
                    <h3 className="font-semibold">Webhook Configuration</h3>
                    <div>
                        <label className="label">
                            <span className="label-text">Webhook Alert Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="input input-bordered w-full"
                            placeholder="Enter the Webhook Alert name"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">URL</span>
                        </label>
                        <input
                            type="text"
                            name="url"
                            className="input input-bordered w-full"
                            placeholder="https://example.com/webhook"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Header</span>
                        </label>
                        <textarea
                            name="headers"
                            value={headerValue}
                            onChange={(e) => setHeaderValue(e.target.value)}
                            className="textarea resize-y-auto min-h-28 input input-bordered w-full"
                            placeholder='Enter the header (e.g., {"Authorization": "Bearer token"})'
                        />
                        {headerError && <p className="text-red-500 text-sm mt-1">{headerError}</p>}
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Alert Type</span>
                        </label>
                        <select
                            name="alertType"
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value)}
                            className="select select-bordered w-full"
                            required
                        >
                            {ALERT_TYPE.map((alert) => (
                                <option key={alert} value={alert}>
                                    {alert}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <label className="label">
                            <span className="label-text">Select Bridges For Getting Alert</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => dropdownRef.current.classList.toggle('hidden')}
                            className="btn bg-transparent w-full h-auto text-left mb-1 p-2"
                        >
                            {selectedBridges.length > 0 ? `Selected Bridges: ${selectedBridges.length}` : 'No Bridges Selected'}
                        </button>
                        <div ref={dropdownRef} className="p-4 w-full border rounded-md">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Bridges..."
                                 className="input input-bordered w-full p-2"
                            />
                            <div className="max-h-60 overflow-y-auto ">
                                {filteredBridgeList.map(bridge => (
                                    <div key={bridge._id} className="flex items-center p-2 hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectedBridges.includes(bridge._id)}
                                            onChange={() => handleCheckboxChange(bridge._id)}
                                            className="checkbox mr-2"
                                        />
                                        <span>{bridge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={resetForm} className="btn">Cancel</button>
                    <button type="submit" className="btn">{isUpdate?"Update":"Create"}</button>
                </div>
            </form>
        </dialog>
    );

    return (
        <div >
            {renderForm()}
            {renderTable()}
        </div>
    );
};

export default WebhookPage;
