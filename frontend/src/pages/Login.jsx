// src/pages/Login.jsx
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Twitter, Mail, Phone, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTwitter, FaEnvelope, FaLock, FaUser, FaPhone, FaGoogle } from "react-icons/fa";


export default function Login() {
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  // Email login
  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  // Phone login
  const sendOtp = async () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      alert("OTP sent!");
    } catch (err) {
      alert(err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        navigate("/");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://pbs.twimg.com/media/FoRMKzXaMAAmI2N?format=jpg&name=large"
          alt="Twitter background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Login box */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-gray-900 p-8 rounded-2xl shadow-xl w-[400px]"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <FaTwitter size={48} className="text-[#1DA1F2] mx-auto animate-bounce" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Log in to Twitter</h1>

        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              tab === "email" ? "bg-[#1DA1F2] text-white scale-105" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setTab("email")}
          >
            <FaEnvelope size={18} /> <span>Email / Google</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              tab === "phone" ? "bg-[#1DA1F2] text-white scale-105" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setTab("phone")}
          >
            <FaPhone size={18} /> <span>Phone</span>
          </button>
        </div>

        {/* Animated Forms */}
        <AnimatePresence mode="wait">
          {tab === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 focus:ring-2 focus:ring-[#1DA1F2] outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 focus:ring-2 focus:ring-[#1DA1F2] outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmailLogin}
                className="w-full bg-[#1DA1F2] py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <LogIn size={18} /> <span>Login</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                className="w-full mt-4 bg-white text-black py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Continue with Google</span>
              </motion.button>
            </motion.div>
          )}

          {tab === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <input
                type="tel"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 focus:ring-2 focus:ring-[#1DA1F2] outline-none"
              />
              {!confirmationResult ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendOtp}
                  className="w-full bg-[#1DA1F2] py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <FaPhone size={18} /> <span>Send OTP</span>
                </motion.button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 focus:ring-2 focus:ring-[#1DA1F2] outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={verifyOtp}
                    className="w-full bg-green-600 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <span>Verify OTP</span>
                  </motion.button>
                </>
              )}
              <div id="recaptcha-container"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch to Signup */}
        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#1DA1F2] hover:underline">
            Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
