"use client";
import { getInvitedUsers, inviteUser } from '@/config';
import Protected from '@/components/protected';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CircleUser } from 'lucide-react';

export const runtime = 'edge';

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
                  <CircleUser />
                  <span className="text-md font-medium text-gray-700">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
    {/* <Sidebar orgid={params.org_id} /> */}
  </div>
  );
}

export default Protected(InvitePage);




