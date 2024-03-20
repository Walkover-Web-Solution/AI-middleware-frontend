// Sidebar.jsx
"use client"
import React, { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation'; 
import { useSelector,useDispatch } from 'react-redux';
import { setCurrentOrgId } from '@/store/reducer/orgReducer';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';

function Sidebar() {
  const path = usePathname();
  const route = useRouter();
  const currentOrgId = useSelector(state => state?.orgReducer?.currentOrgId) || 1374;
  const dispatch = useDispatch()
  const params = useParams()
  // console.log(params.id)

  // const handleBridgeClick = () => {
  //     if (currentOrgId) {
  //         route.push(`/org/${currentOrgId}/bridges`);
  //     } 
  // };

  // useEffect(() => {
  //    dispatch(setCurrentOrgId(currentOrgId))
  // },[])

  return (
    <div className="drawer-side border-r-4">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <ul className="menu p-4 w-50 min-h-full bg-base-200 text-base-content">
        <li>
          <button
            className={path === `/org/${params.id}/bridges` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${params.id}/bridges`)}
          >
            Bridges
          </button>
        </li>
        <li>
          <button
            className={path === `/org/${params.id}/apikey` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${params.id}/apikey`)}
          >
            Api key
          </button>
        </li>
        <li>
          <button
            className={path === `/org/${params.id}/invite` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${params.id}/invite`)}
          >
            Invite
          </button>
        </li>
        <li>
          <button
            className={path === `/org/${params.id}/metrics` ? "btn-active" : ""}
            onClick={() => route.push(`/org/${params.id}/metrics`)}
          >
            Metrics
          </button>
        </li>
      </ul>
    </div>
  );
}

  

  export default Sidebar;
  
