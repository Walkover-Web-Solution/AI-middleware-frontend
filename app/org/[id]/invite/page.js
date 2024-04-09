"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { inviteUser, getInvitedUsers } from '@/api';
import Sidebar from '@/components/Sidebar'
import Protected from '@/components/protected';
import { useSelector,useDispatch } from 'react-redux';




function InvitePage() {
   
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);


  const currentOrgId = useSelector(state => state.orgReducer.currentOrgId);
  const dispatch = useDispatch()



  useEffect(() => {
    fetchInvitedMembers();
  }, []);

  const fetchInvitedMembers = async () => {
    try {
      const response = await getInvitedUsers();
      if (response.status === 200 && response.data) {
        // Assuming the API returns an array of invited members
        setInvitedMembers(response.data.data.data);
      } else {
        toast.error('Failed to fetch invited members.');
      }
    } catch (error) {
      console.error('Error fetching invited members:', error);
      toast.error('An error occurred while fetching invited members.');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleInviteClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInviteSubmit = async () => {
    try {
      const response = await inviteUser({ user: { email : email } });
      if (response.status === "success") {
        toast.success(`Invitation sent to ${email} successfully!`);
        setEmail(''); // Reset email field after successful invitation
        fetchInvitedMembers(); // Refresh the list of invited members
        handleCloseModal(); // Close the modal after inviting
      } else {
        toast.error('Failed to send invitation.');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('An error occurred while sending the invitation.');
    }
  };

  return (
      


<div className="drawer lg:drawer-open">

<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
<div className="drawer-content flex pl-2 flex-col items-start justify-start">
  <div className="flex w-full justify-start gap-16 items-start">
  <div className="flex-1 flex flex-col items-center justify-start pt-6">
     <button onClick={handleInviteClick} className="btn btn-primary mb-8">
      + Invite Member
     </button>
   {isModalOpen && (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <dialog className="modal z-50" open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Invite Member</h3>
            <input 
              type="email" 
              value={email}
              onChange={handleEmailChange}
              placeholder="Member's email"
              className="input input-bordered w-full"
            />
            <div className="modal-action">
              <button onClick={handleCloseModal} className="btn">Cancel</button>
              <button onClick={handleInviteSubmit} className="btn btn-primary">
                Send Invite
              </button>
            </div>
          </div>
        </dialog>
      </>
    )}

<div className="w-full max-w-lg mx-auto text-center mt-10">
          <h4 className="text-xl font-semibold mb-6 text-gray-800">Members:</h4>
          <div className="space-y-4 my-4">
            {invitedMembers.map((member, index) => (
                 <div key={index} className="flex items-center justify-start space-x-4 bg-white p-4 rounded-lg shadow border border-gray-200">
                 <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 4v4a2 2 0 001 1.732M15 7v4a2 2 0 01-1 1.732M12 20.01l.01-.011M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <span className="text-md font-medium text-gray-700">{member.name}</span>
               </div>
            ))}
          </div>
        </div>
      </div>
  </div>

</div>
<Sidebar/>
</div>
  );
}

export default Protected(InvitePage);




