import { useEffect } from "react";

export const useCloseSliderOnEsc = (setIsSliderOpen) => {
  useEffect(() => {
    const closeSliderOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("keydown", closeSliderOnEsc);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
    };
  }, [setIsSliderOpen]);
};

export const useHandleClickOutside = (sidebarRef, setIsSliderOpen) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef, setIsSliderOpen]);
};

export const truncate = (string = "", maxLength) => {
  return string.length > maxLength
    ? `${string.substring(0, maxLength - 3)}...`
    : string;
};

