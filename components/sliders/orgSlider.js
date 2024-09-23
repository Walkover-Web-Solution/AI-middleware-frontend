import { logoutUserFromMsg91, switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { toggleSidebar } from '@/utils/utility';
import { Building2, ChevronDown, KeyRound, LogOut, Mail, Settings2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

function OrgSlider() {
    const router = useRouter();
    const pathName = usePathname();
    const path = pathName.split('?')[0].split('/');
    const [searchQuery, setSearchQuery] = useState('');
    const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
    const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);

    const filteredOrganizations = Object.values(organizations).filter(
        (item) => item.name.toLowerCase()?.includes(searchQuery.toLowerCase())
    );

    const logoutHandler = async () => {
        try {
            await logoutUserFromMsg91({
                headers: {
                    proxy_auth_token: localStorage.getItem('proxy_token'),
                },
            });
            localStorage.clear();
            sessionStorage.clear();
            router.replace('/');
        } catch (e) {
            console.error(e);
        }
    };

    const handleSwitchOrg = async (id, name) => {
        try {
            const response = await switchOrg(id);
            if (process.env.NEXT_PUBLIC_ENV === 'local') {
                const localToken = await switchUser({
                    orgId: id,
                    orgName: name
                })
                localStorage.setItem('local_token', localToken.token);
            }
            router.push(`/org/${id}/bridges`);
            dispatch(setCurrentOrgIdAction(id));
            if (response.status !== 200) {
                console.error('Failed to switch organization', response.data);
            }
        } catch (error) {
            console.error('Error switching organization', error);
        }
    };

    const handleCloseOrgSlider = useCallback(() => {
        toggleSidebar('default-org-sidebar');
    }, [])

    return (
        <aside
            id="default-org-sidebar"
            className="sidebar-container fixed flex flex-col top-0 left-0 p-4 w-full md:w-1/3 lg:w-1/6 opacity-100 h-screen -translate-x-full py-4 overflow-y-auto bg-base-200 transition-all duration-300 z-50 border-r"
            aria-label="Sidebar"
        >
            <div className="flex flex-col gap-4 w-full">
                <div className='flex flex-row justify-between'>
                    <p className='text-xl font-semibold'>Organizations</p>
                    <X className="block md:hidden" onClick={handleCloseOrgSlider} />
                </div>
                <input
                    type="text"
                    placeholder="Search org..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full"
                />
                <ul className="menu p-0 w-full   text-base-content">
                    {filteredOrganizations.slice() // Create a copy of the array to avoid mutating the original
                        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically based on title
                        .map((item) => (
                            <li key={item.id}><a className={`${item.id == path[2] ? "active" : `${item.id}`} py-2 px-2 rounded-md`} key={item.id}
                                onClick={() => { handleSwitchOrg(item.id, item.name) }} >
                                <Building2 size={16} /> {item.name}</a>
                            </li>
                        ))}
                </ul>
            </div>
            <div className='mt-auto w-full'>
                <details
                    className="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden"
                >
                    <summary
                        className="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition"
                    >
                        <span className="text-sm font-medium flex justify-center items-center gap-2"> <Settings2 size={16} /> Setting </span>

                        <span className="transition group-open:-rotate-180">
                            <ChevronDown strokeWidth={1.25} />
                        </span>
                    </summary>

                    <div className="border-t border-gray-200 bg-white">
                        <ul className="menu w-full   text-base-content">
                            <li> <a className='py-2 px-2 rounded-md'> <Mail size={16} /> {userdetails.email}</a> </li>
                            <li> <a className={`py-2 px-2  ${path[3] === 'Pauthkey' ? "active" : ""}  rounded-md`} onClick={() => { router.push(`/org/${path[2]}/pauthkey`) }}> <KeyRound size={16} />Pauth key</a> </li>
                            <li onClick={logoutHandler}><a className='py-2 px-2 rounded-md'> <LogOut size={16} />  logout</a></li>
                        </ul>
                    </div>

                </details>
            </div>
        </aside>
    )
}

export default OrgSlider;