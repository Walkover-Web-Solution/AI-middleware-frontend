// Sidebar.jsx
"use client"
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { useSelector,useDispatch } from 'react-redux';
import { setCurrentOrgId } from '@/store/reducer/orgReducer';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';

function Sidebar() {
  const path = usePathname();
  const route = useRouter();
  const currentOrgId = useSelector(state => state.orgReducer.currentOrgId) || 1374;
  const dispatch = useDispatch()

  const handleBridgeClick = () => {
      if (currentOrgId) {
          route.push(`/org/${currentOrgId}/bridges`);
      } 
  };

  return (
    <div className="drawer-side border-r-4">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <ul className="menu p-4 w-50 min-h-full bg-base-200 text-base-content">
        <li>
          <button
            className={path === `/org/${currentOrgId}/bridges` ? "btn-active" : ""}
            onClick={handleBridgeClick}
          >
            Bridges
          </button>
        </li>
        <li>
          <button
            className={path === `/org/${currentOrgId}/apikey` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${currentOrgId}/apikey`)}
          >
            Api key
          </button>
        </li>
        <li>
          <button
            className={path === `/org/${currentOrgId}/invite` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${currentOrgId}/invite`)}
          >
            Invite
          </button>
        </li>
      </ul>
    </div>
  );
}

  

  export default Sidebar;
  
