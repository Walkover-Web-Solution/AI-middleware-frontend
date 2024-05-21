import React from 'react';

const ServiceModelApiKeyComponent = ({ selectedService, handleService, services, selectedModel, handleModel, apiKey, SaveData }) => {
    return (
        <>
            <label className="form-control w-full ">
                <div className="label">
                    <span className="label-text">Service</span>
                </div>
                <select value={selectedService} onChange={handleService} className="select select-sm max-w-xs select-bordered">
                    <option disabled>Select a Service</option>
                    {/* Dynamically generate service options here */}
                    <option value="openai">openai</option>
                </select>
            </label>

            <label className="form-control w-full ">
                <div className="label">
                    <span className="label-text">Model</span>
                </div>
                <select value={selectedModel} onChange={handleModel} className="select select-sm max-w-xs select-bordered">
                    <option disabled>Select a Model</option>
                    {Object.entries(services?.[selectedService] || {}).map(([group, options]) => (
                        group !== 'models' && // Exclude the 'models' group
                        <optgroup label={group} key={group}>
                            {Array.isArray(options) ? options.map(option => (
                                <option key={option}>{option}</option>
                            )) : null}
                        </optgroup>
                    ))}
                </select>
            </label>

            <label className="form-control w-full ">
                <div className="label">
                    <span className="label-text">Provide Your API Key</span>
                </div>
                <input
                    type="text"
                    required
                    defaultValue={apiKey}
                    className="input w-full input-bordered max-w-xs input-sm"
                    onBlur={(e) => SaveData(e.target.value, "apikey")}
                />
            </label>
        </>
    );
};

export default ServiceModelApiKeyComponent;