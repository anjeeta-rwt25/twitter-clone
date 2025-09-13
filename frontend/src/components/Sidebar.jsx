import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHashtag,
  FaBell,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Sidebar() {
  const [unreadNotifications] = useState(0);
  const [unreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const Badge = ({ count }) =>
    count > 0 ? (
      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {count}
      </span>
    ) : null;

  return (
    <div className="w-64 h-screen bg-black text-white border-r border-gray-800 flex flex-col justify-between sticky top-0 px-4 py-6">
      {/* Top Section */}
      <div>
        {/* Logo / Title */}
        <h1
          className="text-2xl font-bold text-blue-500 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Twitter Clone
        </h1>

        {/* Navigation */}
        <nav className="flex flex-col space-y-6">
          <Link
            to="/"
            className={`flex items-center space-x-4 text-lg font-medium hover:text-blue-500 transition ${
              location.pathname === "/" ? "text-blue-500" : ""
            }`}
          >
            <FaHome size={20} /> <span>Home</span>
          </Link>

          <Link
            to="/explore"
            className={`flex items-center space-x-4 text-lg font-medium hover:text-blue-500 transition ${
              location.pathname === "/explore" ? "text-blue-500" : ""
            }`}
          >
            <FaHashtag size={20} /> <span>Explore</span>
          </Link>

          <Link
            to="/notifications"
            className={`flex items-center space-x-4 text-lg font-medium hover:text-blue-500 transition ${
              location.pathname === "/notifications" ? "text-blue-500" : ""
            }`}
          >
            <FaBell size={20} /> <span>Notifications</span>
            <Badge count={unreadNotifications} />
          </Link>

          <Link
            to="/messages"
            className={`flex items-center space-x-4 text-lg font-medium hover:text-blue-500 transition ${
              location.pathname === "/messages" ? "text-blue-500" : ""
            }`}
          >
            <FaEnvelope size={20} /> <span>Messages</span>
            <Badge count={unreadMessages} />
          </Link>

          <Link
            to="/profile"
            className={`flex items-center space-x-4 text-lg font-medium hover:text-blue-500 transition ${
              location.pathname === "/profile" ? "text-blue-500" : ""
            }`}
          >
            <FaUser size={20} /> <span>Profile</span>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 rounded-full hover:bg-red-600 transition flex items-center justify-center space-x-2 text-white font-medium"
      >
        <FaSignOutAlt size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}
