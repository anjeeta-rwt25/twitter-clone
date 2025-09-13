// src/pages/Profile.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function ProfileSetup() {
  const [user] = useAuthState(auth);

  if (!user) return null;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg space-y-4">
        <img
          src={user.photoURL || "https://abs.twimg.com/sticky/default_profile_images/default_profile.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border border-gray-700"
        />
        <p><strong>Name:</strong> {user.displayName || "No name set"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
      </div>
    </div>
  );
}
