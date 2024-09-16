"use client"
import { useCustomSelector } from '@/customSelector/customSelector';
import { deleteBridgeAction, duplicateBridgeAction, getAllBridgesAction } from '@/store/action/bridgeAction';
import { getIconOfService, toggleSidebar } from '@/utils/utility';
import { Building2, ChevronDown, Ellipsis, FileSliders, History, Home, Rss } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
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

  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-bridge-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');

  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} w-full navbar border flex-wrap md:flex-nowrap `}>
      <div className='flex items-center w-full justify-start gap-2'>
        <button className="btn m-1" onClick={() => router.push(`/org/${path[2]}/${path[3]}`)}>
          <Home size={16} />
        </button>
        <button className="btn m-1" onClick={toggleOrgSidebar}>
          <Building2 size={16} /> {organizations[path[2]]?.name}
        </button>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn capitalize m-1 ">{path[3] === 'apikeys' ? 'API Keys' : path[3]}<ChevronDown size={16} /></div>
          <ul tabIndex={0} className="dropdown-content z-[99] menu p-2 shadow bg-base-100 rounded-box w-52">
            {['bridges', "chatbot", 'pauthkey', 'apikeys', 'alerts', 'invite'].map((item) => (
              <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)}>
                <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
              </li>
            ))}
          </ul>
        </div>
        {path[3] === 'bridges' && path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}> {getIconOfService(bridgeData?.service)}  {bridgeData?.name} </button>}
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
          path[3] === 'apikeys' ?
            <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_6').showModal()}>+ create new Api key</button>
            : path[3] === 'pauthkey' ?
              <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_5').showModal()}>+ create new Pauth Key</button>
              :
              path[3] === 'alerts' ?
                <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_7').showModal()}>+ create new webhook Alert</button>
                :
                path[3] === 'bridges' ?
                  <div>
                    <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>
                      + create new bridge
                    </button>
                  </div> : (path[3] === 'chatbot' && path.length === 4) ?
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
