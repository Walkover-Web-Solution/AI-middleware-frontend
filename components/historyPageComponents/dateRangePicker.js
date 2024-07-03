import { getHistoryAction } from '@/store/action/historyAction';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';



  // Helper function to get today's date with time set to 12:00 AM
  const getDefaultDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
  };

const DateRangePicker = ({ params }) => {
  const dispatch = useDispatch();
  const [startingDate, setStartingDate] = useState(getDefaultDate());
  const [endingDate, setEndingDate] = useState(getDefaultDate());

  const searchParams = useSearchParams();

  useEffect(() => {
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (start) setStartingDate(start);
    if (end) setEndingDate(end);
  }, [searchParams]);

  const handleDataChange = async () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('start', startingDate);
    newSearchParams.set('end', endingDate);
    newSearchParams.delete('thread_id'); // Clear the thread_id data
    const queryString = newSearchParams.toString();
    await dispatch(getHistoryAction(params.id, startingDate, endingDate));
    window.history.replaceState(null, '', `?${queryString}`);
  };
  const handleClear = () => {
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (!start && !end) return; // Do nothing if 'start' and 'end' are not in the URL
  
    setStartingDate('');
    setEndingDate('');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('start');
    newSearchParams.delete('end');
    newSearchParams.delete('thread_id');
    const queryString = newSearchParams.toString();
    window.history.replaceState(null, '', `?${queryString}`);
  };
  // ... existing code ...


  return (
    <div className="p-4 border-b sticky flex flex-col gap-2 top-0 bg-base-200 z-10">
      <div>
        <label htmlFor="from" className="block text-sm font-medium text-base-content ">From</label>
        <input
          id="from"
          type="datetime-local"
          className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Select date"
          value={startingDate}
          onChange={(e) => setStartingDate(e.target.value)}
          onClick={(e) => e.target.showPicker()}
        />
      </div>
      <div>
        <label htmlFor="to" className="block text-sm font-medium text-base-content ">To</label>
        <input
          id="to"
          type="datetime-local"
          className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Select date"
          value={endingDate}
          onChange={(e) => setEndingDate(e.target.value)}
          onClick={(e) => e.target.showPicker()}
        />
      </div>

      <button
        className='btn btn-primary btn-sm'
        onClick={handleDataChange}
        disabled={!startingDate || !endingDate} // Disable if either date is empty
      >
        Apply
      </button>
      <button className='btn btn-outline btn-sm' onClick={handleClear}>Clear</button>
    </div>
  );
};

export default DateRangePicker;