"use client";
import { getInvitedUsers, inviteUser } from '@/config';
import Protected from '@/components/protected';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UserCircleIcon } from '@/components/Icons';

export const runtime = 'edge';

function InvitePage({ params }) {

  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [query, setQuery] = useState('');

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
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const filteredMembers = !query
    ? invitedMembers
    : invitedMembers.filter(member =>
      member.email.toLowerCase().includes(query.toLowerCase())
    );

  const isEmailAlreadyInvited = (email) => {
    return invitedMembers.some(member => member.email === email);
  };

  const handleInviteSubmit = async () => {
    if (!isEmailValid(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (isEmailAlreadyInvited(email)) {
      toast.error('This email is already invited.');
      return;
    }

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInviteSubmit();
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);
  return (
    <div className="h-full flex items-start justify-center w-full">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Invite Team Members</h1>
          <p className="text-gray-600">Easily invite your team to collaborate and manage tasks efficiently.</p>
        </div>

        {/* Invite Form Section */}
        <div className="flex gap-4 items-center mb-10">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter team member's email"
            className="input input-bordered flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleInviteSubmit}
            className="btn btn-primary px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:bg-blue-600 transition-all"
          >
            Send Invite
          </button>
        </div>

        {/* Members List */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">

          <div className='flex justify-between items-center'>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Team Members</h2>
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search team members..."
                onChange={(e) => setQuery(e.target.value)}
                className="input input-bordered w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <UserCircleIcon size={16} className="text-blue-500 text-2xl" />
                    <span className="text-lg font-medium text-gray-700">{member.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers?.length === 0 && invitedMembers.length === 0 ? (
            <p className="text-gray-600 text-center">No members invited yet. Start by inviting your team.</p>
          ) : (
            <p className="text-gray-600 text-center">No members found matching your search.</p>
          )}
        </div>

        {/* Modal for Confirmation */}
        {isModalOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-low-medium"></div>
            <dialog className="modal z-low-medium open">
              <div className="modal-box rounded-lg shadow-lg">
                <h3 className="font-bold text-lg">Invite Member</h3>
                <p className="text-sm text-gray-600 mb-4">Confirm sending an invite to {email}?</p>
                <div className="modal-action flex justify-end gap-4">
                  <button
                    onClick={handleCloseModal}
                    className="btn bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-lg px-6 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteSubmit}
                    className="btn btn-primary rounded-lg px-6 py-2"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </dialog>
          </>
        )}
      </div>
    </div>

  )
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <button
            onClick={handleInviteClick}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded-full mb-8 hover:from-blue-600 hover:to-purple-600 transition duration-300"
          >
            + Invite Member
          </button>
          {isModalOpen && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-50 z-low-medium"></div>
              <dialog className="modal z-low-medium" open>
                <div className="modal-box bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-bold text-2xl text-gray-800 mb-4">Invite Member</h3>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Member's email"
                    className="input input-bordered w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="modal-action flex justify-end space-x-2">
                    <button
                      onClick={handleCloseModal}
                      className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInviteSubmit}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
              </dialog>
            </>
          )}

          <div className="w-full text-center mt-10">
            <h4 className="text-2xl font-semibold mb-6 text-gray-800">Members:</h4>
            <div className="space-y-4">
              {invitedMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-start space-x-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <UserCircleIcon size={16} className="text-blue-500" />
                  <span className="text-lg font-medium text-gray-700">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Protected(InvitePage);




