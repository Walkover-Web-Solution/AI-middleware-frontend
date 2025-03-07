import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL, SERVICES } from "@/jsonFiles/bridgeParameter";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function ServiceDropdown({ params }) {
  const { bridgeType, service } = useCustomSelector((state) => ({
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    service:
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
        params?.version
      ]?.service,
  }));
  const [selectedService, setSelectedService] = useState(service);
  const dispatch = useDispatch();

  useEffect(() => {
    if (service) {
      setSelectedService(service);
    }
  }, [service]);

  const handleServiceChange = useCallback(
    (e) => {
      const newService = e.target.value;
      const defaultModel = DEFAULT_MODEL?.[newService];
      setSelectedService(newService);
      dispatch(
        updateBridgeVersionAction({
          bridgeId: params.id,
          versionId: params.version,
          dataToSend: {
            service: newService,
            configuration: { model: defaultModel },
          },
        })
      );
    },
    [dispatch, params.id, params.version]
  );

  const isDisabled = bridgeType === "batch" && service === "openai";

  return (
    <div className="w-full max-w-[150px]">
      <div className="label">
        <span className="label-text font-medium">Service</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="dropdown dropdown-bottom w-full max-w-[200px]">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-sm btn-bordered w-full justify-between capitalize ${
              isDisabled ? "btn-disabled" : ""
            }`}
          >
            {selectedService || "Select a Service"}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
          >
            {SERVICES.map((service, index) => (
              <li key={index}>
                <a
                  onClick={() =>
                    !isDisabled &&
                    handleServiceChange({ target: { value: service } })
                  }
                  className="capitalize"
                >
                  {service}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {isDisabled && (
          <div
            role="alert"
            className="alert p-2 flex items-center gap-2 w-auto"
          >
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span className="label-text-alt text-xs leading-tight">
              Batch API is only applicable for OpenAI services.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
export default ServiceDropdown;
