// src/components/Sidebar.jsx
import { FaHome, FaHashtag, FaUser, FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase";

export default function Sidebar() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="flex flex-col p-4 space-y-6 text-lg font-semibold text-white">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center space-x-3 hover:text-blue-400 transition ${
            isActive ? "text-blue-500" : ""
          }`
        }
      >
        <FaHome /> <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex items-center space-x-3 hover:text-blue-400 transition ${
            isActive ? "text-blue-500" : ""
          }`
        }
      >
        <FaHashtag /> <span>Explore</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center space-x-3 hover:text-blue-400 transition ${
            isActive ? "text-blue-500" : ""
          }`
        }
      >
        <FaUser /> <span>Profile</span>
      </NavLink>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 hover:text-red-400 transition"
      >
        <FaSignOutAlt /> <span>Logout</span>
      </button>
    </div>
  );
}
