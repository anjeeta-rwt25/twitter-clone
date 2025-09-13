// Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  addDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const user = auth.currentUser;
  const [tweetCount, setTweetCount] = useState(0);
  const [tweets, setTweets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [newPhoto, setNewPhoto] = useState(null);

  const [commentInputs, setCommentInputs] = useState({}); // Track comment inputs
  const [likedTweets, setLikedTweets] = useState({}); // Track user likes

  // Fetch user tweets
  const fetchUserTweets = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "tweets"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);

      const userTweets = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // Get likes count
          const likesSnap = await getDocs(
            collection(db, "tweets", docSnap.id, "likes")
          );

          // Check if current user liked it
          const isLiked = likesSnap.docs.some((d) => d.id === user.uid);

          // Get comments
          const commentsSnap = await getDocs(
            collection(db, "tweets", docSnap.id, "comments")
          );

          return {
            id: docSnap.id,
            ...data,
            likes: likesSnap.size,
            comments: commentsSnap.docs.map((c) => ({
              id: c.id,
              ...c.data(),
            })),
            isLiked,
          };
        })
      );

      setTweets(userTweets);
      setTweetCount(userTweets.length);
    } catch (err) {
      console.error("Error fetching tweets:", err);
    }
  };

  useEffect(() => {
    fetchUserTweets();
  }, [user]);

  // Save profile changes
  const handleSave = async () => {
    try {
      let updatedPhotoURL = photoURL;

      if (newPhoto) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, newPhoto);
        updatedPhotoURL = await getDownloadURL(storageRef);
      }

      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, {
        displayName: displayName,
        photoURL: updatedPhotoURL,
      });

      setPhotoURL(updatedPhotoURL);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Delete tweet (with confirm)
  const handleDeleteTweet = async (tweetId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tweet?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tweets", tweetId));
      setTweets((prev) => prev.filter((tweet) => tweet.id !== tweetId));
      setTweetCount((prev) => prev - 1);
    } catch (err) {
      console.error("Error deleting tweet:", err);
    }
  };

  // Handle like
  const handleLike = async (tweetId, isLiked) => {
    if (!user) return;

    const likeRef = doc(db, "tweets", tweetId, "likes", user.uid);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          username: user.displayName || user.email,
          createdAt: new Date(),
        });
      }
      fetchUserTweets();
    } catch (err) {
      console.error("Error liking tweet:", err);
    }
  };

  // Handle comment
  const handleComment = async (tweetId) => {
    if (!user || !commentInputs[tweetId]?.trim()) return;

    try {
      await addDoc(collection(db, "tweets", tweetId, "comments"), {
        text: commentInputs[tweetId],
        userId: user.uid,
        username: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });

      setCommentInputs((prev) => ({ ...prev, [tweetId]: "" }));
      fetchUserTweets();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p>Please log in to see your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Profile</h2>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center text-white p-6">
        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user.displayName ? user.displayName[0] : user.email[0]}</span>
          )}
        </div>

        <h2 className="text-xl font-bold">{displayName || "Unnamed User"}</h2>
        <p className="text-gray-400">{user.email}</p>
        <p className="text-sm text-gray-500 mt-2">UID: {user.uid}</p>

        {/* Stats */}
        <div className="flex space-x-6 mt-6">
          <div className="text-center">
            <p className="font-bold">{tweetCount}</p>
            <p className="text-gray-400 text-sm">Tweets</p>
          </div>
          <div className="text-center">
            <p className="font-bold">0</p>
            <p className="text-gray-400 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">0</p>
            <p className="text-gray-400 text-sm">Following</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 px-4 py-2 bg-blue-500 rounded-full hover:opacity-90"
        >
          Edit Profile
        </button>
      </div>

      {/* User Tweets */}
      <div className="flex-1 overflow-y-auto border-t border-gray-700">
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="p-4 border-b border-gray-800 hover:bg-gray-900"
            >
              {/* Tweet content */}
              <p className="text-sm text-gray-400">
                {tweet.username || "Unknown User"} •{" "}
                {tweet.timestamp?.toDate
                  ? tweet.timestamp.toDate().toLocaleString()
                  : ""}
              </p>
              <p className="mt-2">{tweet.text}</p>

              {/* Actions */}
              <div className="flex items-center space-x-4 mt-3">
                <button
                  onClick={() => handleLike(tweet.id, tweet.isLiked)}
                  className={`text-sm ${
                    tweet.isLiked ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  ❤️ {tweet.likes}
                </button>

                <button className="text-sm text-gray-400">
                  💬 {tweet.comments.length}
                </button>

                <button
                  onClick={() => handleDeleteTweet(tweet.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-auto"
                >
                  Delete
                </button>
              </div>

              {/* Comments */}
              <div className="mt-3 space-y-2">
                {tweet.comments.map((c) => (
                  <div key={c.id} className="text-sm text-gray-300">
                    <span className="font-semibold">{c.username}: </span>
                    {c.text}
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex space-x-2 mt-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[tweet.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [tweet.id]: e.target.value,
                      }))
                    }
                    className="flex-1 px-2 py-1 rounded bg-gray-800 text-white text-sm"
                  />
                  <button
                    onClick={() => handleComment(tweet.id)}
                    className="px-3 py-1 bg-blue-500 rounded text-sm hover:opacity-80"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-400">No tweets yet.</p>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>

            <label className="block mb-2">Display Name</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white mb-4"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <label className="block mb-2">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              className="mb-4"
              onChange={(e) => setNewPhoto(e.target.files[0])}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 rounded-full hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
