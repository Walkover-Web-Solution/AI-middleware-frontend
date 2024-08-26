import { useCustomSelector } from '@/customSelector/customSelector';
import { getIconOfService, toggleSidebar } from '@/utils/utility';
import { X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import CreateNewBridge from '../createNewBridge';

function BridgeSlider() {
    const router = useRouter();
    const pathName = usePathname();
    const path = pathName.split('?')[0].split('/')
    const [bridgeSearchQuery, setBridgeSearchQuery] = useState('');

    const bridgesList = useCustomSelector((state) => state.bridgeReducer.org[path[2]]) || [];

    const handleBridgeSearchChange = (e) => {
        setBridgeSearchQuery(e.target.value);
    };

    // Filtered bridge list based on search query
    const filteredBridgesList = bridgesList.filter(
        (item) => item.name.toLowerCase().includes(bridgeSearchQuery.toLowerCase())
    );

    const handleNavigation = (id) => {
        router.push(`/org/${path[2]}/bridges/configure/${id}`);
        toggleSidebar('default-bridge-sidebar');
    }

    const handlCloseBridgeSlider = useCallback(() => {
        toggleSidebar('default-bridge-sidebar');
    },[])

    return (
        <aside
            id="default-bridge-sidebar"
            className="sidebar-container fixed flex flex-col top-0 left-0 p-4 w-full md:w-1/3 lg:w-1/6 opacity-100 h-screen -translate-x-full py-4 overflow-y-auto bg-base-200 transition-all duration-300 z-50 border-r"
            aria-label="Sidebar"
        >
            <div className="flex w-full flex-col gap-4">
                <div className='flex flex-row justify-between'>
                    <p className='text-xl font-semibold'> Bridges </p>
                    <X className="block md:hidden" onClick={handlCloseBridgeSlider}/>
                </div>
                {/* Input field for bridge search */}
                <input
                    type="text"
                    placeholder="Search..."
                    value={bridgeSearchQuery}
                    onChange={handleBridgeSearchChange}
                    className="border border-gray-300 rounded p-2 w-full"
                />
                {/* Render filtered bridge list */}
                <ul className="menu p-0 w-full truncate text-base-content">
                    {filteredBridgesList.slice() // Create a copy of the array to avoid mutating the original
                        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically based on title
                        .map((item) => (
                            <li key={item._id} className='max-w-full'>
                                <a
                                    className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md truncate max-w-full`}
                                    onClick={() => handleNavigation(item._id)}
                                >
                                    {getIconOfService(item.service)}
                                    {item.name}
                                </a>
                            </li>
                        ))}
                </ul>
            </div>

            <CreateNewBridge orgid={path[2]} Heading="Create New Bridge" />
        </aside>
    )
}

export default BridgeSlider