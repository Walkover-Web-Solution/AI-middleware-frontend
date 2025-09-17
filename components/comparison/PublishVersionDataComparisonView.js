import React, { useMemo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { isEqual } from 'lodash';
import { useCustomSelector } from '@/customHooks/customSelector';
import { DIFFERNCE_DATA_DISPLAY_NAME } from '@/jsonFiles/bridgeParameter';

const PublishVersionDataComparisonView = ({ oldData, newData, params }) => {

  const {apikeyData, functionData, knowledgeBaseData} = useCustomSelector((state) => ({
    apikeyData: state?.bridgeReducer?.apikeys[params.org_id] || [],
    functionData: state?.bridgeReducer?.org[params.org_id]?.functionData || {},
    knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params.org_id] || []
  }));

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'added':
        return <span className="badge badge-success flex items-center gap-1 text-white"><Check size={12} /> Added</span>;
      case 'removed':
        return <span className="badge badge-error flex items-center gap-1 text-white"><X size={12} /> Removed</span>;
      case 'changed':
        return <span className="badge badge-warning flex items-center gap-1 text-white"><AlertCircle size={12} /> Changed</span>;
      default:
        return null;
    }
  };

  // Function to deeply compare objects and find differences
  const findDifferences = (obj1, obj2, path = '') => {
    if (!obj1 || !obj2) {
      return { [path]: { oldValue: obj1, newValue: obj2, status: 'changed' } };
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      if (obj1 !== obj2) {
        return { [path]: { oldValue: obj1, newValue: obj2, status: 'changed' } };
      }
      return {};
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (isEqual(obj1, obj2)) {
        return {};
      }
      return { [path]: { oldValue: obj1, newValue: obj2, status: 'changed' } };
    }

    const allKeys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];
    const differences = {};

    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Key exists only in obj1
      if (!(key in obj2)) {
        differences[currentPath] = { oldValue: obj1[key], newValue: undefined, status: 'removed' };
        return;
      }
      
      // Key exists only in obj2
      if (!(key in obj1)) {
        differences[currentPath] = { oldValue: undefined, newValue: obj2[key], status: 'added' };
        return;
      }
      
      // Both have the key, check if values are different
      if (typeof obj1[key] === 'object' && obj1[key] !== null && 
          typeof obj2[key] === 'object' && obj2[key] !== null) {
        // Recursively compare nested objects
        const nestedDifferences = findDifferences(obj1[key], obj2[key], currentPath);
        Object.assign(differences, nestedDifferences);
      } else if (!isEqual(obj1[key], obj2[key])) {
        differences[currentPath] = { 
          oldValue: obj1[key], 
          newValue: obj2[key], 
          status: 'changed' 
        };
      }
    });

    return differences;
  };

  // Calculate differences between oldData and newData
  const differences = useMemo(() => findDifferences(oldData, newData), [oldData, newData]);

  // Flatten the differences structure for direct display
  const flattenedDifferences = useMemo(() => {
    return Object.entries(differences).map(([path, diff]) => {
      return {
        path,
        ...diff,
        displayPath: path.split('.').join(' › ')
      };
    });
  }, [differences]);

  // Format value for display
  const formatValue = (value, key) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-400 italic">No Data Added</span>;
    }
    
    if (key.split('.')[0] === 'apikey_object_id') {
      if (typeof value === 'object') {
        return Object.entries(value).map(([service, id]) => {
          const apiKey = apikeyData?.find(item => item._id === id);
          return <div key={service}>{service}: {apiKey?.name || id}</div>;
        });
      }
      return apikeyData?.find(item => item._id === value)?.name || value;
    }
    
    if (key.split('.')[0] === 'function_ids') {
      if (Array.isArray(value) && value.length > 0) {
        const functionItems = Object.values(functionData || {}).filter(item => value.includes(item?._id));
        if (functionItems.length > 0) {
          return functionItems.map(item => item?.endpoint_name || item?._id).join(', ');
        }
      }
      return JSON.stringify(value);
    }
    
    if (key.split('.')[0] === 'doc_ids') {
      if (Array.isArray(value) && value.length > 0) {
        const kbItems = knowledgeBaseData?.filter(item => value.includes(item?._id));
        if (kbItems?.length > 0) {
          return kbItems.map(item => item?.name || item?._id).join(', ');
        }
      }
      return JSON.stringify(value);
    }
    
    if (typeof value === 'object') {
      try {
        return <pre className="text-xs whitespace-pre-wrap break-all max-h-40 overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
      } catch (e) {
        return <span className="text-red-500">[Complex Object]</span>;
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? <span className="text-green-500">true</span> : <span className="text-red-500">false</span>;
    }
    
    return String(value);
  }

  const hasDifferences = Object.keys(differences).length > 0;

  const categorizedDifferences = useMemo(() => {
    const categories = {};
    
    flattenedDifferences.forEach(diff => {
      const category = diff.path.split('.')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(diff);
    });
    
    return categories;
  }, [flattenedDifferences]);

  return (
    <div className="bg-base-100 max-h-[70vh] overflow-auto">
      {!hasDifferences ? (
        <div className="alert alert-success">
          <Check />
          <span>No differences found between the data sets.</span>
        </div>
      ) : (
        <>
          <div className="divider"></div>
          {Object.entries(categorizedDifferences).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h4 className="font-semibold text-lg mb-3">{DIFFERNCE_DATA_DISPLAY_NAME(category)}</h4>
              <div className="space-y-4">
                {items.map(({ path, oldValue, newValue, status }) => (
                  <div key={path} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="card-title text-sm">
                          {DIFFERNCE_DATA_DISPLAY_NAME(path.split('.')[path.split('.').length - 1 || 0])}
                        </h5>
                        {getStatusBadge(status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Current Value:</div>
                          <div className="bg-base-300 p-3 rounded text-sm">
                            {formatValue(oldValue, path)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Updated Value:</div>
                          <div className="bg-base-300 p-3 rounded text-sm">
                            {formatValue(newValue, path)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PublishVersionDataComparisonView;
