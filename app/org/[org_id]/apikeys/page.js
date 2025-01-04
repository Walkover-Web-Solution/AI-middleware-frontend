'use client';
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteApikeyAction, getAllApikeyAction, saveApiKeysAction, updateApikeyAction } from '@/store/action/apiKeyAction';
import { API_KEY_COLUMNS, API_KEY_MODAL_INPUT, MODAL_TYPE } from '@/utils/enums';
import { closeModal, getIconOfService, openModal } from '@/utils/utility';
import { SquarePen, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const runtime = 'edge';

const Page = () => {
    const pathName = usePathname();
    const dispatch = useDispatch();
    const path = pathName?.split('?')[0].split('/');
    const orgId = path[2] || '';

    const { apikeyData } = useCustomSelector((state) => ({
        apikeyData: state?.bridgeReducer?.apikeys[orgId] || []
    }));

    useEffect(() => {
        if (orgId) {
            dispatch(getAllApikeyAction(orgId));
        }
    }, []);

    const [selectedApiKey, setSelectedApiKey] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdateClick = useCallback((item) => {
        setSelectedApiKey(item);
        setIsEditing(true);
        openModal(MODAL_TYPE.API_KEY_MODAL)
    }, [MODAL_TYPE,openModal]);

    const deleteApikey = useCallback((item) => {
        if (window.confirm("Are you sure you want to delete this API key?")) {
            dispatch(deleteApikeyAction({ org_id: item.org_id, name: item.name, id: item._id }));
        }
    }, [dispatch]);



    const columns = API_KEY_COLUMNS || [];
    return (
        <div className='w-full'>
            <table className="table">
                <thead>
                    <tr>
                        {columns?.map(column => (
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
                                        {column === "apikey" ? '************' : (column === "service" && item.service ? <div className="badge badge-ghost p-3">{getIconOfService(item[column], 18, 18)}<span className='capitalize ml-2'>{item[column]}</span></div> : item[column])}
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
            <ApiKeyModal orgId={orgId}  isEditing={isEditing} selectedApiKey={selectedApiKey} setSelectedApiKey={setSelectedApiKey} setIsEditing={setIsEditing} />
        </div>
    );
};

export default Page;
