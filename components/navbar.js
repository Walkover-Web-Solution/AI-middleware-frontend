"use client"

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { userDetails } from '@/store/action/userDetailsAction';
import { logoutUserFromMsg91, switchOrg } from '@/api';
import { useCustomSelector } from '@/customSelector/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { Box, Building2, ChevronDown, FileSliders, History, KeyRound, LogOut, Mail, Rss, Settings2 } from 'lucide-react';
import { getAllBridgesAction, getSingleBridgesAction } from '@/store/action/bridgeAction';



function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathName = usePathname()
  const path = pathName.split('?')[0].split('/')
  const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);
  const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
  const bridgesList = useCustomSelector((state) => state.bridgeReducer.org[path[2]]) || [];
  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap[path[5]]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenBridge, setIsOpenBridge] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [bridgeSearchQuery, setBridgeSearchQuery] = useState('');

  const sidebarRef = useRef(null);
  const sideBridgeRef = useRef(null);



  // Event handler for bridge search query change
  const handleBridgeSearchChange = (e) => {
    setBridgeSearchQuery(e.target.value);
  };

  // Filtered bridge list based on search query
  const filteredBridgesList = bridgesList.filter(
    (item) => item.name.toLowerCase().includes(bridgeSearchQuery.toLowerCase())
  );

  useEffect(() => {
    dispatch(userDetails());
    dispatch(getSingleBridgesAction(path[5]))
  }, []);

  useLayoutEffect(() => {
    dispatch(getAllBridgesAction(path[2]))
  }, [path[2]]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (sideBridgeRef.current && !sideBridgeRef.current.contains(e.target)) {
        setIsOpenBridge(false);
      }
    };

    const handleEscapePress = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsOpenBridge(false);
        setSearchQuery("");
        setBridgeSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapePress);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const toggleBridgeSidebar = () => {
    setIsOpenBridge(!isOpenBridge);
  };

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

  const handleSwitchOrg = async (id) => {
    try {
      const response = await switchOrg(id);
      router.push(`/org/${id}/bridges`);
      dispatch(setCurrentOrgIdAction(id));
      if (response.status !== 200) {
        console.error('Failed to switch organization', response.data);
      }
    } catch (error) {
      console.error('Error switching organization', error);
    }
  };

  const filteredOrganizations = Object.values(organizations).filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} navbar bg-white border `}>
      <div className='flex items-center justify-center gap-2'>
        <button className="btn m-1" onClick={toggleSidebar}>
          <Building2 size={16} /> {organizations[path[2]]?.name}
        </button>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn capitalize m-1">{path[3] === 'apikey' ? 'API Key' : path[3]} <ChevronDown size={16} /></div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {['bridges', 'apikey', 'metrics'].map((item) => (
              <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)}>
                <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
              </li>
            ))}
          </ul>
        </div>
        {path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}>  <Rss size={16} /> {bridgeData?.name} </button>}

      </div>


      <div className="justify-end">
        {path.length === 6 ? (
          <div className="join">
            <button onClick={() => router.push(`/org/${path[2]}/bridges/configure/${path[5]}`)} className={` ${path[4] === 'configure' ? "btn-primary" : ""}   btn join-item `}> <FileSliders size={16} /> Configure</button>
            <button onClick={() => router.push(`/org/${path[2]}/bridges/history/${path[5]}`)} className={` ${path[4] === 'history' ? "btn-primary" : ""}   btn join-item `}><History size={16} /> History</button>
            {/* <button className={` ${path[4] === 'metrics' ? "btn-primary" : ""}   btn join-item `}> <Box size={16} /> Metrics</button> */}
          </div>
        ) : (
          path[3] === 'apikey' ?
            <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_5').showModal()}>+ create new key</button>
            :
            path[3] === 'bridges' ?
              <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>
                + create new bridge
              </button> : ""
        )}
      </div>

      {/* org slider  */}

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpen ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full  flex-col h-screen overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            <p className='text-xl'> Organization </p>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            />
            <ul className="menu p-0 w-full   text-base-content">
              {filteredOrganizations.map((item) => (
                <li key={item.id}><a className={`${item.id == path[2] ? "active" : `${item.id}`} py-2 px-2 rounded-md`} key={item.id} onClick={() => { handleSwitchOrg(item.id); router.push(`/org/${item.id}/${path[3]}`) }}  > <Building2 size={16} /> {item.name}</a></li>
              ))}
            </ul>
          </div>
          <div className='mt-auto w-full p-4'>
            <details
              class="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary
                class="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition"
              >
                <span class="text-sm font-medium flex justify-center items-center gap-2"> <Settings2 size={16} /> Setting </span>

                <span class="transition group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-4 w-4"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>

              <div class="border-t border-gray-200 bg-white">
                <ul className="menu w-full   text-base-content">
                  <li> <a className='py-2 px-2 rounded-md'> <Mail size={16} /> {userdetails.email}</a> </li>
                  <li> <a className={`py-2 px-2  ${path[3] === 'apikey' ? "active" : ""}  rounded-md`} onClick={() => { router.push(`/org/${path[2]}/apikey`); setIsOpen(false); }}> <KeyRound size={16} />API key</a> </li>
                  <li onClick={logoutHandler}><a className='py-2 px-2 rounded-md'> <LogOut size={16} />  logout</a></li>
                </ul>
              </div>

            </details>
          </div>
        </aside>
      </div>

      {/* bridge slider */}
      <div
        ref={sideBridgeRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpenBridge ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full  flex-col h-screen overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            <p className='text-xl'> Bridges </p>
            {/* Input field for bridge search */}
            <input
              type="text"
              placeholder="Search..."
              value={bridgeSearchQuery}
              onChange={handleBridgeSearchChange}
              className="border border-gray-300 rounded p-2 w-full"
            />
            {/* Render filtered bridge list */}
            <ul className="menu p-0 w-full   text-base-content">
              {filteredBridgesList.map((item) => (
                <li key={item._id}>
                  <a
                    className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md`}
                    onClick={() => router.push(`/org/${path[2]}/bridges/configure/${item._id}`)}
                  >
                    <Building2 size={16} /> {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Navbar;
