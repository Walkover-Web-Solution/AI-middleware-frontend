"use client"
import { useCustomSelector } from '@/customSelector/customSelector';
import GeminiIcon from '@/icons/GeminiIcon';
import OpenAiIcon from '@/icons/OpenAiIcon';
import { deleteBridgeAction, duplicateBridgeAction, getAllBridgesAction } from '@/store/action/bridgeAction';
import { Building2, ChevronDown, Ellipsis, FileSliders, History, Home, Rss } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatbotSlider';
import OrgSlider from './sliders/orgSlider';

function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathName = usePathname()
  const path = pathName.split('?')[0].split('/')
  const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap[path[5]]);
  const chatbotData = useCustomSelector((state) => state.ChatBot.ChatBotMap[path[5]])

  const handleDeleteBridge = async (item) => {
    const bridgeId = path[5];
    const orgId = path[2];

    switch (item.trim().toLowerCase()) {
      case 'duplicate':
        try {
          dispatch(duplicateBridgeAction(bridgeId)).then((newBridgeId) => {
            if (newBridgeId) {
              router.push(`/org/${path[2]}/bridges/configure/${newBridgeId}`)
              toast.success('Bridge duplicate successfully');
            }
          });
        } catch (error) {
          console.error('Failed to duplicate bridge:', error);
          toast.error('Error duplicating bridge');
        }
        break;

      case 'delete':
        // Confirm delete action
        const confirmDelete = window.confirm('Are you sure you want to delete this bridge?');

        if (confirmDelete) {
          try {
            // Dispatch delete bridge action and get all bridges
            await dispatch(deleteBridgeAction({ bridgeId, orgId }));
            router.push(`/org/${orgId}/bridges`);
            toast.success('Bridge deleted successfully');
            dispatch(getAllBridgesAction());
          } catch (error) {
            console.error('Failed to delete bridge:', error);
            toast.error('Error deleting bridge');
          }
        }
        break;
      default:
        break;
    }
  };
  const toggleSidebar = (sidebarId) => {
    const sidebar = document.getElementById(sidebarId);
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById(sidebarId);
      const button = event.target.closest('button');

      if (sidebar && !sidebar.contains(event.target) && !button) {
        sidebar.classList.add('-translate-x-full');
        document.removeEventListener('click', handleClickOutside);
      }
    };

    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');

      if (!sidebar.classList.contains('-translate-x-full')) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    }
  };

  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-bridge-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');

  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} w-full navbar bg-white border `}>
      <div className='flex items-center w-full justify-start gap-2'>
        <button className="btn m-1" onClick={() => router.push(`/org/${path[2]}/${path[3]}`)}>
          <Home size={16} />
        </button>
        <button className="btn m-1" onClick={toggleOrgSidebar}>
          <Building2 size={16} /> {organizations[path[2]]?.name}
        </button>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn capitalize m-1">{path[3] === 'apikey' ? 'API Key' : path[3]} <ChevronDown size={16} /></div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {['bridges', "chatbot", 'apikey', 'metrics', 'invite'].map((item) => (
              <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)}>
                <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
              </li>
            ))}
          </ul>
        </div>
        {path[3] === 'bridges' && path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}> {bridgeData?.service === 'openai' ? <OpenAiIcon /> : <GeminiIcon />}  {bridgeData?.name} </button>}
        {path[3] === 'chatbot' && path[4] === 'configure' && <button className="btn m-1" onClick={toggleChatbotSidebar}> <Rss size={16} /> {chatbotData?.title} </button>}
      </div>

      <div className="justify-end w-full" >
        {path.length === 6 && path[3] === 'bridges' ? (
          <>
            <div className="join">
              <button onClick={() => router.push(`/org/${path[2]}/bridges/configure/${path[5]}`)} className={` ${path[4] === 'configure' ? "btn-primary" : ""}   btn join-item `}> <FileSliders size={16} /> Configure</button>
              <button onClick={() => router.push(`/org/${path[2]}/bridges/history/${path[5]}`)} className={` ${path[4] === 'history' ? "btn-primary" : ""}   btn join-item `}><History size={16} /> History</button>
            </div>
            <div className='ml-2'>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn capitalize m-1">
                <Ellipsis />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[9999999999] menu p-2 shadow bg-base-100 rounded-box w-52 custom-dropdown">
                {['Duplicate', 'Delete'].map((item) => (
                  <li key={item} onClick={() => handleDeleteBridge(item)}>
                    <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          path[3] === 'apikey' ?
            <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_5').showModal()}>+ create new key</button>
            :
            path[3] === 'bridges' ?
              <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>
                + create new bridge
              </button> : (path[3] === 'chatbot' && path.length === 4) ?
                <button className="btn btn-primary" onClick={() => document.getElementById('chatBot_model').showModal()}>
                  + create new chatbot
                </button> : ""
        )}
      </div>

      {/* org slider  */}
      <OrgSlider />

      {/* bridge slider */}
      <BridgeSlider />

      {/* chatbot slider */}
      <ChatBotSlider />
    </div>
  );
}

export default Navbar;