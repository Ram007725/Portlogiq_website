import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./auth.css";

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c4.5 2.5 7 6.2 7 10.5A7 7 0 115 13.5C5 8 8.5 4.2 12 3z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.get("/sanctum/csrf-cookie");
      const response = await api.post("api/store/login", { email, password });

      const roles = response.data.user.roles.map((r: any) => r.name);

      if (response.data.status && roles.includes("Customer")) {
        localStorage.setItem("auth_token", response.data.token);
        navigate("/checkout");
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Only Customer can access this system.");
      } else {
        setError("Wrong credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-main auth-main--solo">
        <section className="auth-section">
          <div className="auth-container">
            <div className="auth-signin-shell">
              <aside className="auth-brand-panel">
                <div className="auth-brand-top">
                  <p className="auth-brand-mark">Portlogiq</p>
                  <p className="auth-brand-sub">General Store</p>
                </div>
                <div className="auth-brand-copy">
                  <h2 className="auth-brand-headline">Fresh from local growers to your table.</h2>
                  <p className="auth-brand-text">
                    Sign in to manage your cart, track orders, and enjoy produce sourced from Esperance and beyond.
                  </p>
                </div>
                <div className="auth-brand-footer">
                  <span className="auth-brand-chip">
                    <CheckIcon /> Farm fresh
                  </span>
                  <span className="auth-brand-chip">
                    <CheckIcon /> Local delivery
                  </span>
                  <span className="auth-brand-chip">
                    <CheckIcon /> Secure checkout
                  </span>
                </div>
              </aside>

              <div className="auth-form-panel">
                <div className="auth-intro">
                  <p className="auth-eyebrow">Welcome back</p>
                  <h1 className="auth-title">
                    <span className="auth-title-icon">
                      <LeafIcon />
                    </span>
                    Sign in
                  </h1>
                  <p className="auth-lead">Enter your details to continue to checkout.</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form" noValidate>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="signin-email">
                      Email<span className="auth-required">*</span>
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      placeholder="example@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="signin-password">
                      Password<span className="auth-required">*</span>
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  <div className="auth-check">
                    <input
                      id="signin-remember"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <label htmlFor="signin-remember">Keep me logged in</label>
                  </div>

                  {error && <p className="auth-error" role="alert">{error}</p>}

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                    {!loading && <ArrowIcon />}
                  </button>
                </form>

                <p className="auth-switch">
                  Don&apos;t have an account? <Link to="/register">Register now</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
