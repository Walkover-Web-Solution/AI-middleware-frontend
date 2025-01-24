'use client'
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateOrgTimeZone } from '@/store/action/orgAction';
import timezoneData from '@/utils/timezoneData';
import { Cog, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function SettingsPage({ params }) {
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata');
  const dispatch = useDispatch();

  const userDetails = useCustomSelector((state) =>
    state?.userDetailsReducer?.organizations?.[params.org_id]
  );
  console.log(userDetails)
  const handleContentOpen = (content) => {
    setContent(content);
    setIsContentOpen(true);
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
  };

  const handleSave = () => {
    const updatedOrgDetails = {
      ...userDetails,
      meta: selectedTimezone,
      timezone: selectedTimezone?.offSet
    };
    dispatch(updateOrgTimeZone(params.org_id, updatedOrgDetails))
  };

  const handleCancel = () => {
    setIsContentOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-4 ml-2">Workspace Settings</h1>
          </div>
          <div className="space-y-8 bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-4 ml-10">
              <h3 className="font-medium text-lg">Organization Details</h3>
              <div>
                <p className="text-md text-muted-foreground">
                  <span className='font-medium'> Domain: </span> ai.walkover.in
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-md text-muted-foreground cursor-pointer" onClick={() => handleContentOpen('Timezone')}>
                  <span className='font-medium'>Timezone: </span>{selectedTimezone.identifier}
                </p>
                <Pencil size={14} className="ml-2 cursor-pointer" onClick={() => handleContentOpen('Timezone')} />
              </div>
              {isContentOpen && content === 'Timezone' && (
                <div className="mt-4">
                  <label htmlFor="sidebarTimezone" className="text-md font-medium">
                    Select Timezone
                  </label>
                  <div className="relative ml-5">
                    <input
                      type="text"
                      placeholder="Search timezone..."
                      className="border border-gray-300 rounded p-2 w-full mb-2"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="overflow-y-auto max-h-[40vh] border border-gray-300 rounded">
                      {timezoneData
                        .filter((timezone) =>
                          timezone.identifier.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((timezone) => (
                          <div
                            key={timezone.identifier}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${timezone.identifier === selectedTimezone.identifier ? 'bg-gray-200' : ''}`}
                            onClick={() => handleTimezoneChange(timezone)}
                          >
                            {timezone.identifier} ({timezone.offSet})
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
                        Save
                      </button>
                      <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}