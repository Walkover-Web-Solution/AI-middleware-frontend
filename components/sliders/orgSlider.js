import { logoutUserFromMsg91, switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { filterOrganizations, openModal, toggleSidebar } from '@/utils/utility';
import { KeyRoundIcon, LogoutIcon, MailIcon, CloseIcon, SettingsIcon, SettingsAltIcon, BuildingIcon, ChevronDownIcon } from '@/components/Icons';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import CreateOrg from '../createNewOrg';
import { MODAL_TYPE } from '@/utils/enums';

function OrgSlider() {
    const router = useRouter();
    const pathName = usePathname();
    const path = pathName.split('?')[0].split('/');
    const [searchQuery, setSearchQuery] = useState('');
    const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
    const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);

    const filteredOrganizations = filterOrganizations(organizations,searchQuery);

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
            router.push(`/org/${id}/agents`);
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
            className="sidebar-container fixed flex flex-col top-0 left-0 p-4 w-full md:w-1/3 lg:w-1/6 opacity-100 h-screen -translate-x-full py-4 overflow-y-auto bg-base-200 transition-all duration-300 z-high border-r"
            aria-label="Sidebar"
        >
            <div className="flex flex-col gap-4 w-full">
                <div className='flex flex-row justify-between'>
                    <p className='text-xl font-semibold'>Organizations</p>
                    <CloseIcon className="block md:hidden" onClick={handleCloseOrgSlider} />
                </div>
                <input
                    type="text"
                    placeholder="Search org..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-base-300 rounded p-2 w-full"
                />
                <button onClick={()=>openModal(MODAL_TYPE.CREATE_ORG_MODAL)} className="  bg-base-100 border-0 rounded-md box-border text-base-content font-sans text-sm font-semibold  p-3 text-center  cursor-pointer hover:bg-base-200 ">
                    <span className='flex justify-center items-center gap-2 text-base-content font-semibold'>+ Create New Org<BuildingIcon size={16} /></span>
                </button>
                <ul className="menu p-0 w-full text-base-content">
                    {filteredOrganizations.length === 0 ? (
                        <div className='max-w-full'>
                            <p className="py-2 px-2 rounded-md truncate max-w-full">No organizations found</p>
                        </div>
                    ) : (
                        filteredOrganizations.slice() // Create a copy of the array to avoid mutating the original
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically based on title
                            .map((item) => (
                                <li key={item.id}>
                                    <a className={`${item.id == path[2] ? "active" : `${item.id}`} py-2 px-2 rounded-md`}
                                        onClick={() => { handleSwitchOrg(item.id, item.name) }}>
                                        <BuildingIcon size={16} /> {item.name}
                                    </a>
                                </li>
                            ))
                    )}
                </ul>
            </div>
            <div className='mt-auto w-full'>
                <details
                    className="overflow-hidden rounded border border-base-300 [&_summary::-webkit-details-marker]:hidden"
                >
                    <summary
                        className="flex cursor-pointer items-center justify-between gap-2 bg-base-100 p-4 text-base-content transition"
                    >
                        <span className="text-sm font-medium flex justify-center items-center gap-2">
                            <SettingsAltIcon size={16} /> Setting
                        </span>

                        <span className="transition group-open:-rotate-180">
                            <ChevronDownIcon strokeWidth={1.25} />
                        </span>
                    </summary>

                    <div className="border-t border-base-300 bg-base-100">
                        <ul className="menu w-full   text-base-content">
                            <li> <a className='py-2 px-2 rounded-md'> <MailIcon className="h-4 w-4" /> {userdetails.email}</a> </li>
                            <li> <a className={`py-2 px-2  ${path[3] === 'Pauthkey' ? "active" : ""}  rounded-md`} onClick={() => { router.push(`/org/${path[2]}/pauthkey`) }}> <KeyRoundIcon className="h-4 w-4" />Pauth key</a> </li>
                            <li> <a className={`py-2 px-2 rounded-md`} onClick={() => { router.push(`/org/${path[2]}/workspaceSetting`) }}> <SettingsIcon className="h-4 w-4" /> Workspace Setting</a> </li>
                            <li onClick={logoutHandler}><a className='py-2 px-2 rounded-md'> <LogoutIcon className="h-4 w-4" />  logout</a></li>
                        </ul>
                    </div>

                </details>
            </div>
             <CreateOrg handleSwitchOrg={handleSwitchOrg} />
        </aside>
    )
}

export default OrgSlider;