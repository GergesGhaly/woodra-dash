import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/useAuth";
import "./topbar.css";

export default function Topbar() {
  const { user, isTestMode, logout } = useAuth();
  const displayLabel =
    user?.displayName || user?.email || (isTestMode ? "Test Mode" : "Admin");
  const initial = displayLabel.charAt(0).toUpperCase();

  return (
    <div className="topbar">
      <div className="topbarWrapper">
        <div className="topRight">
          {(user || isTestMode) && <h3 className="adminName">hi, {displayLabel}</h3>}

          <Avatar
            style={{ width: 36, height: 36, backgroundColor: "#2b2b2b" }}
            src={user?.photoURL || undefined}
            alt={displayLabel}
          >
            {initial}
          </Avatar>

          {(user || isTestMode) && (
            <button
              type="button"
              className="topbarLogoutBtn"
              onClick={logout}
              title={isTestMode && !user ? "Exit Test Mode" : "Sign out"}
            >
              <LogoutIcon style={{ fontSize: 16 }} />
              <span>{isTestMode && !user ? "Exit Test" : "Logout"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}