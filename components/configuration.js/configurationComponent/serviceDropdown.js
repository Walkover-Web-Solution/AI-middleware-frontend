import { useCustomSelector } from "@/customSelector/customSelector";
import { useEffect, useState } from "react";

export default function ServiceDropdown({ params }) {
    const [selectedService, setSelectedService] = useState('');



    const handleService = (e) => {
        setSelectedService(e.target.value);
    }
    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    useEffect(() => {
        if (bridge) {
            setSelectedService(bridge?.service)
        }
    }, [bridge])

    return (
        <div>
            <label className="form-control w-full ">
                <div className="label">
                    <span className="label-text">Service</span>
                </div>
                <select value={selectedService} onChange={handleService} className="select select-sm max-w-xs  select-bordered">
                    <option disabled selected>Select a Service</option>
                    <option value="google">google</option>
                    {/* <option value="mistral">mistral</option> */}
                    {/* <option value="cohere">cohere</option> */}
                    <option value="openai">openai</option>
                </select>
            </label>

        </div>
    );
}

