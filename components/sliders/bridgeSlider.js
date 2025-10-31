import { useCustomSelector } from '@/customHooks/customSelector';
import { filterBridges, getIconOfService, openModal, toggleSidebar } from '@/utils/utility';
import { CloseIcon } from '@/components/Icons';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import CreateNewBridge from '../createNewBridge';
import { MODAL_TYPE } from '@/utils/enums';
import SearchItems from '../UI/SearchItems';

function BridgeSlider() {
    const router = useRouter();
    const pathName = usePathname();
    const path = pathName.split('?')[0].split('/')

    const bridgesList = useCustomSelector((state) => state.bridgeReducer.org[path[2]]?.orgs) || [];

  
   const [filteredBridgesList, setFilteredBridgesList] = useState(bridgesList);
    const filteredArchivedBridges = filteredBridgesList?.filter((item) => item.status === 0);
    const filteredUnArchivedBridges = filteredBridgesList?.filter((item) => item.status === 1 || item.status === undefined);

    const handleNavigation = (id, versionId) => {
        router.push(`/org/${path[2]}/agents/configure/${id}?version=${versionId}`);
        toggleSidebar('default-agent-sidebar');
    }

    const handlCloseBridgeSlider = useCallback(() => {
        toggleSidebar('default-agent-sidebar');
    }, [])

    const renderBridges = (bridges, title) => (
        <>
            {bridges.length > 0 && (
                <>
                    {title === "Archived Bridges" && <div className="flex justify-center items-center my-4">
                        <p className="border-t border-base-300 w-full"></p>
                       <p className="bg-black text-base-100 py-1 px-2 rounded-full mx-4 whitespace-nowrap text-xs">
                            {title}
                        </p>
                        <p className="border-t border-base-300 w-full"></p>
                    </div>}
                    <ul className={`menu p-0 w-full truncate text-base-content ${title === "Archived Bridges" ? "opacity-50" : ""}`}>
                        {bridges.slice()
                            .sort((a, b) => a.name?.localeCompare(b.name))
                            .map((item) => (
                                <li key={item._id} className='max-w-full'>
                                    <a
                                        className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md truncate max-w-full`}
                                        onClick={() => handleNavigation(item._id, item?.published_version_id || item?.versions?.[0])}
                                    >
                                        {getIconOfService(item.service, 14, 14)}
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </>
            )}
        </>
    );

    return (
        <aside
            id="default-agent-sidebar"
            className="sidebar-container fixed flex flex-col top-0 left-0 p-4 w-full md:w-1/3 lg:w-1/6 opacity-100 h-screen -translate-x-full py-4 overflow-y-auto bg-base-200 transition-all duration-300 z-high border-r"
            aria-label="Sidebar"
        >
            <div className="flex w-full flex-col gap-4">
                <div className='flex flex-row justify-between'>
                    <p className='text-xl font-semibold'> Agents </p>
                    <CloseIcon className="block md:hidden" onClick={handlCloseBridgeSlider} />
                </div>
               <SearchItems
                    data={bridgesList}
                    setFilterItems={setFilteredBridgesList}
                    item='agents'
                    style='input input-sm input-bordered w-full mb-0 ml-0 border border-base-content/50'
                />
                <button className="btn btn-sm" onClick={() =>{ openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL); toggleSidebar('default-agent-sidebar');}}>
                    + Create New Agent
                </button>
                {filteredBridgesList.length === 0 ? (
                    <div className='max-w-full'>
                        <p className="py-2 px-2 rounded-md truncate max-w-full">No bridges found</p>
                    </div>
                ) : (
                    <>
                        {renderBridges(filteredUnArchivedBridges)}
                        {renderBridges(filteredArchivedBridges, "Archived Bridges")}
                    </>
                )}
            </div>
            <CreateNewBridge orgid={path[2]} Heading="Create New Agent" />
        </aside>
    )
}

export default BridgeSlider