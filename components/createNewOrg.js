import { createOrgAction } from '@/store/action/orgAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from './loadingSpinner';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import timezoneData from '@/utils/timezoneData';
import { ChevronDown } from 'lucide-react';

const CreateOrg = ({ handleSwitchOrg }) => {
    const [orgDetails, setOrgDetails] = useState({ name: '', about: '', timezone: 'Asia/Kolkata' });
    const [isLoading, setIsLoading] = useState(false);
    const [timezoneSearch, setTimezoneSearch] = useState('');
    const [filteredTimezones, setFilteredTimezones] = useState(timezoneData);
    const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
    const dispatch = useDispatch();
    const route = useRouter();

    useEffect(() => {
        // Filter timezones based on search term
        const filtered = timezoneData.filter(timezone => 
            timezone.identifier.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
            timezone.offSet.toLowerCase().includes(timezoneSearch.toLowerCase())
        );
        setFilteredTimezones(filtered);
    }, [timezoneSearch]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrgDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    }, []);

    const selectTimezone = (timezone) => {
        setOrgDetails(prev => ({ ...prev, timezone: timezone.identifier }));
        setShowTimezoneDropdown(false);
        setTimezoneSearch(''); // Reset search when selecting
    };

    const createOrgHandler = useCallback(async (e) => {
        e.preventDefault();
        const { name, about, timezone } = orgDetails;
        setIsLoading(true);
        try {
            const selectedTimezone = timezoneData.find(tz => tz.identifier === timezone);
            const dataToSend = {
                company: {
                    name,
                    meta: {
                        about,
                        identifier: selectedTimezone?.identifier,
                        offSet: selectedTimezone?.offSet,
                    },
                    timezone: selectedTimezone?.offSet
                },
            };

            dispatch(createOrgAction(dataToSend, (data) => {
                dispatch(userDetails());
                handleSwitchOrg(data.id, data.name);
                toast.success('Organization created successfully');
                route.push(`/org/${data.id}/agents`);
            }));
        } catch (error) {
            toast.error('Failed to create organization');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [orgDetails, dispatch, route]);

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <div className=""></div>
            <dialog id={MODAL_TYPE.CREATE_ORG_MODAL} className="modal">
                <div className="flex items-center justify-center min-h-screen">
                    <form className="modal-box relative p-5 bg-base-100 rounded-lg shadow-xl mx-4" onSubmit={createOrgHandler}>
                        <h3 className="font-bold text-lg mb-2">Create Organization</h3>
                        <label className='label-text mb-1'>Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={orgDetails.name}
                            onChange={handleChange}
                            placeholder="Organization Name"
                            className="input input-bordered w-full mb-4"
                            minLength={3}
                            maxLength={40}
                            required
                        />
                        <label className='label-text mb-1'>Description</label>
                        <textarea
                            id="message"
                            name="about"
                            rows="4"
                            value={orgDetails.about}
                            onChange={handleChange}
                            placeholder="About your Organization"
                            className="p-2.5 w-full text-sm textarea textarea-bordered"
                            minLength={10}
                            maxLength={400}
                        />
                        <label className='label-text mb-1'>Timezone *</label>
                        
                        <div className={`transition-all duration-300 ${showTimezoneDropdown ? 'mb-64' : 'mb-4'}`}>
                            <div className="relative">
                                <div 
                                    className={`relative w-full cursor-pointer ${showTimezoneDropdown ? 'border-t border-x border-base-content/30 rounded-t-lg rounded-x-lg' : 'border border-base-content/10 rounded-lg'} p-2  flex items-center justify-between`}
                                    onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                                >
                                    <span>
                                        {orgDetails.timezone ? 
                                            `${orgDetails.timezone} (${timezoneData.find(tz => tz.identifier === orgDetails.timezone)?.offSet})` : 
                                            "Select a timezone"}
                                    </span>
                                    <span className={`transition-transform duration-200 ${showTimezoneDropdown ? 'rotate-180' : ''}`}><ChevronDown size={16}/></span>
                                </div>
                                
                                {showTimezoneDropdown && (
                                    <div className={`absolute min-h-[250px] z-10 w-full bg-base-100 max-h-60 overflow-y-auto ${showTimezoneDropdown ? 'border-x border-b border-base-content/30 rounded-lg rounded-t-none rounded-x-lg' : ''}`}>
                                        <div className="sticky top-0 bg-base-100 p-2 z-20">
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Search timezone..."
                                                    className="input outline-none input-sm flex-grow py-2 px-3 text-sm"
                                                    value={timezoneSearch}
                                                    onChange={(e) => setTimezoneSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        {filteredTimezones.length === 0 ? (
                                            <div className="p-2 mx-auto w-full text-center text-base-content/30">No timezones found</div>
                                        ) : (
                                            filteredTimezones.map((timezone) => (
                                                <div 
                                                    key={timezone.identifier} 
                                                    className={`p-2 hover:bg-base-200 cursor-pointer ${orgDetails.timezone === timezone.identifier ? 'bg-primary text-white' : ''}`}
                                                    onClick={() => selectTimezone(timezone)}
                                                >
                                                    {timezone.identifier} ({timezone.offSet})
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" onClick={() => closeModal(MODAL_TYPE.CREATE_ORG_MODAL)} className="btn btn-sm">Close</button>
                            <button type="submit" className="btn btn-sm btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default CreateOrg;
