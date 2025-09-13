// src/pages/Explore.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export default function Explore() {
  const user = auth.currentUser;
  const [tweets, setTweets] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ tweets: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Fetch global tweets
  const fetchTweets = async () => {
    try {
      const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const allTweets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTweets(allTweets);
    } catch (err) {
      console.error("Error fetching global tweets:", err);
    }
  };

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    try {
      const q = query(collection(db, "users"), limit(5));
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== user?.uid);
      setSuggestedUsers(users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchTweets();
    fetchSuggestedUsers();
  }, []);

  // Handle likes
  const handleLike = async (tweetId) => {
    if (!user) return alert("Please log in to like posts.");
    try {
      const tweetRef = doc(db, "tweets", tweetId);
      const tweet = tweets.find((t) => t.id === tweetId);
      const alreadyLiked = tweet.likes?.includes(user.uid);
      await updateDoc(tweetRef, {
        likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      fetchTweets();
    } catch (err) {
      console.error("Error liking tweet:", err);
    }
  };

  // Handle comments
  const handleComment = async (tweetId, commentText) => {
    if (!user) return alert("Please log in to comment.");
    if (!commentText.trim()) return;
    try {
      const tweetRef = doc(db, "tweets", tweetId);
      await updateDoc(tweetRef, {
        comments: arrayUnion({
          userId: user.uid,
          username: user.displayName || user.email,
          text: commentText,
          createdAt: new Date(),
        }),
      });
      fetchTweets();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Handle follow
  const handleFollow = async (userId) => {
    if (!user) return alert("Please log in to follow users.");
    try {
      const currentUserRef = doc(db, "users", user.uid);
      await updateDoc(currentUserRef, { following: arrayUnion(userId) });
      const targetUserRef = doc(db, "users", userId);
      await updateDoc(targetUserRef, { followers: arrayUnion(user.uid) });
      alert("Followed successfully!");
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  // Handle search
  const handleSearch = async (queryText) => {
    if (!queryText.trim()) {
      setSearchResults({ tweets: [], users: [] });
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      const filteredTweets = tweets.filter(
        (tweet) =>
          tweet.text.toLowerCase().includes(queryText.toLowerCase()) ||
          (tweet.username || "").toLowerCase().includes(queryText.toLowerCase())
      );
      const filteredUsers = suggestedUsers.filter(
        (u) =>
          (u.displayName || "").toLowerCase().includes(queryText.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(queryText.toLowerCase())
      );
      setSearchResults({ tweets: filteredTweets, users: filteredUsers });
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, tweets, suggestedUsers]);

  // Mock trending topics
  const trendingData = [
    { topic: "#WebDevelopment", posts: "125K", category: "Technology" },
    { topic: "#AI", posts: "89K", category: "Technology" },
    { topic: "#ReactJS", posts: "67K", category: "Programming" },
    { topic: "#OpenSource", posts: "45K", category: "Technology" },
    { topic: "#Design", posts: "34K", category: "Creative" },
  ];

  return (
    <div className="flex w-full h-screen bg-black text-white">
      {/* Main feed */}
      <div className="flex-1 border-r border-gray-800 overflow-y-auto">
        {/* Header + Search */}
        <div className="p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <h2 className="text-lg font-bold mb-2">Explore</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        {/* Search results */}
        {searchQuery ? (
          <div className="p-4">
            {isSearching ? (
              <p className="text-center text-gray-500 py-8">Searching...</p>
            ) : (
              <>
                <h3 className="font-bold mb-2">Tweets</h3>
                {searchResults.tweets.length > 0 ? (
                  searchResults.tweets.map((tweet) => (
                    <div
                      key={tweet.id}
                      className="p-4 border-b border-gray-800 hover:bg-gray-900"
                    >
                      <p className="text-sm text-gray-400">
                        {tweet.username || "Unknown"} •{" "}
                        {tweet.timestamp?.toDate
                          ? tweet.timestamp.toDate().toLocaleString()
                          : ""}
                      </p>
                      <p className="mt-2">{tweet.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No tweets found for "{searchQuery}"</p>
                )}

                <h3 className="font-bold mt-4 mb-2">People</h3>
                {searchResults.users.length > 0 ? (
                  searchResults.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 mb-2 hover:bg-gray-900 rounded-lg"
                    >
                      <div>
                        <p className="font-bold">{u.displayName || "Unnamed User"}</p>
                        <p className="text-sm text-gray-400">{u.email}</p>
                      </div>
                      <button
                        onClick={() => handleFollow(u.id)}
                        className="px-3 py-1 bg-blue-500 rounded-full text-sm hover:opacity-80"
                      >
                        Follow
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No people found for "{searchQuery}"</p>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Trending */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold mb-2">Trending for you</h3>
              {trendingData.map((trend, i) => (
                <div
                  key={i}
                  className="hover:bg-gray-900 p-3 rounded-lg mb-2 cursor-pointer"
                >
                  <p className="text-gray-500 text-sm">{trend.category} · Trending</p>
                  <p className="font-bold text-white">{trend.topic}</p>
                  <p className="text-gray-500 text-sm">{trend.posts} posts</p>
                </div>
              ))}
            </div>

            {/* Feed */}
            {tweets.length > 0 ? (
              tweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className="p-4 border-b border-gray-800 hover:bg-gray-900"
                >
                  <p className="text-sm text-gray-400">
                    {tweet.username || "Unknown"} •{" "}
                    {tweet.timestamp?.toDate
                      ? tweet.timestamp.toDate().toLocaleString()
                      : ""}
                  </p>
                  <p className="mt-2">{tweet.text}</p>

                  {/* Actions */}
                  <div className="flex space-x-4 mt-2 text-sm text-gray-400">
                    <button
                      onClick={() => handleLike(tweet.id)}
                      className="hover:text-blue-500"
                    >
                      ❤️ {tweet.likes ? tweet.likes.length : 0}
                    </button>
                    <button
                      onClick={() => {
                        const text = prompt("Enter your comment:");
                        if (text) handleComment(tweet.id, text);
                      }}
                      className="hover:text-green-500"
                    >
                      💬 {tweet.comments ? tweet.comments.length : 0}
                    </button>
                  </div>

                  {/* Show comments */}
                  {tweet.comments && tweet.comments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {tweet.comments.map((c, i) => (
                        <p key={i} className="text-gray-300 text-sm">
                          <span className="font-bold">{c.username}:</span> {c.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-400">No tweets yet.</p>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-800 p-4 hidden md:block">
        <h3 className="text-lg font-bold mb-4">Who to follow</h3>
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between mb-3 p-2 hover:bg-gray-900 rounded-lg"
            >
              <div>
                <p className="font-bold">{u.displayName || "Unnamed User"}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => handleFollow(u.id)}
                className="px-3 py-1 bg-blue-500 rounded-full text-sm hover:opacity-80"
              >
                Follow
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No suggestions right now.</p>
        )}
      </div>
    </div>
  );
}
