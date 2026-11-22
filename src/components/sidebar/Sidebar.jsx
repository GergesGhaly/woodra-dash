import "./sidebar.css";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const isDashboard = pathname === "/" || pathname === "/dashboard";
  const isOperations =
    pathname === "/operations" || pathname === "/transactions";
  const isProducts =
    pathname === "/products" ||
    pathname === "/newproduct" ||
    pathname.startsWith("/product/");
  const isCategories = pathname === "/categories";
  const isUsers = pathname === "/users" || pathname.startsWith("/user/");

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Admin Menu</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li
                className={`sidebarListItem ${isDashboard ? "active" : ""}`}
              >
                <HomeOutlinedIcon className="sidebarIcon" />
                <p>Dashboard</p>
              </li>
            </Link>

            <Link to="/operations" className="link">
              <li
                className={`sidebarListItem ${isOperations ? "active" : ""}`}
              >
                <MonetizationOnOutlinedIcon className="sidebarIcon" />
                <p>Operations</p>
              </li>
            </Link>

            <Link to="/products" className="link">
              <li
                className={`sidebarListItem ${isProducts ? "active" : ""}`}
              >
                <StorefrontIcon className="sidebarIcon" />
                <p>Products</p>
              </li>
            </Link>

            <Link to="/categories" className="link">
              <li
                className={`sidebarListItem ${isCategories ? "active" : ""}`}
              >
                <CategoryOutlinedIcon className="sidebarIcon" />
                <p>Categories</p>
              </li>
            </Link>

            <Link to="/users" className="link">
              <li className={`sidebarListItem ${isUsers ? "active" : ""}`}>
                <PermIdentityIcon className="sidebarIcon" />
                <p>Users</p>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
