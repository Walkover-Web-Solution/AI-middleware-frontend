
function RadioButton({ name, label, defaultChecked = false }) {
    return (
        <div className="form-control">
            <label className="label gap-2 cursor-pointer">
                <input type="radio" name={name} className="radio checked:bg-blue-500" />
                <span className="label-text">{label}</span>
            </label>
        </div>
    );
}
function RadioGroup() {
    const options = [
        { label: "All Available space" },
        { label: "Left slider" },
        { label: "Right slider" },
        { label: "Pop over" },
        { label: "Popup" },
    ];

    return (
        <div className="flex items-center justify-start gap-2">
            {options.map((option, index) => (
                <RadioButton key={index} name="radio-10" label={option.label} defaultChecked={option.defaultChecked} />
            ))}
        </div>
    );
}

function DimensionInput({ placeholder, options }) {
    return (
        <div className="join">
            <input className="input input-bordered join-item input-sm" type="number" placeholder={placeholder} />
            <select className="select select-bordered join-item select-sm">
                {options.map((option, index) => (
                    <option key={index} value={option.value} disabled={option.disabled} selected={option.selected}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}



export default function FormSection() {
    return (
        <div className="flex flex-col gap-4 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Display</h3>
            <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">Button title </span>
                </div>
                <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs input-sm" />
            </label>
            {/* Repeat for other form controls as needed */}
            <div className="flex items-center justify-start gap-2">
                <DimensionInput
                    placeholder="Width"
                    options={[
                        { label: "Select unit", value: "", disabled: true, selected: true },
                        { label: "px", value: "px" },
                        { label: "%", value: "%" }
                    ]}
                />
                <DimensionInput
                    placeholder="Height"
                    options={[
                        { label: "Select unit", value: "", disabled: true, selected: true },
                        { label: "px", value: "px" },
                        { label: "%", value: "%" }
                    ]}
                />
            </div>
            <div className="flex items-center justify-start gap-2">
                <RadioGroup />
            </div>
        </div>
    );
}