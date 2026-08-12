import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Select from "react-select";
import api from "../../services/api";
import { toast } from "react-toastify";
import GoogleMap from "../../components/map/GoogleMap";
import Swal from "sweetalert2";

// Stripe Key
const stripePromise = loadStripe(
  "pk_test_51SPGj8DPTiiAKcUNtf2eTgmcU3nBau2dC0qDcexcf3hgPoMBN6ESFD8MU0d2awkXAzfMEPylitgJXsCXtvjdFCDK00qfKK9LG6"
);

function PlaceAutocompleteInput({
  onPlaceSelected,
  onInputChange,
  onClearAddress,
}: {
  onPlaceSelected: (place: any) => void;
  onInputChange: (next: string) => void;
  onClearAddress: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pacRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    if (!(window as any).google?.maps?.places) return;

    const PlaceAutocompleteElementClass =
      (window as any).google?.maps?.places?.PlaceAutocompleteElement;

    const pacEl = PlaceAutocompleteElementClass
      ? new PlaceAutocompleteElementClass()
      : document.createElement("gmp-place-autocomplete");

    pacEl.setAttribute("included-region-codes", "au");
    hostRef.current.appendChild(pacEl);
    pacRef.current = pacEl;

    const findInput = setInterval(() => {
      const input =
        pacEl.inputElement ||
        pacEl.shadowRoot?.querySelector("input") ||
        pacEl.querySelector("input");

      if (input && !inputRef.current) {
        inputRef.current = input;

        // Detect clear click
        input.addEventListener("input", () => {
          const value = input.value.trim();
          if (!value) {
            console.log("🧹 Address cleared by user (close icon)");
            onInputChange("");
            onPlaceSelected(null);
            onClearAddress();
          }
        });

        clearInterval(findInput);
      }
    }, 300);

    // handle place select
    const onSelect = async (ev: any) => {
      const placePrediction =
        ev?.placePrediction ?? ev?.detail?.placePrediction ?? ev?.detail?.place ?? null;
      if (!placePrediction) return;

      const placeObj = placePrediction.toPlace ? placePrediction.toPlace() : placePrediction;
      if (placeObj.fetchFields) {
        await placeObj.fetchFields({
          fields: ["addressComponents", "formattedAddress", "location"],
        });
      }

      const formatted_address =
        placeObj.formattedAddress ?? placeObj.displayName ?? placeObj.formatted_address ?? "";

      onInputChange(formatted_address);
      onPlaceSelected({
        address_components: (placeObj.addressComponents || []).map((c: any) => ({
          long_name: c.longText ?? c.longName ?? c.long_name,
          short_name: c.shortText ?? c.shortName ?? c.short_name,
          types: c.types ?? c.type ?? [],
        })),
        formatted_address,
        geometry: {
          location: {
            lat: () =>
              typeof placeObj.location?.lat === "function"
                ? placeObj.location.lat()
                : placeObj.location?.lat,
            lng: () =>
              typeof placeObj.location?.lng === "function"
                ? placeObj.location.lng()
                : placeObj.location?.lng,
          },
        },
      });
    };

    pacEl.addEventListener("gmp-select", onSelect);

    return () => {
      clearInterval(findInput);
      pacEl.removeEventListener("gmp-select", onSelect);
      inputRef.current?.removeEventListener("input", () => {});
      try {
        pacEl.remove();
      } catch {}
      pacRef.current = null;
      inputRef.current = null;
    };
  }, []);

  return <div ref={hostRef} />;
}

