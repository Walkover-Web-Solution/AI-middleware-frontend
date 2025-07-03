import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { openModal, toggleSidebar } from '@/utils/utility';
import { BuildingIcon, BotIcon, BookIcon, CogIcon, KeyIcon, KeyRoundIcon, LineChartIcon, LogoutIcon, MailIcon, PlugIcon, TriangleWarningIcon, AddUserIcon, SettingsAltIcon, MessageSquareMoreIcon, MonitorPlayIcon, ChevronDownIcon, AlignIcon, MessageCircleMoreIcon, BlocksIcon } from '@/components/Icons';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';

function MainSlider({ isEmbedUser }) {
  const pathName = usePathname();
  const router = useRouter();
  const path = pathName.split('?')[0].split('/')
  const { userdetails, organizations } = useCustomSelector((state) => ({
    userdetails: state?.userDetailsReducer?.userDetails,
    organizations: state.userDetailsReducer.organizations,
  }));

  const Icons = {
    org: <BuildingIcon size={24} />,
    agents: <PlugIcon size={24} />,
    chatbot: <BotIcon size={24} />,
    pauthkey: <KeyRoundIcon size={24} />,
    apikeys: <KeyIcon size={24} />,
    alerts: <TriangleWarningIcon size={24} />,
    invite: <AddUserIcon size={24} />,
    metrics: <LineChartIcon size={24} />,
    knowledge_base: <BookIcon size={24} />,
    integration: <BlocksIcon size={24} />,
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
    if (modelName == 'speakToUs') {
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
        <label htmlFor="my-drawer-2" className="drawer-button lg:hidden absolute top-3 left-1">
          <AlignIcon size={24} onClick={toggleMainSidebar} />
        </label>
        <div className={`drawer lg:drawer-open relative z-low-medium lg:z-very-low`}>
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col"></div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <div className="flex flex-col h-screen w-72 bg-base-100 border-r border-base-300 py-4">
              <div className="flex-grow overflow-y-auto px-4">
                <div className='mb-4 flex-col gap-2'>
                  <h2 className="text-xl font-bold text-start">
                    {organizations[path[2]]?.name.length > 15
                      ? organizations[path[2]]?.name.substring(0, 15) + '...'
                      : organizations[path[2]]?.name}
                  </h2>
                  {!isEmbedUser && <button
                    type="button"
                    onClick={handleSwitchOrganization}
                    className="text-sm text-blue-500 hover:underline z-[102] bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                  >
                    Switch Organization
                  </button>}
                </div>
                <ul className="menu space-y-2 p-0">
                  {
                    ['agents', 'pauthkey', 'apikeys', 'alerts', 'knowledge_base', 'integration', 'invite', 'metrics'].map((item) => (
                      <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)} className="transition-transform transform hover:scale-105 flex items-center">
                        <a className={` w-full font-medium ${path[3] === item ? "active text-primary" : "text-base-content"} `}>
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
                        onClick={() => openModal(MODAL_TYPE.TUTORIAL_MODAL)}
                        className="flex items-center gap-3 py-3 px-4  transition-colors cursor-pointer"
                      >
                        <MonitorPlayIcon size={16} className="text-base-content" />
                        <span className="flex-1 text-sm font-medium">Tutorial</span>
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => { openModal(MODAL_TYPE.DEMO_MODAL) }}
                        className="flex items-center gap-3 py-3 px-4  transition-colors cursor-pointer"
                      >
                        <MessageCircleMoreIcon size={16} className="text-base-content" />
                        <span className="flex-1 text-sm font-medium">Speak to Us</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://gtwy.featurebase.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4  transition-colors"
                      >
                        <MessageSquareMoreIcon size={16} className="text-base-content" />
                        <span className="flex-1 text-sm font-medium">Feedback</span>
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Settings Section */}
                <div className="border-t border-base-300">
                  <details className="overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 bg-base-100 p-4 text-base-content transition hover:bg-base-100">
                      <span className="text-sm font-medium flex justify-center items-center gap-3"><SettingsAltIcon size={16} className="text-base-content" />Settings</span>
                      <span className="transition group-open:-rotate-180"><ChevronDownIcon strokeWidth={1.25} size={16} className="text-base-content" /></span>
                    </summary>
                    <div className="border-t border-base-300 bg-base-100">
                      <ul className="menu w-full text-base-content">
                        <li> <a className='py-2 px-2 rounded-md'> <MailIcon size={16} /> {userdetails.email}</a> </li>
                        <li> <a className={`py-2 px-2 rounded-md`} onClick={() => { router.push(`/org/${path[2]}/userDetails`) }}> <CogIcon size={16} />Update User Details</a> </li>
                        <li> <a className={`py-2 px-2 rounded-md`} onClick={() => { router.push(`/org/${path[2]}/workspaceSetting`) }}> <CogIcon size={16} /> Workspace Setting</a> </li>
                        <li ><a className='py-2 px-2 rounded-md' onClick={logoutHandler}> <LogoutIcon size={16} />  logout</a></li>
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

export default Protected(MainSlider);