"use client"
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getAllOrgAction, setCurrentOrgIdAction } from '@/store/action/orgAction';
import CreateOrg from '@/components/createNewOrg';
import { useRouter } from 'next/navigation';
import { switchOrg } from '@/api';
import { getAllBridgesAction } from '@/store/action/bridgeAction';
import Protected from '@/components/protected';

function Page() {
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter()
  // Use useSelector to get organizations from the Redux store
  const organizations = useSelector(state => state.orgReducer.organizations);

  useEffect(() => {
    dispatch(getAllOrgAction());
  }, []);

  const handleSwitchOrg = async (id) => {
    try {
      const response = await switchOrg(id);
      dispatch(setCurrentOrgIdAction(id))
      if (response.status === 200) {
        console.log("Organization switched successfully", response.data);
        
        // dispatch(getAllOrgAction());
        // route.push("/somepath"); // If you need to navigate
      } else {
        console.error("Failed to switch organization", response.data);
      }
    } catch (error) {
      console.error("Error switching organization", error);
    }
  };


  const handleOpenCreateOrgModal = () => {
    setShowCreateOrgModal(true);
  };

  const handleCloseCreateOrgModal = () => {
    setShowCreateOrgModal(false);
  };
  // console.log(organizations)
  return (
    <div className="flex flex-col justify-center items-center min-h-50vh bg-gray-100 px-2 md:px-0">
    <div className="w-full max-w-4xl mt-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Organizations</h2>
      <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 mb-8 cursor-pointer">
        {organizations.map((org, index) => (
          <div key={index} onClick={() => {handleSwitchOrg(org.id); route.push(`org/${org.id}/bridges`)}} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <div  className="font-bold text-xl mb-2">{org?.name}</div>
              <p className="text-gray-700 text-base">
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      onClick={handleOpenCreateOrgModal} 
      className="px-6 py-3 my-5 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
    >
      Create New Organization
    </button>

    {showCreateOrgModal && <CreateOrg onClose={handleCloseCreateOrgModal} />}
</div>


  );
}

export default Protected(Page);


