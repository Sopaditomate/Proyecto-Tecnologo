import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./address-autocomplete.css";

// Componente para autocompletar direcciones, geocodificar y calcular distancias
const AddressAutocomplete = ({
  onAddressSelect,
  onDistanceCalculated,
  warehouseAddress = "Cra. 129 #131-50, Suba, Bogotá",
}) => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  // Eliminamos los estados de distance y duration ya que no los mostraremos
  const [isLoading, setIsLoading] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Inicializar Google Places Autocomplete cuando el componente se monta
  useEffect(() => {
    // Verificar si el script de Google Maps ya está cargado
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
    } else {
      // Cargar el script de Google Maps si no está cargado
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    }

    return () => {
      // Limpiar autocomplete al desmontar
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  // Inicializar el autocompletado de Google Places
  const initAutocomplete = () => {
    if (inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "co" }, // Restringir a Colombia
        }
      );

      // Escuchar eventos de selección de lugares
      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }
  };

  // Manejar la selección de una dirección
  const handlePlaceSelect = () => {
    setIsLoading(true);
    const place = autocompleteRef.current.getPlace();

    if (place && place.formatted_address) {
      setSelectedAddress(place.formatted_address);

      // Si la API devuelve directamente las coordenadas
      if (place.geometry && place.geometry.location) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setCoordinates(coords);

        // Calcular la distancia una vez que tenemos las coordenadas
        calculateDistance(coords, place.formatted_address);

        // Notificar al componente padre
        if (onAddressSelect) {
          onAddressSelect({
            address: place.formatted_address,
            coordinates: coords,
          });
        }
      } else {
        // Si no hay coordenadas, usar Geocoding API
        geocodeAddress(place.formatted_address);
      }
    }
  };

  // Convertir dirección en coordenadas usando Geocoding API
  const geocodeAddress = (address) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const coords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };

        setCoordinates(coords);

        // Calcular la distancia una vez que tenemos las coordenadas
        calculateDistance(coords, address);

        // Notificar al componente padre
        if (onAddressSelect) {
          onAddressSelect({
            address,
            coordinates: coords,
          });
        }
      } else {
        console.error("Geocoding error:", status);
        setIsLoading(false);
      }
    });
  };

  // Calcular distancia usando Distance Matrix API
  const calculateDistance = (destinationCoords, destinationAddress) => {
    const service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [warehouseAddress],
        destinations: [destinationAddress],
        travelMode: "DRIVING",
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setIsLoading(false);

        if (status === "OK" && response.rows[0].elements[0].status === "OK") {
          // Marcar la dirección como válida
          setIsValidAddress(true);

          const distanceResult = response.rows[0].elements[0].distance;
          const durationResult = response.rows[0].elements[0].duration;

          // Notificar al componente padre sin mostrar datos de distancia/tiempo
          if (onDistanceCalculated) {
            onDistanceCalculated({
              distanceValue: distanceResult.value, // en metros
              durationValue: durationResult.value, // en segundos
              isValid: true,
            });
          }
        } else {
          // Marcar la dirección como inválida
          setIsValidAddress(false);
          console.error("Error calculating distance:", status);

          // Notificar al componente padre que la dirección es inválida
          if (onDistanceCalculated) {
            onDistanceCalculated({
              isValid: false,
            });
          }
        }
      }
    );
  };

  return (
    <div className="address-autocomplete">
      <div className="form-group">
        <label htmlFor="address-input">Dirección de entrega</label>
        <input
          id="address-input"
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Ingresa tu dirección"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <span>Calculando...</span>
        </div>
      )}
    </div>
  );
};

AddressAutocomplete.propTypes = {
  onAddressSelect: PropTypes.func,
  onDistanceCalculated: PropTypes.func,
  warehouseAddress: PropTypes.string,
};

export default AddressAutocomplete;
