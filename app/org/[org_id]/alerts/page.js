'use client';

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createWebhookAlertAction, deleteWebhookAlertAction, getAllWebhookAlertAction, updateWebhookAlertAction } from '@/store/action/webhookAlertAction';
import { ChevronDown, Info, SquarePen, Trash2 } from 'lucide-react';
import { ALERT_TYPE, MODAL_TYPE, WEBHOOKALERT_COLUMNS } from '@/utils/enums';
import { validateUrl } from '@/utils/utility';

export const runtime = 'edge';

const WebhookPage = ({ params }) => {
    const dispatch = useDispatch();
    const { filteredBridges, webhookAlertData } = useCustomSelector(state => ({
        filteredBridges: state.bridgeReducer.org[params.org_id]?.orgs || [],
        webhookAlertData: state.webhookAlertReducer.webhookAlert || []
    }));
    const formRef = useRef(null);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBridges, setSelectedBridges] = useState([]);
    const [headerValue, setHeaderValue] = useState('');
    const [headerError, setHeaderError] = useState('');
    const [URLError, setURLError] = useState('');
    const [nameError, setNameError] = useState('');
    const [selectedAlertTypes, setSelectedAlertTypes] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        dispatch(getAllWebhookAlertAction(params.org_id));
    }, []);

    const resetForm = () => {
        modalRef.current?.close();
        formRef.current?.reset();
        setSelectedBridges([]);
        setSearchQuery('');
        setHeaderValue('');
        setHeaderError('');
        setSelectedAlertTypes([]);
        setDropdownOpen(false);
        setIsUpdate(false);
    };

    const isValidJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = useCallback(e => {
        e.preventDefault();
        const form = formRef.current;
        if (headerValue && !isValidJSON(headerValue)) {
            setHeaderError('Header must be a valid JSON format.');
            return;
        }
        if (!form.id.value && webhookAlertData.some(alert => alert.name === form.name.value)) {
            setNameError('Name must be Unique');
            return;
        }
        if (!validateUrl(form.url.value)) {
            setURLError('Enter Valid URl');
            return;
        }
        const data = {
            name: form.name.value,
            webhookConfiguration: {
                url: form.url.value,
                headers: headerValue ? JSON.parse(headerValue) : {},
            },
            bridges: selectedBridges,
            alertType: selectedAlertTypes,
            id: isUpdate ? form.id.value : null,
        };

        if (isUpdate) {
            dispatch(updateWebhookAlertAction({ data, id: data.id }));
        } else {
            dispatch(createWebhookAlertAction(data));
        }
        resetForm();
    }, [dispatch, selectedBridges, headerValue, selectedAlertTypes, isUpdate]);

    const handleEdit = (item) => {
        setIsUpdate(true);
        if (formRef.current) {
            formRef.current.name.value = item.name;
            formRef.current.url.value = item.webhookConfiguration.url;
            setHeaderValue(JSON.stringify(item.webhookConfiguration.headers));
            setSelectedAlertTypes(item.alertType || []);
            formRef.current.id.value = item._id;
        }
        const bridgeIds = item.bridges.includes('all') ? filteredBridges.map(b => b._id) : item.bridges;
        setSelectedBridges(bridgeIds);
        modalRef.current?.showModal();
    };

    const handleDeleteClick = (item) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
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

    const handleAlertTypeChange = (alertType) => {
        setSelectedAlertTypes(prevSelected =>
            prevSelected.includes(alertType)
                ? prevSelected.filter(type => type !== alertType)
                : [...prevSelected, alertType]
        );
    };

    const filteredBridgeList = useMemo(() => filteredBridges.filter(bridge =>
        bridge.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [filteredBridges, searchQuery]);

    const truncateText = (text, length) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
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
                                                {item.bridges.includes("all") ? (
                                                    <span className='badge badge-ghost'>All bridges are selected</span>
                                                ) : filteredBridges
                                                    .filter(bridge => item.bridges.includes(bridge._id))
                                                    .slice(0, 2)
                                                    .map(bridge => (
                                                        <div key={bridge._id} className="badge badge-ghost">
                                                            {bridge.name}
                                                        </div>
                                                    ))}
                                                {filteredBridges.filter(bridge => item.bridges.includes(bridge._id)).length > 2 && (
                                                    <div className="badge badge-ghost">
                                                        ... and {filteredBridges.filter(bridge => item.bridges.includes(bridge._id)).length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        ) : column === "alertType" ? (
                                            item[column].join(', ')
                                        ) : (
                                            truncateText(item[column], CHAR_LIMIT)
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
                                No alerts available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderForm = () => (
        <dialog ref={modalRef} id={MODAL_TYPE?.WEBHOOK_MODAL} className='w-[60%] h-[80%] p-6 rounded-lg '>
            <form ref={formRef} onSubmit={handleSubmit} className="">
                <input type="hidden" name="id" />
                <div className="space-y-2">
                    <h3 className="font-semibold">Webhook Configuration</h3>
                    <div>
                        <label className="label">
                            <span className="label-text"> Alert Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="input input-bordered w-full"
                            placeholder="Enter the Alert name"
                            required
                        />
                        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
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
                        {URLError && <p className="text-red-500 text-sm mt-1">{URLError}</p>}
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Header</span>
                        </label>
                        <textarea
                            name="headers"
                            value={headerValue}
                            onChange={e => setHeaderValue(e.target.value)}
                            className="textarea resize-y-auto min-h-28 input input-bordered w-full"
                            placeholder='Enter the header (e.g., {"Authorization": "Bearer token"})'
                        />
                        {headerError && <p className="text-red-500 text-sm mt-1">{headerError}</p>}
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Alert Type</span>
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className="border btn text-center bg-transparent w-full h-auto rounded-md p-3"
                            >
                                {selectedAlertTypes.length > 0
                                    ? `Selected Alert Types: ${selectedAlertTypes.join(', ')}`
                                    : 'Select Alert Types'}
                                <span className='text-end'><ChevronDown height={20} /></span>
                            </button>
                            {dropdownOpen && (
                                <div className="bg-white border rounded-md mt-2 w-full text-left">
                                    <div className="p-2">
                                        {ALERT_TYPE.map(alert => (
                                            <div key={alert} className="flex items-center p-2 hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAlertTypes.includes(alert)}
                                                    onChange={() => handleAlertTypeChange(alert)}
                                                    className="checkbox mr-2"
                                                />
                                                <span>{alert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className={`flex justify-start items-center ${selectedBridges.length === 0 ? 'mb-2' : 'mb-0'}`}>
                            <label className="label">
                                <span className="label-text">Select Bridges For Getting Alert</span>
                            </label>
                            {!isUpdate && selectedBridges.length === 0 && (
                                <div
                                    className="tooltip tooltip-open tooltip-right bg-transparent"
                                    data-tip="If you don't select any bridge, all bridges will be selected"
                                >
                                    <span><Info className='h-4 text-gray-500' /></span>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => dropdownRef.current.classList.toggle('hidden')}
                            className="btn bg-transparent w-full h-auto text-left mb-1 p-2"
                        >
                            {selectedBridges.length > 0 ? `Selected Bridges: ${selectedBridges.length}` : 'Select the bridge'} <span className='text-end'><ChevronDown /></span>
                        </button>
                        <div ref={dropdownRef} className="p-4 w-full border rounded-md">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search Bridges..."
                                className="input input-bordered w-full p-2"
                            />
                            <div className="max-h-60 overflow-y-auto">
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
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={resetForm} className="btn">Cancel</button>
                    <button type="submit" className="btn btn-primary">{isUpdate ? "Update" : "Create"}</button>
                </div>
            </form>
        </dialog>
    );

    return (
        <div className='w-full'>
            {renderForm()}
            {renderTable()}
        </div>
    );
};

export default WebhookPage;
