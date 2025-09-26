"use client";
import { getInvitedUsers, inviteUser, removeUsersFromOrg } from '@/config';
import Protected from '@/components/protected';
import { useCallback, useEffect, useState, useMemo} from 'react';
import { toast } from 'react-toastify';
import { TrashIcon, UserCircleIcon } from '@/components/Icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useCustomSelector } from '@/customHooks/customSelector';
import DeleteModal from '@/components/UI/DeleteModal';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';

export const runtime = 'edge';

function InvitePage({ params }) {
  const userEmailData = useCustomSelector((state) => state?.userDetailsReducer?.userDetails?.email)
  const [email, setEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isInviting, setIsInviting] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [memberToDelete, setMemberToDelete] = useState();
  const ITEMS_PER_PAGE = 20;
  const [searchQuery, setSearchQuery] = useState('');

  // Create debounced function using useMemo to prevent recreation on every render
  const debouncedSearch = useMemo(() => {
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    return debounce((query) => {
      // Fetch members with the new search query
      fetchInvitedMembers(1, true, query);
    }, 500);
  }, []);

  useEffect(() => {
    fetchInvitedMembers(1, true);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Reset pagination state immediately
    setPage(1);
    setHasMore(true);
    
    // Call debounced search
    debouncedSearch(value);
  };

  const fetchInvitedMembers = async (pageNum = 1, reset = false, searchTerm = searchQuery) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await getInvitedUsers({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchTerm
      });
      if (response.status === 200 && response.data) {
        const newMembers = response.data.data.data;
        if (reset) {
          setInvitedMembers(newMembers);
          setTotalMembers(response?.data?.data?.totalEntityCount)
          setPage(1);
        } else {
          setInvitedMembers(prev => {
            return [...prev, ...newMembers];
          });
          setPage(pageNum);
        }
        
        const hasMoreData = newMembers.length === ITEMS_PER_PAGE;
        setHasMore(hasMoreData);
      } else {
        toast.error('Failed to fetch invited members.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching invited members.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    setIsInviting(true);
    
    try {
      const response = await inviteUser({ user: { email: email } });

      if (response.status === "success") {
        toast.success(`Invitation sent to ${email} successfully!`);
        setEmail('');
        setPage(1);
        setInvitedMembers([]);
        setHasMore(true);
        fetchInvitedMembers(1, true);
      } else {
        toast.error('Failed to send invitation.');
      }
    } catch (error) {
      toast.error('An error occurred while sending the invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInviteSubmit();
    }
  };

  const loadMoreMembers = () => {
      const nextPage = page + 1;
      fetchInvitedMembers(nextPage, false);
    }
  

  const deleteUser = async (member) => {
    try {
      const response = await removeUsersFromOrg(member?.id)
        if(response)
        {
          setInvitedMembers([]);
          fetchInvitedMembers(1,true);
        }
    } catch (error) {
      toast.error('An error occurred while deleting member.');
    } finally {
      closeModal(MODAL_TYPE.DELETE_MODAL)
    }
  };

  return (
    <div className="mx-auto p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Invite Team Members</h1>
        <p className="text-base-content/70">Add new team members to your Organization</p>
      </div>

      {/* Invite Form */}
      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter email address"
            className="input input-bordered w-full"
          />
          <button
            onClick={handleInviteSubmit}
            disabled={isInviting}
            className="btn btn-primary"
          >
            {isInviting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 max-h-[75vh]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-semibold">
            Team Members ({totalMembers})
          </h2>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search members..."
            className="input input-bordered w-96"
          />
        </div>

        {/* Members List - Scrollable Container */}
        <div id="scrollableDiv" className="h-[65vh] overflow-y-auto">
          <InfiniteScroll
            dataLength={invitedMembers.length}
            next={loadMoreMembers}
            hasMore={hasMore}
            loader={
              <div className="text-center py-4">
                <span className="loading loading-spinner loading-md"></span>
                <span className="ml-2 text-base-content/70">Loading...</span>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="space-y-3 p-4">
              {invitedMembers.length > 0 ? (
                invitedMembers.map((member, index) => (
                  <div
                    key={member.id || `member-${index}`}
                    className="flex items-center justify-between p-2 border border-base-200 rounded-box hover:bg-base-200"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircleIcon size={20} className="text-base-content/70" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-base-content/70">{member.email}</div>
                      </div>
                    </div>
                    <div>
                    {userEmailData !==member?.email && <button
                      onClick={() => {setMemberToDelete(member); openModal(MODAL_TYPE.DELETE_MODAL)}}
                      className="btn-sm text-error"
                    >
                      <TrashIcon size={20}/>
                    </button>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCircleIcon size={48} className="text-base-content/30 mx-auto mb-4" />
                  {invitedMembers.length === 0 && searchQuery===''? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No members yet</h3>
                      <p className="text-base-content/70">Invite your first team member to get started</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No matching members</h3>
                      <p className="text-base-content/70">Try a different search term</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>
      <DeleteModal onConfirm={deleteUser} item={memberToDelete} description={`Are you sure you want to remove the "${memberToDelete?.name}" from your organization.`} title='Remove User From Organization' />
    </div>
  );
};

export default Protected(InvitePage);