import React, { useState, useEffect, useRef } from 'react';
import Modal from '../UI/Modal';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { toast } from 'react-toastify';
import { getInvitedUsers, inviteUser } from '@/config';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { UserCircleIcon } from '@/components/Icons';
import { UserPlus2 } from 'lucide-react';

const AccessManagementModal = ({ agent }) => {
  // agent.users contains the users already added to this agent
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [agentMembers, setAgentMembers] = useState([]);
  
  // Ref for debounce timer
  const debounceTimerRef = useRef(null);
  const isTypingRef = useRef(false);


  // Cleanup function for debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load initial data and extract agent members when agent prop changes
  useEffect(() => {
    // Set static members for demonstration
    const staticMembers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'editor' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor' },
      { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
    ];
    
    if (agent && agent.users) {
      setAgentMembers(agent.users || []);
    } else {
      // Use static members if no agent users
      setAgentMembers(staticMembers);
    }
    
    // Load initial members list
    const loadInitialMembers = async () => {
      setIsLoading(true);
      try {
        const response = await getInvitedUsers({
          page: 1,
          limit: 20
        });
        
        if (response.status === 200 && response.data) {
          setMembers(response.data.data.data || []);
        }
      } catch (error) {
        console.error('Error loading initial members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMembers();
  }, [agent]);

  const handleClose = () => {
    setEmailInput('');
    setFoundUser(null);
    closeModal(MODAL_TYPE.ACCESS_MANAGEMENT_MODAL);
  };
  
  // Function to search for user by email
  const searchUserByEmail = async () => {
    if (!emailInput.trim()) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSearching(true);
    setFoundUser(null);
    setSearchResults([]);
    
    try {
      // Search for user in the organization
      const response = await getInvitedUsers({
        page: 1,
        limit: 20, // Increased limit to get more results
        search: emailInput
      });
      
      if (response.status === 200 && response.data) {
        const users = response.data.data.data || [];
        
        // Store all matching users
        setSearchResults(users);
        
        // Find exact match by email if exists
        const exactMatch = users.find(user => 
          user.email.toLowerCase() === emailInput.toLowerCase()
        );
        
        if (exactMatch) {
          setFoundUser(exactMatch);
        }
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      toast.error('Failed to search for user');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to remove user from agent
  const removeUserFromAgent = async (userId) => {
    if (!agent || !userId) {
      toast.error('Missing required information');
      return;
    }
    
    // Check if user exists in agent members
    if (!agentMembers.some(member => member.id === userId)) {
      toast.error('User is not a member of this agent');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Create payload with user ID and add:false to remove
      const dataToSend = {
        users: {
          "id": userId,
          "add": false
        }
      };
      
      const res = await dispatch(updateBridgeAction({ 
        bridgeId: agent._id, 
        dataToSend 
      }));
      
      if (res?.success) {
        toast.success('User removed from agent successfully');
        
        // Update local state to reflect the removal
        setAgentMembers(prev => prev.filter(member => member.id !== userId));
      } else {
        toast.error('Failed to remove user from agent');
      }
    } catch (error) {
      console.error('Error removing user from agent:', error);
      toast.error('An error occurred while removing user');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Function to add user to agent (always as editor)
  const addUserToAgent = async (userId) => {
    if (!agent || !userId) {
      toast.error('Missing required information');
      return;
    }
    
    // Check if user is already added to the agent
    if (agentMembers.some(member => member.id === userId)) {
      toast.info('User already has access to this agent');
      setEmailInput('');
      setFoundUser(null);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Create payload with user ID and add flag
      const dataToSend = {
        users: {
          "id": userId,
          "add": true
        }
      };
      
      const res = await dispatch(updateBridgeAction({ 
        bridgeId: agent._id, 
        dataToSend 
      }));
      
      if (res?.success) {
        toast.success('User added to agent successfully');
        
        // Update local state to show the new member immediately
        const newMember = { id: userId, role: 'editor' };
        setAgentMembers(prev => [...prev, newMember]);
        
        setEmailInput('');
        setFoundUser(null);
      } else {
        toast.error('Failed to add user to agent');
      }
    } catch (error) {
      console.error('Error adding user to agent:', error);
      toast.error('An error occurred while adding user');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Function to invite a new user
  const handleInviteUser = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsInviting(true);
    
    try {
      const response = await inviteUser({ user: { email: emailInput } });
      
      if (response.status === "success") {
        toast.success(`Invitation sent to ${emailInput} successfully!`);
        setEmailInput('');
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('An error occurred while sending the invitation');
    } finally {
      setIsInviting(false);
    }
  };
  
  // Handle email input change with auto search - with improved debounce
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    
    // Mark that user is typing
    isTypingRef.current = true;
    
    // Clear found user and search results if input is cleared
    if (!value.trim()) {
      setFoundUser(null);
      setSearchResults([]);
      return;
    }
    
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Don't do anything else for inputs less than 3 characters
    if (value.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    
    // Set a longer debounce to ensure user has completely stopped typing
    debounceTimerRef.current = setTimeout(() => {
      // User has stopped typing
      isTypingRef.current = false;
      
      // Only search if we have at least 3 characters
      if (value.trim().length >= 3) {
        searchMembers(value);
      } else {
        // Clear results if less than 3 characters
        setSearchResults([]);
      }
    }, 800); // Longer timeout to ensure user has stopped typing
  };
  
  // Search for members as user types
  const searchMembers = async (query) => {
    // Don't search if user is still typing
    if (isTypingRef.current) {
      return;
    }
    
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setFoundUser(null);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await getInvitedUsers({
        page: 1,
        limit: 20, // Increased limit to get more results
        search: query
      });
      
      // Don't update if user started typing again during API call
      if (isTypingRef.current) {
        return;
      }
      
      if (response.status === 200 && response.data) {
        const users = response.data.data.data || [];
        
        // Store all matching users
        setSearchResults(users);
        
        // If we find an exact match by email, set it as foundUser
        const exactMatch = users.find(user => 
          user.email.toLowerCase() === query.toLowerCase()
        );
        
        if (exactMatch) {
          setFoundUser(exactMatch);
        } else if (users.length === 1) {
          // If only one result, select it automatically
          setFoundUser(users[0]);
        } else if (users.length > 0) {
          // If multiple results but one matches the query closely
          const closestMatch = users.find(user => 
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.name?.toLowerCase().includes(query.toLowerCase())
          );
          
          if (closestMatch) {
            setFoundUser(closestMatch);
          }
        } else {
          // No results found
          setFoundUser(null);
        }
      }
    } catch (error) {
      console.error('Error searching for members:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to select a user from search results
  const selectUser = (user) => {
    setFoundUser(user);
    setEmailInput(user.email); // Fill the input with the selected user's email
  };
  
  // Handle key press in email input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      searchUserByEmail();
    }
  };


  // Map role name to display text
  const getRoleDisplayText = (roleName) => {
    switch(roleName?.toLowerCase()) {
      case 'owner':
        return 'Admin';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Editor';
      case 'view only':
        return 'View Only';
      default:
        return 'View Only';
    }
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.ACCESS_MANAGEMENT_MODAL}>
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Manage Access for {agent?.name || 'Agent'}
            </h2>
            <p className="text-sm text-base-content/70">
              Team Members
            </p>
          </div>
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-base-content/70 mb-4">
            Control who can access and modify this agent by assigning roles to team members.
          </p>
          
          {/* Email input with Add/Invite button */}
          <div className="bg-base-200 p-4 rounded-lg mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter user email..."
                  className="input input-bordered w-full pr-10"
                  disabled={isSearching || isInviting || isUpdating}
                />
              </div>
              
              {isSearching ? (
                <button className="btn btn-primary" disabled>
                  <span className="loading loading-spinner loading-xs"></span>
                  Searching...
                </button>
              ) : foundUser ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => addUserToAgent(foundUser.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <UserPlus2 size={16} className="mr-1" />
                      Add
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className="btn" 
                  onClick={searchUserByEmail}
                  disabled={!emailInput.trim()}
                >
                  Search
                </button>
              )}
            </div>
            
            {/* Show search results */}
            {emailInput.trim().length >= 3 && searchResults.length > 0 && (
              <div className="mt-3 border border-base-300 rounded-lg bg-base-100 max-h-60 overflow-y-auto">
                <ul className="menu p-0">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <button 
                        className={`flex items-start py-2 px-3 hover:bg-base-200 w-full text-left ${foundUser?.id === user.id ? 'bg-primary/10' : ''}`}
                        onClick={() => selectUser(user)}
                      >
                        <div className="flex items-center gap-2">
                          <UserCircleIcon size={20} className="text-base-content/70" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-base-content/70">{user.email}</div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Show searching indicator - only when not typing */}
            {isSearching && emailInput.trim().length >= 3 && !isTypingRef.current && (
              <div className="mt-3 p-3 border border-base-300 rounded-lg bg-base-100">
                <div className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="text-sm">Searching for members...</span>
                </div>
              </div>
            )}
            
            {/* Show no results message with invite button - only when not typing */}
            {!isSearching && emailInput.trim().length >= 3 && searchResults.length === 0 && !isTypingRef.current && (
              <div className="mt-3 p-3 border border-base-300 rounded-lg bg-base-100">
                <div className="text-center">
                  <p className="text-sm">No users found with email: <span className="font-medium">{emailInput}</span></p>
                  <button 
                    className="btn btn-outline btn-sm btn-primary mt-2"
                    onClick={handleInviteUser}
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : 'Invite User'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Users with Access to this Agent</h3>
          <div className="border border-base-200 rounded-lg">
            <div className="max-h-[50vh] overflow-y-auto">
              {agentMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2">
                  {agentMembers.map((agentMember) => (
                    <div
                      key={agentMember.id}
                      className="flex items-center gap-2 px-3 py-2 border border-base-200 rounded-full bg-base-100 hover:bg-base-200"
                    >
                      <UserCircleIcon size={18} className="text-base-content/70" />
                      <div className="flex flex-col">
                        <div className="font-medium text-sm">{agentMember.name || 'User'}</div>
                        <div className="text-xs text-base-content/70">{agentMember.email || agentMember.id}</div>
                      </div>
                      {/* Don't show remove button for admin/owner */}
                      {agentMember.role !== 'admin' && (
                        <button 
                          className="btn btn-ghost btn-xs btn-circle text-error ml-1" 
                          onClick={() => removeUserFromAgent(agentMember.id)}
                          disabled={isUpdating}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCircleIcon size={48} className="text-base-content/30 mx-auto mb-4" />
                  <p className="text-base-content/70">No members have been added to this agent yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleClose} className="btn btn-sm">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AccessManagementModal;
