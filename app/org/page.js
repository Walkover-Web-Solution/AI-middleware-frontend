"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {  setCurrentOrgIdAction } from '@/store/action/orgAction';
import CreateOrg from '@/components/createNewOrg';
import { useRouter } from 'next/navigation';
import { switchOrg } from '@/api';
import Protected from '@/components/protected';

/**
 * The organizations page that displays all the organizations
 * the current user is a member of.
 */
function Page() {
  // State to manage whether the create organization modal is shown or not
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  // Redux dispatch function to make API calls
  const dispatch = useDispatch();
  // Next.js router instance
  const route = useRouter()
  // Use useSelector to get organizations from the Redux store
  const organizations = useSelector(state => state.userDetailsReducer.organizations);




  /**
   * Handle switch organization
   * @param {String} id - The organization id
   * @returns {Promise<void>} 
   */
  const handleSwitchOrg = async (id) => {
    try {
      // Make the API call to switch the current organization
      const response = await switchOrg(id);
      // Redirect the user to the bridges page of the newly selected organization
      // after the switch organization API call is successful
      route.push(`/org/${id}/bridges`);
      // Update the current organization id in the Redux store
      dispatch(setCurrentOrgIdAction(id));
      if (response.status === 200) {
        // Log a success message if the API call is successful
        console.dir("Organization switched successfully", response.data);
      } else {
        // Log an error message if the API call is not successful
        console.error("Failed to switch organization", response.data);
      }
    } catch (error) {
      // Log an error message if there is an error making the API call
      console.error("Error switching organization", error);
    }
  };

  /**
   * Handle opening the create organization modal
   */
  const handleOpenCreateOrgModal = () => {
    setShowCreateOrgModal(true);
  };

  /**
   * Handle closing the create organization modal
   */
  const handleCloseCreateOrgModal = () => {
    setShowCreateOrgModal(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-50vh bg-gray-100 px-2 md:px-0">
      <button
        onClick={handleOpenCreateOrgModal}
        className="px-6 py-3 my-5 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        + Create New Organization
      </button>

    <div className="w-full max-w-4xl mt-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Organizations</h2>
      <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 mb-8 cursor-pointer">
      {organizations.slice().reverse().map((org, index) => (
  <div key={index} onClick={() => {handleSwitchOrg(org.id); route.push(`org/${org.id}/bridges`)}} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
    <div className="px-6 py-4">
      <div className="font-bold text-xl mb-2">{org?.name}</div>
      <p className="text-gray-700 text-base">
      </p>
    </div>
  </div>
))}
      </div>


      {showCreateOrgModal && <CreateOrg onClose={handleCloseCreateOrgModal} />}
    </div>

    </div>


  );
}

export default Protected(Page);


