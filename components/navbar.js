"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { archiveBridgeAction, deleteBridgeAction, dicardBridgeVersionAction, duplicateBridgeAction, getAllBridgesAction } from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { getIconOfService, toggleSidebar } from '@/utils/utility';
import { Building2, ChevronDown, Ellipsis, FileSliders, History, Home, Rss } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import OrgSlider from './sliders/orgSlider';

function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const versionId = searchParams.get('version')
  const dispatch = useDispatch();
  const pathName = usePathname();
  const path = pathName.split('?')[0].split('/')
  const bridgeId = path[5];
  const { organizations, bridgeData, chatbotData, bridge, publishedVersion, isdrafted } = useCustomSelector((state) => ({
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state.bridgeReducer.allBridgesMap[bridgeId],
    chatbotData: state.ChatBot.ChatBotMap[bridgeId],
    bridge: state.bridgeReducer.allBridgesMap[bridgeId] || [],
    publishedVersion: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.published_version_id || [],
    isdrafted: state?.bridgeReducer?.bridgeVersionMapping?.[bridgeId]?.[versionId]?.is_drafted,
  }));

  const handleDeleteBridge = async (item, newStatus = 0) => {
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

      case "archive":
        try {
          dispatch(archiveBridgeAction(bridgeId, newStatus)).then((bridgeStatus) => {
            if (bridgeStatus === 1) {
              toast.success('Bridge Unarchived Successfully');
            } else {
              toast.success('Bridge Archived Successfully');
            }
            router.push(`/org/${orgId}/bridges`);
          });
        } catch (error) {
          console.error('Failed to archive/unarchive bridge', error);
        }
        break;
      default:
        break;
    }
  };

  const handlePublishBridge = async () => {
    document.getElementById(MODAL_TYPE.PUBLISH_BRIDGE_VERSION).showModal();
  }

  const handleDiscardChanges = async () => {
    dispatch(updateBridgeVersionReducer({ bridges: { ...bridge, _id: versionId, parent_id: bridgeId, is_drafted: false } }));
    dispatch(dicardBridgeVersionAction({ bridgeId, versionId }));
  }

  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-bridge-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');
  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} w-full navbar border flex-wrap md:flex-nowrap z-[100] max-h-[4rem] bg-base-100 sticky top-0`}>
      <div className='flex items-center w-full justify-start gap-2'>
        <button className="btn m-1" onClick={() => router.push(`/org/${path[2]}/bridges`)}>
          <Home size={16} />
        </button>
        <button className="btn m-1" onClick={toggleOrgSidebar}>
          <Building2 size={16} /> {organizations[path[2]]?.name}
        </button>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn capitalize m-1 ">{path[3] === 'apikeys' ? 'API Keys' : path[3]}<ChevronDown size={16} /></div>
          <ul tabIndex={0} className="dropdown-content z-[99] menu p-2 shadow bg-base-100 rounded-box w-52">
            {['bridges', "chatbot", 'pauthkey', 'apikeys', 'alerts', 'invite', 'metrics'].map((item) => (
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
            {path[4] === 'configure' && (
              <div className='flex items-center'>
                {(isdrafted && publishedVersion === versionId) && (
                  <div className="tooltip tooltip-left" data-tip="Your changes are discarded & will be synced by publish version.">
                    <div className='flex items-center gap-2'>
                      <button
                        className="btn bg-red-200 m-1 hover:bg-red-300"
                        onClick={handleDiscardChanges}
                      >
                        <span className='text-black'>Discard Changes</span>
                      </button>
                    </div>
                  </div>
                )}
                <button
                  className="btn bg-green-200 hover:bg-green-300"
                  onClick={handlePublishBridge}
                  disabled={!isdrafted && publishedVersion === versionId}
                >
                  Publish Version
                </button>
                <div className="divider divider-horizontal mx-1"></div>
              </div>
            )}
            <div className="join">
              <button onClick={() => router.push(`/org/${path[2]}/bridges/configure/${bridgeId}?version=${versionId}`)} className={` ${path[4] === 'configure' ? "btn-primary" : ""}   btn join-item `}> <FileSliders size={16} /> Configure</button>
              <button onClick={() => router.push(`/org/${path[2]}/bridges/history/${bridgeId}?version=${versionId}`)} className={` ${path[4] === 'history' ? "btn-primary" : ""}   btn join-item `}><History size={16} /> History</button>
            </div>
            <div className='ml-2'>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn capitalize m-1">
                <Ellipsis />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[9999999999] menu p-2 shadow bg-base-100 rounded-box w-52 custom-dropdown">
                {['Archive'].map((item) => (
                  <li key={item} onClick={() => handleDeleteBridge(item, bridge.status !== undefined ? Number(!bridge.status) : undefined)}>
                    <a className={path[3] === item ? "active" : ""}>{item === 'Archive' ? (bridge.status === 0 ? 'Unarchive' : 'Archive') : item.charAt(0).toUpperCase() + item.slice(1)}</a>
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
                <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_7').showModal()}>+ create new Alert</button>
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
