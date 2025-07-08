"use client";

import { useRef, useEffect, useState } from "react";
import "./address-autocomplete.css";

const AddressAutocomplete = ({
  value,
  onAddressSelect,
  disabled = false,
  className = "",
  placeholder = "Buscar dirección...",
  error,
  touched,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      } else {
        // Load Google Maps script
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initializeAutocomplete(); // Ensure it initializes only after loading
        script.onerror = (error) =>
          console.error("Error loading Google Maps script:", error);
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();

    // Limpiar clase al desmontar
    return () => {
      document.body.classList.remove("address-dropdown-open");
      if (autocompleteRef.current && window.google?.maps) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [disabled]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    // Ensure the Autocomplete is initialized after Google Maps is ready
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "co" },
        fields: ["formatted_address", "geometry"],
      }
    );

    // Show the dropdown when the input gets focus
    inputRef.current.addEventListener("focus", () => {
      document.body.classList.add("address-dropdown-open");
    });

    // Hide the dropdown when the input loses focus
    inputRef.current.addEventListener("blur", () => {
      setTimeout(() => {
        document.body.classList.remove("address-dropdown-open");
      }, 300);
    });

    autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (place && place.formatted_address) {
      setIsLoading(true);

      // Call the parent callback with the selected address
      onAddressSelect({
        address: place.formatted_address,
        coordinates: place.geometry
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
          : null,
      });

      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    // Allow manual typing
    onAddressSelect({ address: e.target.value });
  };

  const getInputClassName = () => {
    let classes = "form-control";
    if (className) classes += ` ${className}`;
    if (touched && error) classes += " input-error";
    if (touched && !error && value) classes += " input-success";
    return classes;
  };

  return (
    <div className="address-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder={placeholder}
        className={getInputClassName()}
        autoComplete="off"
      />
      {isLoading && (
        <div className="loading-indicator">Calculando ubicación...</div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
