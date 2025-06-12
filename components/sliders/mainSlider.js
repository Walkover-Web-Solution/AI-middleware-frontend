import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { closeModal, openModal, toggleSidebar } from '@/utils/utility';
import { AlignJustify, BookText, Bot, Building2, ChevronDown, Cog, Key, KeyRound, LineChart, LogOut, Mail, MessageSquareMore, PlugZap, Settings2, TriangleAlert, UserPlus, BookCheck, MonitorPlay } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import TutorialModal from '@/components/modals/tutorialModal';
import { MODAL_TYPE } from '@/utils/enums';

function MainSlider() {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams()
  const path = pathName.split('?')[0].split('/')
  const { userdetails, organizations } = useCustomSelector((state) => ({
    userdetails: state?.userDetailsReducer?.userDetails,
    organizations: state.userDetailsReducer.organizations,
  }));

  const Icons = {
    org: <Building2 />,
    agents: <PlugZap />,
    chatbot: <Bot />,
    pauthkey: <KeyRound />,
    apikeys: <Key />,
    alerts: <TriangleAlert />,
    invite: <UserPlus />,
    metrics: <LineChart />,
    knowledge_base: <BookText />
  }
 const handleOpenModal=()=>{
      openModal(MODAL_TYPE.TUTORIAL_MODAL)
 }
 const handleCloseModal=()=>[
        closeModal(MODAL_TYPE.TUTORIAL_MODAL)
 ]
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
  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleMainSidebar = () => toggleSidebar("main-sidebar");

  // Fixed handler for switch organization
  const handleSwitchOrganization = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Close the drawer first
    const drawer = document.getElementById("my-drawer-2");
    if (drawer) {
      drawer.checked = false;
    }

    // Small delay to ensure drawer closes properly before toggling org sidebar
    setTimeout(() => {
      toggleOrgSidebar();
    }, 100);

    // Remove focus to prevent focus issues
    e.target.blur();
  };

  return (
    <>
      <div className="relative">
        <label htmlFor="my-drawer-2" className="drawer-button lg:hidden z-0 absolute top-3 left-1">
          <AlignJustify size={24} onClick={toggleMainSidebar} />
        </label>
        <div className={`drawer lg:drawer-open relative z-[101] lg:z-0`}>
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col"></div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <div className="flex flex-col h-screen w-72 bg-base-100 border-r py-4">
              <div className="flex-grow overflow-y-auto px-4">
                <div className='mb-4 flex-col gap-2'>
                  <h2 className="text-xl font-bold text-start">
                    {organizations[path[2]]?.name.length > 15
                      ? organizations[path[2]]?.name.substring(0, 15) + '...'
                      : organizations[path[2]]?.name}
                  </h2>
                  <button
                    type="button"
                    onClick={handleSwitchOrganization}
                    className="text-sm text-blue-500 hover:underline z-[102] bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                  >
                    Switch Organization
                  </button>
                </div>
                <ul className="menu space-y-2 p-0">
                  {
                    ['agents', 'pauthkey', 'apikeys', 'alerts', 'knowledge_base', 'invite', 'metrics'].map((item) => (
                      <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)} className="transition-transform transform hover:scale-105 flex items-center">
                        <a className={` w-full font-medium ${path[3] === item ? "active text-primary" : "text-gray-700"} `}>
                          {Icons[item]}
                          {item === 'knowledge_base' ? 'Knowledge base' : item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
              <div className='mt-auto'>
                <div className="mt-4 rounded-lg border-t border-base-300 bg-base-100">
                  <div className="pb-2 pl-4 pt-4 h-10 flex text-center items-center gap-2 cursor-pointer" onClick={handleOpenModal}>
                    <MonitorPlay size={16} />
                    Tutorial
                  </div>
                </div>
                <a
                  href="https://gtwy.featurebase.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium "
                >
                  <div className="mt-4 rounded-lg border-t border-base-300 bg-base-100">
                    <div className="p-4 flex items-center gap-2">
                      <MessageSquareMore size={16} />
                      Feedback
                    </div>
                  </div>
                </a>
                <details
                  className="overflow-hidden rounded-lg border-t border-gray-300 [&_summary::-webkit-details-marker]:hidden"
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
                    <ul className="menu w-full text-base-content">
                      <li> <a className='py-2 px-2 rounded-md'> <Mail size={16} /> {userdetails.email}</a> </li>
                      <li> <a className={`py-2 px-2 rounded-md`} onClick={() => { router.push(`/org/${path[2]}/userDetails`) }}> <Cog size={16} />Update User Details</a> </li>
                      <li> <a className={`py-2 px-2 rounded-md`} onClick={() => { router.push(`/org/${path[2]}/workspaceSetting`) }}> <Cog size={16} /> Workspace Setting</a> </li>
                      <li ><a className='py-2 px-2 rounded-md' onClick={logoutHandler}> <LogOut size={16} />  logout</a></li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
       <TutorialModal handleCloseModal={handleCloseModal}/>
    </>
  );
}

export default MainSlider;
