import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlert, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const KnowledgebaseList = ({ params }) => {
    const { knowbaseData } = useCustomSelector((state) => ({
        knowbaseData: state?.knowbaseReducer?.knowbaseData
    }));

    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };

    const handleAddKnowledgebase = (id) => {
        // Add logic to handle adding new knowledgebase item
        console.log('Add new knowledgebase item', id);
    };

    const renderKnowledgebase = useMemo(() => (
        knowbaseData?.map((item) => (
            <div key={item?.id} className="flex w-[250px] flex-col items-start rounded-md border cursor-pointer bg-base-100 hover:bg-base-200">
                <div className="p-4 w-full h-full flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center">
                            <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content">
                                {item?.name}
                            </h1>
                            {!item?.description && <CircleAlert color='red' size={16} />}
                        </div>
                        <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                            {item?.description || "A description is required for proper functionality."}
                        </p>
                    </div>
                    <div className="mt-4">
                        <span className="mr-2 inline-block rounded-full capitalize px-3 bg-base-200 py-1 text-[10px] sm:text-xs font-semibold text-base-content">
                            {!item?.description ? "Description Required" : item?.status || "Active"}
                        </span>
                    </div>
                </div>
            </div>
        ))
    ), [knowbaseData]);

    return (
        <div className="label flex-col items-start p-0">
            <div className="flex flex-wrap gap-4 mb-4">
                {renderKnowledgebase}
            </div>
            <div className="dropdown dropdown-right">
                <button tabIndex={0} className="btn btn-outline btn-sm mt-0">
                    <Plus size={16} />Add Knowledgebase
                </button>
                <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-[9999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                    <div className='flex flex-col gap-2 w-full'>
                        <li className="text-sm font-semibold disabled">Suggested Knowledgebases</li>
                        <input
                            type='text'
                            placeholder='Search Knowledgebase'
                            value={searchQuery}
                            onChange={handleInputChange}
                            className='input input-bordered w-full input-sm'
                        />
                        {knowbaseData
                            ?.filter(item => item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
                            ?.map(item => (
                                <li key={item?.id} onClick={() => handleAddKnowledgebase(item?.id)}>
                                    <div className="flex justify-between items-center w-full">
                                        <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                            {item?.name}
                                        </p>
                                    </div>
                                </li>
                            ))
                        }
                        <li className="mt-2 border-t w-full sticky bottom-0 bg-white py-2" onClick={() => handleAddKnowledgebase()}>
                            <div>
                                <Plus size={16} /><p className='font-semibold'>Add new Knowledgebase</p>
                            </div>
                        </li>
                    </div>
                </ul>
            </div>
            
        </div>
    );
};

export default KnowledgebaseList;
