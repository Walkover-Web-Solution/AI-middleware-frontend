"use client"
import CreateOrg from '@/components/createNewOrg';
import Protected from '@/components/protected';
import { switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customSelector/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from "react-redux";

/**
 * The organizations page that displays all the organizations
 * the current user is a member of.
 */
function Page() {

  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const route = useRouter()
  const organizations = useCustomSelector(state => state.userDetailsReducer.organizations);

  const handleSwitchOrg = useCallback(async (id, name) => {
    try {
      const response = await switchOrg(id);
      if (process.env.NEXT_PUBLIC_ENV === 'local') {
        const localToken = await switchUser({ orgId: id, orgName: name });
        localStorage.setItem('local_token', localToken.token);
      }
      route.push(`/org/${id}/bridges`);
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

  const handleOpenCreateOrgModal = useCallback(() => {
    setShowCreateOrgModal(true);
  }, []);

  const handleCloseCreateOrgModal = useCallback(() => {
    setShowCreateOrgModal(false);
  }, []);

  useEffect(() => {
    dispatch(userDetails());
  }, []);

  const filteredOrganizations = Object.values(organizations).filter(
    item => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const renderedOrganizations = useMemo(() => (
    filteredOrganizations.slice().reverse().map((org, index) => (
      <div
        key={index}
        onClick={() => handleSwitchOrg(org.id, org.name)}
        className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{org.name}</div>
        </div>
      </div>
    ))
  ), [filteredOrganizations, handleSwitchOrg]);

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-gray-100 px-2 md:px-0">
      <div className="w-full max-w-4xl mt-4 flex flex-col gap-3">
        <div className='flex flex-row justify-between items-center'>
          <h2 className="text-2xl font-semibold text-gray-800">Existing Organizations</h2>
          <button
            onClick={handleOpenCreateOrgModal}
            className="px-6 py-3 my-5 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            + Create New Organization
          </button>
        </div>
        <input
          type="text"
          placeholder="Search organizations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 input input-bordered outline-none p-4 rounded-md  w-full mb-4"
        />
        <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 mb-8 cursor-pointer">
          {renderedOrganizations}
        </div>
        {showCreateOrgModal && <CreateOrg onClose={handleCloseCreateOrgModal} handleSwitchOrg={handleSwitchOrg} />}
      </div>
    </div>
  );
}

export default Protected(Page);