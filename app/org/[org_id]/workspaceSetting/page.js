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
    <div className="flex overflow-hidden">
      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-extrabold text-primary flex items-center gap-4 ml-2">Workspace Settings</h1>
          </div>
          <div className="space-y-8 bg-base-100 p-6 rounded-xl shadow-xl">
            <div className="space-y-6 ml-10">
              <h3 className="font-semibold text-xl text-base-content">Organization Details</h3>
              <div className="space-y-2">
                <p className="text-lg text-base-500">
                  <span className="font-semibold">Domain:</span> {userDetails?.domain || 'ai.walkover.in'}
                </p>
                <p className="text-lg text-base-500">
                  <span className="font-semibold">Name:</span> {userDetails?.name || 'N/A'}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Email:</span> {userDetails?.email || 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-lg text-base-500 cursor-pointer" onClick={handleContentOpen}>
                  <span className="font-semibold">Timezone:</span> {selectedTimezone?.identifier} ({selectedTimezone?.offSet})
                </p>
                <Pencil size={16} className="ml-2 cursor-pointer text-primary" onClick={handleContentOpen} />
              </div>
              {isContentOpen && (
                <div className="mt-6">
                  <label htmlFor="sidebarTimezone" className="text-lg font-semibold text-blue-800">
                    Select Timezone
                  </label>
                  <div className="relative ml-5">
                    <input
                      type="text"
                      placeholder="Search timezone..."
                      className="border border-gray-300 rounded-lg p-3 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="overflow-y-auto max-h-[40vh] border border-gray-300 rounded-lg">
                      {filteredTimezones.map((timezone) => (
                        <div
                          key={timezone.identifier}
                          onClick={() => handleTimezoneChange(timezone)}
                          className={`p-3 hover:bg-blue-100 cursor-pointer ${
                            timezone.identifier === selectedTimezone?.identifier ? 'bg-blue-200' : ''
                          }`}
                        >
                          {timezone.identifier} {timezone.offSet ? `(${timezone.offSet})` : ''}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button className="bg-primary text-base-100 px-5 py-2 rounded-lg" onClick={handleSave}>
                        Save
                      </button>
                      <button className="bg-base-300 px-5 py-2 rounded-lg" onClick={handleCancel}>
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