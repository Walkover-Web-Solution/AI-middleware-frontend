"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import CreateOrg from '@/components/createNewOrg';
import { useRouter } from 'next/navigation';
import { switchOrg, switchUser } from '@/config';
import Protected from '@/components/protected';
// import Chatbot from 'interface-chatbot';
import { userDetails } from '@/store/action/userDetailsAction';

/**
 * The organizations page that displays all the organizations
 * the current user is a member of.
 */
function Page() {

  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter()
  const organizations = useSelector(state => state.userDetailsReducer.organizations);

  const handleSwitchOrg = async (id, name) => {
    try {
      const response = await switchOrg(id);
      if (process.env.NEXT_PUBLIC_ENV === 'local') {
        const localToken = await switchUser({
          orgId: id,
          orgName: name
        })
        localStorage.setItem('local_token', localToken.token);
        route.push(`/org/${id}/bridges`);
      }
      
      dispatch(setCurrentOrgIdAction(id));
      if (response.status === 200) {
        console.dir("Organization switched successfully", response.data);
      } else {
        console.error("Failed to switch organization", response.data);
      }
    } catch (error) {
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


  useEffect(() => {
    dispatch(userDetails());
  }, []);


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
          {Object.values(organizations)?.slice().reverse().map((org, index) => (
            <div key={index} onClick={() => { handleSwitchOrg(org.id, org?.name) }} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
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
      {/* <Chatbot
        embedToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1NTkzIiwicHJvamVjdF9pZCI6InByb2prZkFEczJFVyIsImludGVyZmFjZV9pZCI6IjY2MzFjOTRmODIwZTQ1YzdkYzA3YmMxNCJ9.hFUmvpYXmZ1Mu1_opXT6Nv3NoBjio1940D1ky3nxaDY'
        className="h-100 w-100 pos-abs"
        onOpen={() => console.log("Chatbot opened")}
        onClose={() => console.log("Chatbot closed")}
        threadId="1gyh"
        bridgeName="root"
        // theme='light'
        variables={{ "your_variables": 7 }}
      /> */}

    </div>


  );
}

export default Protected(Page);


