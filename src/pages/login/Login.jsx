import { useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../../context/useAuth";
import "./login.css";

export default function Login() {
  const {
    user,
    isAdmin,
    authError,
    setAuthError,
    loginWithEmail,
    loginWithGoogle,
    enterTestMode,
    logout,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setAuthError(err?.message || "Failed to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      await loginWithGoogle();
    } catch (err) {
      setAuthError(err?.message || "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Signed in, but lacks admin: true custom claim
  if (user && !isAdmin) {
    return (
      <div className="loginPage">
        <div className="loginCard">
          <div className="loginBrand">
            <LockOutlinedIcon className="loginBrandIcon" />
            <h1 className="loginTitle">Unauthorized Access</h1>
          </div>
          <p className="loginSubtitle">
            Signed in as <strong>{user.email}</strong>
          </p>
          <div className="loginError">
            {authError ||
              "This account is not authorized as a Woodra administrator."}
          </div>
          <button
            type="button"
            className="loginButton"
            onClick={logout}
          >
            Sign Out &amp; Switch Account
          </button>
          <button
            type="button"
            className="loginTestButton"
            onClick={enterTestMode}
          >
            Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginBrand">
          <LockOutlinedIcon className="loginBrandIcon" />
          <h1 className="loginTitle">Woodra Admin</h1>
        </div>
        <p className="loginSubtitle">
          Sign in with your verified administrator account.
        </p>

        {authError && <div className="loginError">{authError}</div>}

        <form className="loginForm" onSubmit={handleEmailSubmit}>
          <div className="loginField">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              placeholder="admin@woodra.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div className="loginField">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="loginButton"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="loginDivider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="loginGoogleButton"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <GoogleIcon fontSize="small" />
          <span>Sign in with Google</span>
        </button>

        <button
          type="button"
          className="loginTestButton"
          onClick={enterTestMode}
          disabled={submitting}
          title="Enter dashboard home page without signing in"
        >
          Test
        </button>
      </div>
    </div>
  );
}
