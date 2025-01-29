'use client';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateOrgTimeZone } from '@/store/action/orgAction';
import timezoneData from '@/utils/timezoneData';
import { Pencil } from 'lucide-react';
import React, { useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

export default function SettingsPage({ params }) {
  const dispatch = useDispatch();
  const userDetails = useCustomSelector((state) =>
    state?.userDetailsReducer?.organizations?.[params.org_id]
  );

  const [isContentOpen, setIsContentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(() =>
    timezoneData.find((tz) => tz.identifier === userDetails?.meta?.identifier)
  );

  
  const filteredTimezones = useMemo(() => {
    return timezoneData.filter((timezone) =>
      timezone.identifier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  
  const handleContentOpen = useCallback(() => {
    setIsContentOpen(true);
  }, []);

  
  const handleTimezoneChange = useCallback((timezone) => {
    setSelectedTimezone(timezone);
  }, []);


  const handleSave = useCallback(async () => {
    const updatedOrgDetails = {
      ...userDetails,
      meta: selectedTimezone,
      timezone: selectedTimezone?.offSet,
    };
    try {
      await dispatch(updateOrgTimeZone(params.org_id, updatedOrgDetails));
      setIsContentOpen(false);
    } catch (error) {
      console.error('Failed to update timezone:', error);
    }
  }, [dispatch, params.org_id, selectedTimezone, userDetails]);


  const handleCancel = useCallback(() => {
    setSelectedTimezone(timezoneData.find((tz) => tz.identifier === userDetails?.meta?.identifier));
    setIsContentOpen(false);
  }, [userDetails?.meta?.identifier]);

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
                  <span className="font-medium">Domain:</span> ai.walkover.in
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-md text-muted-foreground cursor-pointer" onClick={handleContentOpen}>
                  <span className="font-medium">Timezone:</span> {selectedTimezone?.identifier} ({selectedTimezone?.offSet})
                </p>
                <Pencil size={14} className="ml-2 cursor-pointer" onClick={handleContentOpen} />
              </div>
              {isContentOpen && (
                <div className="mt-4">
                  <label htmlFor="sidebarTimezone" className="text-md font-medium">
                    Select Timezone
                  </label>
                  <div className="relative ml-5">
                    <input
                      type="text"
                      placeholder="Search timezone..."
                      className="border border-gray-300 rounded p-2 w-full mb-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="overflow-y-auto max-h-[40vh] border border-gray-300 rounded">
                      {filteredTimezones.map((timezone) => (
                        <div
                          key={timezone.identifier}
                          onClick={() => handleTimezoneChange(timezone)}
                          className={`p-2 hover:bg-gray-100 cursor-pointer ${
                            timezone.identifier === selectedTimezone?.identifier ? 'bg-gray-200' : ''
                          }`}
                        >
                          {timezone.identifier} {timezone.offSet ? `(${timezone.offSet})` : ''}
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