import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Select from "react-select";
import api from "../../services/api";
import { toast } from "react-toastify";
import GoogleMap from "../../components/map/GoogleMap";
import Swal from "sweetalert2";
import "./auth.css";

const stripePromise = loadStripe(
  "pk_test_51SPGj8DPTiiAKcUNtf2eTgmcU3nBau2dC0qDcexcf3hgPoMBN6ESFD8MU0d2awkXAzfMEPylitgJXsCXtvjdFCDK00qfKK9LG6"
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="12" cy="8" r="3.25" />
    <path strokeLinecap="round" d="M5.5 19.5c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
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

        input.addEventListener("input", () => {
          const value = input.value.trim();
          if (!value) {
            onInputChange("");
            onPlaceSelected(null);
            onClearAddress();
          }
        });

        clearInterval(findInput);
      }
    }, 300);

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

  return <div ref={hostRef} className="auth-places-host" />;
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
  const [cardFocused, setCardFocused] = useState(false);

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
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#3d6b4f" viewBox="0 0 24 24">
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

  const handleRegister = async () => {
    setError("");

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      if (!latitude || !longitude) {
        toast.error("Please select a valid address.");
        setLoading(false);
        return;
      }

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
          confirmButtonColor: "#3d6b4f",
          cancelButtonColor: "#6b6b6b",
        });

        becomeZone = result.isConfirmed;
      } else {
        becomeZone = false;
      }

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
          confirmButtonColor: "#3d6b4f",
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: res.data.message || "Something went wrong during registration.",
          confirmButtonColor: "#3d6b4f",
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
          confirmButtonColor: "#3d6b4f",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressClear = () => {
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

  const countryOptions = countries.map((c) => ({ value: c.id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s.id, label: s.name }));
  const selectedCountry = countries.find((c) => c.id === countryId);
  const selectedState = states.find((s) => s.id === stateId);

  return (

    <div className="auth-page">
      <main className="auth-main auth-main--solo">
        <section className="auth-section">
          <div className="auth-container">
            <div className="auth-register-wrap">
              <div className="auth-intro">
                <p className="auth-eyebrow">Create account</p>
                <h1 className="auth-title">
                  <span className="auth-title-icon">
                    <UserIcon />
                  </span>
                  Register
                </h1>
                <p className="auth-lead">
                  Join Portlogiq to shop fresh local produce. We&apos;ll verify your card securely for seamless checkout.
                </p>

              </div>


              <div className="auth-register-card">
                <div className="auth-register-head">
                  <div className="auth-register-head-copy">
                    <p className="auth-register-head-label">New customer</p>
                    <h2 className="auth-register-head-title">Account details</h2>
                  </div>
                </div>

                <div className="auth-register-body">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegister();
                    }}
                    className="auth-form"
                    noValidate
                  >
                    <div className="auth-section-block">
                      <p className="auth-section-label">Personal information</p>
                      <div className="auth-grid auth-grid-2">
                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-first-name">
                            First Name<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-first-name"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="auth-input"
                            autoComplete="given-name"
                          />
                          {errors.first_name && (
                            <p className="auth-field-error">{errors.first_name[0]}</p>
                          )}
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-last-name">
                            Last Name<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-last-name"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="auth-input"
                            autoComplete="family-name"
                          />
                          {errors.last_name && (
                            <p className="auth-field-error">{errors.last_name[0]}</p>
                          )}
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-phone">
                            Phone<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="auth-input"
                            autoComplete="tel"
                          />
                          {errors.phone && <p className="auth-field-error">{errors.phone[0]}</p>}
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-email">
                            Email<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                            autoComplete="email"
                          />
                          {errors.email && <p className="auth-field-error">{errors.email[0]}</p>}
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-password">
                            Password<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                            autoComplete="new-password"
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-country">
                            Country
                          </label>
                          <Select
                            inputId="reg-country"
                            classNamePrefix="auth-select"
                            options={countryOptions}
                            value={
                              selectedCountry
                                ? { value: countryId, label: selectedCountry.name }
                                : null
                            }
                            onChange={(selected) =>
                              setCountryId(selected ? Number(selected.value) : "")
                            }
                            placeholder="Select Country"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-section-block">
                      <p className="auth-section-label">Delivery address</p>
                      <div className="auth-grid auth-grid-2">
                        <div className="auth-field">
                          <label className="auth-label">
                            Address Line 1 (searchable)<span className="auth-required">*</span>
                          </label>
                          <PlaceAutocompleteInput
                            onInputChange={setAddress1}
                            onPlaceSelected={onPlaceSelected}
                            onClearAddress={handleAddressClear}
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-address2">
                            Address Line 2
                          </label>
                          <input
                            id="reg-address2"
                            type="text"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            className="auth-input"
                            autoComplete="address-line2"
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-suburb">
                            Suburb<span className="auth-required">*</span>
                          </label>
                          <input
                            id="reg-suburb"
                            type="text"
                            value={suburb}
                            onChange={(e) => setSuburb(e.target.value)}
                            required
                            className="auth-input"
                            readOnly
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-state">
                            State
                          </label>
                          <Select
                            inputId="reg-state"
                            classNamePrefix="auth-select"
                            options={stateOptions}
                            value={
                              selectedState
                                ? { value: stateId, label: selectedState.name }
                                : null
                            }
                            onChange={(selected) =>
                              setStateId(selected ? Number(selected.value) : "")
                            }
                            placeholder=""
                            isDisabled
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-postal">
                            Postal Code
                          </label>
                          <input
                            id="reg-postal"
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="auth-input"
                            readOnly
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label">
                            Card Details<span className="auth-required">*</span>
                          </label>
                          <div className={`auth-card-box${cardFocused ? " is-focused" : ""}`}>
                            <CardElement
                              options={{
                                hidePostalCode: true,
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    fontFamily: "DM Sans, sans-serif",
                                    color: "#1c1c1c",
                                    "::placeholder": { color: "#9aa39d" },
                                  },
                                  invalid: {
                                    color: "#b91c1c",
                                  },
                                },
                              }}
                              onFocus={() => setCardFocused(true)}
                              onBlur={() => setCardFocused(false)}
                            />
                          </div>
                          {error && (
                            <p className="auth-field-error" role="alert">
                              {error}
                            </p>
                          )}
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="reg-family-size">
                            Family Size
                          </label>
                          <input
                            id="reg-family-size"
                            type="number"
                            min={1}
                            max={50}
                            value={familySize}
                            onChange={(e) =>
                              setFamilySize(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            className="auth-input"
                            placeholder="e.g. 4"
                          />
                          {errors.family_size && (
                            <p className="auth-field-error" role="alert">
                              {errors.family_size[0]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`auth-map-wrap ${address1 ? "is-open" : "is-closed"}`}>
                        {address1 && (
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
                        )}
                      </div>
                      {latitude && longitude && (
                        <p className="auth-map-coords">
                          Selected location: {latitude}, {longitude}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!stripe || loading}
                      className="auth-submit"
                    >
                      {loading ? "Verifying…" : "Create account"}
                      {!loading && <ArrowIcon />}
                    </button>
                  </form>

                  <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
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
