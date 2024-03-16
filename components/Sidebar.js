// Sidebar.jsx
"use client"
import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { useSelector } from 'react-redux';

function Sidebar() {
  const path = usePathname();
  const route = useRouter();
  const currentOrgId = useSelector(state => state.orgReducer.currentOrgId);

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
            className={path === "/apikey" ? "btn-active" : ""}
            onClick={() => route.push("/apikey")}
          >
            Api key
          </button>
        </li>
      </ul>
    </div>
  );
}

  

  export default Sidebar;
  