function RegisterFormInner() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familySize, setFamilySize] = useState<number | "">("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [stateId, setStateId] = useState<number | "">("");
  const [countryId, setCountryId] = useState<number | "">("");
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("success");
  const [error, setError] = useState("");

  const defaultCenter = useMemo(() => ({ lat: -33.8688, lng: 151.2093 }), []);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);
  const advancedMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    api.get("/api/store/countries/options").then((res) => {
      setCountries(res.data);
      const aus = res.data.find((c: any) => c.name === "Australia" || c.code === "AU");
      if (aus) setCountryId(aus.id);
    });
  }, []);

  useEffect(() => {
    if (countryId) {
      api.get(`/api/store/states/options?country_id=${countryId}`).then((res) => setStates(res.data));
    } else {
      setStates([]);
      setStateId("");
    }
  }, [countryId]);

  // ---- Place selected ----
  const onPlaceSelected = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);

    let cityVal = "";
    let postal = "";
    let stateName = "";

    for (const comp of place.address_components || []) {
      if (comp.types.includes("locality")) cityVal = comp.long_name;
      if (comp.types.includes("postal_code")) postal = comp.long_name;
      if (comp.types.includes("administrative_area_level_1")) stateName = comp.long_name;
    }
    setSuburb(cityVal);
    setPostalCode(postal);

    const foundState = states.find((s) =>
      s.name.toLowerCase().includes(stateName.toLowerCase())
    );
    if (foundState) setStateId(foundState.id);


    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMapCenter({ lat, lng });

      if (mapRef.current) {
        const pos = { lat, lng };
        const pinElement = document.createElement("div");
        pinElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" viewBox="0 0 24 24">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
          </svg>
        `;

        if (advancedMarkerRef.current) {
          advancedMarkerRef.current.map = null;
        }

        advancedMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: pos,
          content: pinElement,
        });

        mapRef.current.setCenter(pos);
      }
    }

    const addr = place.formatted_address || "";
    setAddress1(addr);
  };

  useEffect(() => {
    if (selectedPlace && states.length > 0) {
      onPlaceSelected(selectedPlace);
    }
  }, [states, selectedPlace]);

  // ---- Handle Register ----
  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!stripe || !elements) return;

    try {
      if (!latitude || !longitude) {
        toast.error("Please select a valid address.");
        setLoading(false);
        return;
      }

      // Stripe SetupIntent (Card Verification)
      const { data } = await api.get("/api/stripe/setup-intent");
      const clientSecret = data.client_secret;

      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: { name: `${firstName} ${lastName}`, email, phone },
        },
      });

      if (error) {
        setError(error.message || "Card verification failed");
        setLoading(false);
        return;
      }

      // Check ZonePartner availability
      const checkRes = await api.post("/api/store/check-zonepartner", {
        latitude,
        longitude,
      });

      let becomeZone = false;

      if (!checkRes.data.zone_found) {
        const result = await Swal.fire({
          title: "No Freshleader Found",
          text: "This address has no Freshleaders. Do you want to become a Freshleader?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, become Freshleader",
          cancelButtonText: "No, register as Customer",
          reverseButtons: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        });

        becomeZone = result.isConfirmed;
      } else {
        becomeZone = false;
      }

      // Register user
      const res = await api.post("/api/store/register", {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        password,
        family_size: familySize === "" ? null : Number(familySize),
        address_line1: address1,
        address_line2: address2,
        city: suburb,
        state_id: stateId,
        country_id: countryId,
        postal_code: postalCode,
        latitude,
        longitude,
        stripe_payment_method_id: setupIntent.payment_method,
        become_zonepartner: becomeZone,
      });

      if (res.data.status) {
        await Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Your account has been created successfully.",
          timer: 2500,
          showConfirmButton: false,
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: res.data.message || "Something went wrong during registration.",
        });
      }
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.error("Validation error. Please check fields.");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderRadius: "0.5rem",
      minHeight: "50px",
    }),
  };

const handleAddressClear = () => {
 console.log(" handleAddressClear() called");

  setAddress1("");
  setSuburb("");
  setPostalCode("");
  setLatitude("");
  setLongitude("");
  setSelectedPlace(null);
  setStateId("");

  if (advancedMarkerRef.current) {
    advancedMarkerRef.current.map = null;
    advancedMarkerRef.current = null;
  }
  setMapCenter(defaultCenter);
  setTimeout(() => setIsLoaded(true), 200);
};

useEffect(() => {
  console.log("address1 changed:", address1);
}, [address1]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 " style={{ width: "900px" }}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="space-y-6"
        >
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>First Name<span className="text-red-500">*</span></label>
              <input type="text" 
                     value={firstName} 
                     onChange={(e) => setFirstName(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.first_name && <p className="text-red-500">{errors.first_name[0]}</p>}
            </div>

            <div>
              <label>Last Name<span className="text-red-500">*</span></label>
              <input type="text" 
                     value={lastName} 
                     onChange={(e) => setLastName(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              {errors.last_name && <p className="text-red-500">{errors.last_name[0]}</p>}
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Phone<span className="text-red-500">*</span></label>
              <input type="tel" 
                     value={phone} 
                     onChange={(e) => setPhone(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              {errors.phone && <p className="text-red-500">{errors.phone[0]}</p>}
            </div>

            <div>
              <label>Email<span className="text-red-500">*</span></label>
              <input type="email" 
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              {errors.email && <p className="text-red-500">{errors.email[0]}</p>}
            </div>
          </div>

          {/* Password + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Password<span className="text-red-500">*</span></label>
              <input type="password" 
                     value={password} 
                     onChange={(e) => setPassword(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            <div>
              <label>Country</label>
              <Select
                options={countries.map((c) => ({ value: c.id, label: c.name }))}
                value={countries.find((c) => c.id === countryId) ? { value: countryId, label: countries.find((c) => c.id === countryId)?.name } : null}
                onChange={(selected) => setCountryId(selected ? Number(selected.value) : "")}
                placeholder="Select Country"
                styles={customStyles}
              />
            </div>
          </div>

          {/* Address Lines 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Address Line 1 (searchable)<span className="text-red-500">*</span></label>
              <PlaceAutocompleteInput
                onInputChange={setAddress1}
                onPlaceSelected={onPlaceSelected}
                onClearAddress={handleAddressClear}
              />
            </div>
            <div>
              <label>Address Line 2</label>
              <input type="text" 
                     value={address2} 
                     onChange={(e) => setAddress2(e.target.value)} 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>

          {/* State + Suburb */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label>Suburb<span className="text-red-500">*</span></label>
              <input type="text" 
                     value={suburb} 
                     onChange={(e) => setSuburb(e.target.value)} 
                     required 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                     readOnly 
              />
            </div>

            <div>
              <label>State</label>
              <Select
                options={states.map((s) => ({ value: s.id, label: s.name }))}
                value={states.find((s) => s.id === stateId) ? { value: stateId, label: states.find((s) => s.id === stateId)?.name } : null}
                onChange={(selected) => setStateId(selected ? Number(selected.value) : "")}
                placeholder=""
                styles={customStyles}
                isDisabled
              />
            </div>
          </div>

          {/* Postal Code + Card Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Postal Code</label>
              <input type="text" 
                     value={postalCode} 
                     onChange={(e) => setPostalCode(e.target.value)} 
                     className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                     readOnly 
              />
            </div>
            <div className="card-section">
              <label className="card-label">Card Details<span className="text-red-500"> *</span></label>
              <div className="card-box">
                <CardElement
                  options={{
                    hidePostalCode: true,
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#212529",
                        '::placeholder': { color: '#6c757d' },
                      },
                      invalid: {
                        color: "#dc3545",
                      },
                    },
                  }}
                  onFocus={() => {
                    document.querySelector(".card-box")?.classList.add("card-box-focus");
                  }}
                  onBlur={() => {
                    document.querySelector(".card-box")?.classList.remove("card-box-focus");
                  }}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </div>

          {/* Family Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Family Size</label>
              <input
                type="number"
                min={1}
                max={50}
                value={familySize}
                onChange={(e) =>
                  setFamilySize(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white  
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 4"
              />
              {errors.family_size && <p className="text-red-500">{errors.family_size[0]}</p>}
            </div>
          </div>

          <div
            className={`relative mt-4 ${
              address1 ? 'h-[300px]' : 'h-0 overflow-hidden'
            }`}
          >
            <div
              className={`transition-opacity duration-300 ${
                address1 ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0'
              }`}
            >
              <GoogleMap
                mapRef={mapRef}
                isLoaded={isLoaded}
                mode="marker"
                polygonPath={[]}
                setPolygonPath={() => {}}
                existingPolygons={[]}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
                mapCenter={mapCenter}
                setMapCenter={setMapCenter}
                setAlertMsg={setAlertMsg}
                setAlertType={setAlertType}
              />
              {latitude && longitude && (
                <p className="text-sm mt-2 text-gray-600">
                  Selected Location: {latitude}, {longitude}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button type="submit" disabled={!stripe || loading} className="w-full bg-blue-600 text-white py-3 rounded-lg">
              {loading ? "Verifying..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Elements stripe={stripePromise}>
      <RegisterFormInner />
    </Elements>
  );
}
