"use client"
import CreateOrg from '@/components/createNewOrg';
import Protected from '@/components/protected';
import { switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { getServiceAction } from '@/store/action/serviceAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { MODAL_TYPE } from '@/utils/enums';
import { filterOrganizations, getFromCookies, openModal, setInCookies } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from "react-redux";

/**
 * The organizations page that displays all the organizations
 * the current user is a member of.
 */
function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const route = useRouter()
  const organizations = useCustomSelector(state => state.userDetailsReducer.organizations);

  const handleSwitchOrg = useCallback(async (id, name) => {
    try {
      const response = await switchOrg(id);
      const localToken = await switchUser({ orgId: id, orgName: name });
      if (localToken?.token) {
        setInCookies('local_token', localToken.token);
      }
      route.push(`/org/${id}/agents`);
      dispatch(setCurrentOrgIdAction(id));
      if (response.status === 200) {
        console.log("Organization switched successfully", response.data);
      } else {
        console.error("Failed to switch organization", response.data);
      }
    } catch (error) {
      console.error("Error switching organization", error);
    }
  }, [dispatch, route]);

  useEffect(() => {
    dispatch(userDetails());
    setTimeout(() => {
      dispatch(getServiceAction())
    }, 1000);
  }, []);

   // Theme initialization with full system theme support
    useEffect(() => {
      const getSystemTheme = () => {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      };
  
      const applyTheme = (themeToApply) => {
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', themeToApply);
        }
      };
  
      const savedTheme = getFromCookies("theme") || "system";
      const systemTheme = getSystemTheme();
      
      if (savedTheme === "system") {
        applyTheme(systemTheme);
      } else {
        applyTheme(savedTheme);
      }
  
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        const currentSavedTheme = getFromCookies("theme") || "system";
        
        // Only update if currently using system theme
        if (currentSavedTheme === "system") {
          applyTheme(newSystemTheme);
        }
      };
  
      mediaQuery.addEventListener('change', handleSystemThemeChange);
  
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }, []);

  const filteredOrganizations = filterOrganizations(organizations,searchQuery);
  
  const renderedOrganizations = useMemo(() => (
    filteredOrganizations.slice().reverse().map((org, index) => (
      <div
        key={index}
        onClick={() => handleSwitchOrg(org.id, org.name)}
        className="bg-base-300 shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{org.name}</div>
        </div>
      </div>
    ))
  ), [filteredOrganizations, handleSwitchOrg]);

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-base-100 px-2 md:px-0">
      <div className="w-full max-w-4xl mt-4 flex flex-col gap-3">
        <div className='flex flex-row justify-between items-center'>
          <h2 className="text-2xl font-semibold text-base-content">Existing Organizations</h2>
          <button
            onClick={()=>openModal(MODAL_TYPE.CREATE_ORG_MODAL)}
            className="btn btn-primary"
          >
            + Create New Organization
          </button>
        </div>
        <input
          type="text"
          placeholder="Search organizations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-base-300 input input-bordered outline-none p-4 rounded-md  w-full mb-4"
        />
        <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 mb-8 cursor-pointer">
          {renderedOrganizations}
        </div>
        {<CreateOrg handleSwitchOrg={handleSwitchOrg} />}
      </div>
    </div>
  );
}

export default Protected(Page);
