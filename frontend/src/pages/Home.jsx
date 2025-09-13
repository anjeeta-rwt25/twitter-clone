import React, { useEffect, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import TweetBox from "../components/TweetBox";
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

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const user = auth.currentUser;

  // Demo posts
  const demoPosts = [
    {
      id: "demo1",
      username: "Elon Musk",
      text: "Exploring Mars is the future! 🚀",
      imageUrl:
        "https://images.unsplash.com/photo-1581091012184-91a2699aef4f?auto=format&fit=crop&w=800&q=80",
      likes: [],
      comments: [],
      timestamp: new Date(),
    },
    {
      id: "demo2",
      username: "Jane Doe",
      text: "Just tried the new React 18 features, loving it! ✨",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      likes: [],
      comments: [],
      timestamp: new Date(),
    },
    {
      id: "demo3",
      username: "Nature Lover",
      text: "Sunsets like these make life beautiful. 🌅",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      likes: [],
      comments: [],
      timestamp: new Date(),
    },
  ];

  // Fetch real tweets
  const fetchTweets = async () => {
    try {
      const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const fetchedTweets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTweets([...demoPosts, ...fetchedTweets]);
    } catch (err) {
      console.error("Error fetching tweets:", err);
      setTweets(demoPosts);
    }
  };

  // Fetch User Suggestions
  const fetchSuggestions = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, "users"), limit(5)));
      const allUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== auth.currentUser?.uid);
      setSuggestions(allUsers);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  useEffect(() => {
    fetchTweets();
    fetchSuggestions();
  }, []);

  // Like a tweet
  const handleLike = async (tweetId) => {
    if (!user) return alert("Please log in to like posts.");

    if (tweetId.startsWith("demo")) {
      setTweets((prev) =>
        prev.map((t) =>
          t.id === tweetId
            ? {
                ...t,
                likes: t.likes.includes(user.uid)
                  ? t.likes.filter((uid) => uid !== user.uid)
                  : [...t.likes, user.uid],
              }
            : t
        )
      );
      return;
    }

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

  // Comment on a tweet
  const handleComment = async (tweetId, text) => {
    if (!user) return alert("Please log in to comment.");
    if (!text.trim()) return;

    if (tweetId.startsWith("demo")) {
      setTweets((prev) =>
        prev.map((t) =>
          t.id === tweetId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  { username: user.displayName || user.email, text },
                ],
              }
            : t
        )
      );
      return;
    }

    try {
      const tweetRef = doc(db, "tweets", tweetId);
      await updateDoc(tweetRef, {
        comments: arrayUnion({
          userId: user.uid,
          username: user.displayName || user.email,
          text,
          createdAt: new Date(),
        }),
      });

      fetchTweets();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-700 sticky top-0 bg-black z-10">
        <FaTwitter className="text-blue-500 w-8 h-8" />
      </div>

      {/* Tweet form */}
      <div className="border-b border-gray-700">
        <TweetBox onTweetPosted={fetchTweets} />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="p-4 border-b border-gray-800 hover:bg-gray-900"
            >
              <p className="text-sm text-gray-400">
                {tweet.username || "Unknown User"} •{" "}
                {tweet.timestamp?.toDate
                  ? tweet.timestamp.toDate().toLocaleString()
                  : tweet.timestamp instanceof Date
                  ? tweet.timestamp.toLocaleString()
                  : ""}
              </p>
              <p className="mt-2">{tweet.text}</p>

              {tweet.imageUrl && (
                <img
                  src={tweet.imageUrl}
                  alt="Tweet"
                  className="mt-3 rounded-lg max-h-60 object-cover"
                />
              )}

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
      </div>

      {/* Suggestions */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <h3 className="font-bold mb-3">Who to follow</h3>
        {suggestions.length > 0 ? (
          suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between mb-3"
            >
              <div>
                <p className="font-semibold">{user.displayName || "Unnamed"}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 rounded-full text-sm hover:opacity-90">
                Follow
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No suggestions available</p>
        )}
      </div>
    </div>
  );
}
