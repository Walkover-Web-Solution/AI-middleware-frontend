"use client";
import { getInvitedUsers, inviteUser } from '@/config';
import Protected from '@/components/protected';
import { useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import { UserCircleIcon } from '@/components/Icons';
import InfiniteScroll from 'react-infinite-scroll-component';

export const runtime = 'edge';

function InvitePage({ params }) {
  const [email, setEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isInviting, setIsInviting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchInvitedMembers(1, true);
  }, []);

  const fetchInvitedMembers = async (pageNum = 1, reset = false) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await getInvitedUsers({
        page: pageNum,
        limit: ITEMS_PER_PAGE
      });

      if (response.status === 200 && response.data) {
        const newMembers = response.data.data.data;
        if (reset) {
          setInvitedMembers(newMembers);
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

  const filteredMembers = !query
    ? invitedMembers
    : invitedMembers.filter(member =>
      member.email.toLowerCase().includes(query.toLowerCase()) ||
      member.name.toLowerCase().includes(query.toLowerCase())
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
    if (!query) { // Only load more if not searching
      const nextPage = page + 1;
      fetchInvitedMembers(nextPage, false);
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
          <h2 className="text-xl font-semibold">
            Team Members ({invitedMembers.length})
          </h2>
          <input
            type="text"
            placeholder="Search members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-bordered w-96"
          />
        </div>

        {/* Members List - Scrollable Container */}
        <div id="scrollableDiv" className="h-[65vh] overflow-y-auto">
          <InfiniteScroll
            dataLength={filteredMembers.length}
            next={loadMoreMembers}
            hasMore={hasMore && !query}
            loader={
              <div className="text-center py-4">
                <span className="loading loading-spinner loading-md"></span>
                <span className="ml-2 text-base-content/70">Loading...</span>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="space-y-3 p-4">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <div
                    key={member.id || `member-${index}`}
                    className="flex items-center justify-between p-4 border border-base-200 rounded-box hover:bg-base-200"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircleIcon size={20} className="text-base-content/70" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-base-content/70">{member.email}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCircleIcon size={48} className="text-base-content/30 mx-auto mb-4" />
                  {invitedMembers.length === 0 ? (
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
    </div>
  );
}

export default Protected(InvitePage);