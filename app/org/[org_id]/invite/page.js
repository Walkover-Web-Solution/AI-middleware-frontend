"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { inviteUser, getInvitedUsers } from '@/api';
import Sidebar from '@/components/Sidebar'
import Protected from '@/components/protected';
import { useSelector, useDispatch } from 'react-redux';




function InvitePage({ params }) {

  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);

  useEffect(() => {
    fetchInvitedMembers();
  }, []);

  /**
   * Fetches the list of invited members
   *
   * @returns {Promise<void>} Returns a promise that resolves when the invited members are fetched
   */
  const fetchInvitedMembers = async () => {
    try {
      const response = await getInvitedUsers();

      // If the request is successful and API returns an array of invited members
      if (response.status === 200 && response.data) {
        setInvitedMembers(response.data.data.data);
      } else {
        // If the request failed or API returns something other than an array
        toast.error('Failed to fetch invited members.');
      }
    } catch (error) {
      // If there is an error in the request
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

  /**
   * Handles the invite submit event
   *
   * Sends an invitation to the user with the given email address.
   * If the request is successful, the invitation is sent successfully
   * and the list of invited members is refreshed.
   *
   * @returns {Promise<void>} Returns a promise that resolves when the invitation
   * is sent successfully or an error is thrown
   */
  const handleInviteSubmit = async () => {
    try {
      const response = await inviteUser({ user: { email: email } }); // Invite the member

      if (response.status === "success") { // If the invitation is sent successfully
        toast.success(`Invitation sent to ${email} successfully!`); // Show a success toast
        setEmail(''); // Reset email field after successful invitation
        fetchInvitedMembers(); // Refresh the list of invited members
        handleCloseModal(); // Close the modal after inviting
      } else {
        toast.error('Failed to send invitation.'); // Show an error toast
      }
    } catch (error) { // If there is an error in the request
      console.error('Error inviting member:', error); // Log the error
      toast.error('An error occurred while sending the invitation.'); // Show an error toast
    }
  };

  return (<div className="drawer lg:drawer-open">
  <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content flex flex-col items-center justify-start w-full">
    <div className="flex w-full max-w-4xl justify-between items-center mt-4 px-4">
      <h2 className="text-2xl font-semibold text-gray-800">Members</h2>
      <button onClick={handleInviteClick} className="btn btn-primary">
        + Invite Member
      </button>
    </div>

    <div className="w-full max-w-4xl mt-4 px-4">
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

      <div className="flex flex-col w-full my-4">
        {invitedMembers.map((member, index) => (
          <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200 w-full">
            <div className="flex-1">
              <span className="text-lg font-bold text-gray-800">{member.name}</span>
            </div>
            <div className="flex-1">
              <span className="text-md font-medium text-gray-600">{member.email}</span>
            </div>
            <div className="flex-1">
              <span className="text-green-600 font-bold">Complete Access</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  <Sidebar orgid={params.org_id} />
</div>






  );
}

export default Protected(InvitePage);




