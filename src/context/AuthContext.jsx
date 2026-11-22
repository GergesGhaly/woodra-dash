import { useState } from "react";
import { AuthContext } from "./useAuth";

const SESSION_STORAGE_KEY = "woodra_admin_session";
const TEST_MODE_STORAGE_KEY = "woodra_test_mode";

function loadStoredSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredSession);
  const [isTestMode, setIsTestMode] = useState(() => {
    try {
      return window.sessionStorage.getItem(TEST_MODE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState("");

  const isAdmin = Boolean(user);
  const authLoading = false;

  const loginWithEmail = async (email, password) => {
    setAuthError("");
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }
    const adminUser = {
      uid: "demo-admin",
      email: email.trim(),
      displayName: email.split("@")[0] || "Admin",
    };
    setUser(adminUser);
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(adminUser)
      );
    } catch {
      // ignore storage restrictions
    }
    return adminUser;
  };

  const loginWithGoogle = async () => {
    setAuthError("");
    const adminUser = {
      uid: "demo-google-admin",
      email: "admin@woodra.com",
      displayName: "Woodra Admin",
    };
    setUser(adminUser);
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(adminUser)
      );
    } catch {
      // ignore storage restrictions
    }
    return adminUser;
  };

  const enterTestMode = () => {
    setAuthError("");
    setIsTestMode(true);
    try {
      window.sessionStorage.setItem(TEST_MODE_STORAGE_KEY, "1");
    } catch {
      // ignore storage restrictions
    }
  };

  const logout = async () => {
    setAuthError("");
    setUser(null);
    setIsTestMode(false);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(TEST_MODE_STORAGE_KEY);
    } catch {
      // ignore storage restrictions
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isTestMode,
        authLoading,
        authError,
        setAuthError,
        loginWithEmail,
        loginWithGoogle,
        enterTestMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
