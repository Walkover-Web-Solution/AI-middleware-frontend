import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import {  MODAL_TYPE } from '@/utils/enums';
import { openModal, toggleSidebar } from '@/utils/utility';
import { AlignJustify, BookText, Bot, Building2, ChevronDown, Cog, Key, KeyRound, LineChart, LogOut, Mail, MessageCircleMore, MessageSquareMore, PlugZap, Settings2, TriangleAlert, UserPlus, BookCheck, MonitorPlay } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';

function MainSlider() {
  const pathName = usePathname();
  const router = useRouter();
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
 const handleOpenModal = (modelName) => {
       if(modelName=='speakToUs'){
          openModal(MODAL_TYPE.DEMO_MODAL)
       }
       else {
        openModal(MODAL_TYPE.TUTORIAL_MODAL)
       }
      }
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

                {/* Speak to Us & Feedback Section */}
                <div className="border-t border-base-300">
                  <ul className="menu w-full text-base-content">
                     <li>

                      <a 
                        onClick={() => handleOpenModal("tutorial")}
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <MonitorPlay size={16} className="text-gray-600" />
                        <span className="flex-1 text-sm font-medium">Tutorial</span>
                      </a>
                    </li>
                    <li>

                      <a 
                        onClick={() => handleOpenModal("speakToUs")}
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <MessageCircleMore size={16} className="text-gray-600" />
                        <span className="flex-1 text-sm font-medium">Speak to Us</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://gtwy.featurebase.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors"
                      >
                        <MessageSquareMore size={16} className="text-gray-600" />
                        <span className="flex-1 text-sm font-medium">Feedback</span>
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Settings Section */}
                <div className="border-t border-base-300">
                  <details className="overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition hover:bg-gray-100">
                      <span className="text-sm font-medium flex justify-center items-center gap-3"> 
                        <Settings2 size={16} className="text-gray-600" /> 
                        Settings 
                      </span>
                      <span className="transition group-open:-rotate-180">
                        <ChevronDown strokeWidth={1.25} size={16} className="text-gray-600" />
                      </span>
                    </summary>
                    <div className="border-t border-gray-200 bg-white">
                      <ul className="menu w-full text-base-content">
                        <li>
                          <a className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors">
                            <Mail size={16} className="text-gray-600" />
                            <span className="flex-1 text-sm font-medium">{userdetails.email}</span>
                          </a>
                        </li>
                        <li>
                          <a 
                            className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors cursor-pointer" 
                            onClick={() => router.push(`/org/${path[2]}/userDetails`)}
                          >
                            <Cog size={16} className="text-gray-600" />
                            <span className="flex-1 text-sm font-medium">Update User Details</span>
                          </a>
                        </li>
                        <li>
                          <a 
                            className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors cursor-pointer" 
                            onClick={() => router.push(`/org/${path[2]}/workspaceSetting`)}
                          >
                            <Cog size={16} className="text-gray-600" />
                            <span className="flex-1 text-sm font-medium">Workspace Settings</span>
                          </a>
                        </li>
                        <li>
                          <a 
                            className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 transition-colors cursor-pointer" 
                            onClick={logoutHandler}
                          >
                            <LogOut size={16} className="text-gray-600" />
                            <span className="flex-1 text-sm font-medium">Logout</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DemoModal speakToUs={true}></DemoModal>
      <TutorialModal />
      
    </>
  );
}

export default MainSlider;