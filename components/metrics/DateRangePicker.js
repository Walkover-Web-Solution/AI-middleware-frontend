import { useState } from 'react';

const DateRangePicker = ({ onDateRangeSelect, isOpen, onClose, initialStartDate, initialEndDate }) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeSelect(startDate, endDate);
      onClose();
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 shadow-xl w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Date Range</h3>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <div className="flex flex-col space-y-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered w-full"
                max={endDate || undefined}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <div className="flex flex-col space-y-2">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered w-full"
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={handleClear}
            className="btn btn-ghost"
          >
            Clear
          </button>
          <div className="space-x-2">
            <button 
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="btn btn-primary"
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
