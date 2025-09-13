// Feed.js
import React, { useEffect, useState } from "react";
import {
  fetchTweets,
  createTweet,
  likeTweet,
  addComment,
  retweetPost,
} from "../services/api";
import { Image as ImageIcon } from "lucide-react";

const Feed = () => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");
  const [tweetImage, setTweetImage] = useState(null);

  const loadTweets = async () => {
    const res = await fetchTweets();
    setTweets(res);
  };

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim() && !tweetImage) return;

    await createTweet({ content: newTweet, image: tweetImage });
    setNewTweet("");
    setTweetImage(null);
    loadTweets();
  };

  const handleLike = async (id) => {
    await likeTweet(id);
    loadTweets();
  };

  const handleRetweet = async (id) => {
    await retweetPost(id);
    loadTweets();
  };

  const handleComment = async (id) => {
    const content = prompt("Enter your comment:");
    if (content) {
      await addComment(id, content);
      loadTweets();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setTweetImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    loadTweets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-gray-800">Twitter Clone</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* New Tweet */}
      <div className="p-6 bg-white shadow mt-4 rounded-xl w-3/4 mx-auto">
        <form onSubmit={handleTweet} className="flex flex-col space-y-3">
          <textarea
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={280}
          />

          <div className="flex items-center justify-between">
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              id="tweet-image"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Album icon */}
            <label
              htmlFor="tweet-image"
              className="flex items-center space-x-2 cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <ImageIcon size={22} />
              <span className="text-sm">Add Photo</span>
            </label>

            {/* Tweet Button */}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tweet
            </button>
          </div>

          {/* Image preview */}
          {tweetImage && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">Selected image:</p>
              <img
                src={URL.createObjectURL(tweetImage)}
                alt="Preview"
                className="mt-2 rounded-lg max-h-40 object-cover"
              />
            </div>
          )}
        </form>
      </div>

      {/* Tweet List */}
      <div className="mt-6 w-3/4 mx-auto space-y-4">
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-white p-4 rounded-xl shadow hover:bg-gray-50"
          >
            <p className="font-semibold">@{tweet.author}</p>
            <p className="mt-2">{tweet.content}</p>

            {/* ✅ Show image if available */}
            {tweet.image && (
              <img
                src={tweet.image}
                alt="Tweet"
                className="mt-3 rounded-lg max-h-60 w-full object-cover"
              />
            )}

            <div className="flex space-x-6 mt-3 text-sm text-gray-600">
              <button onClick={() => handleLike(tweet.id)}>
                ❤️ {tweet.likes}
              </button>
              <button onClick={() => handleComment(tweet.id)}>
                💬 {tweet.comments}
              </button>
              <button onClick={() => handleRetweet(tweet.id)}>
                🔁 {tweet.retweets}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
