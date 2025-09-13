// Feed.jsx
import React, { useEffect, useState } from "react";
import { fetchTweets, createTweet, likeTweet, addComment, retweetPost } from "../services/api";

const Feed = () => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");

  const loadTweets = async () => {
    const res = await fetchTweets();
    setTweets(res);
  };

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;
    await createTweet({ content: newTweet });
    setNewTweet("");
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

  useEffect(() => {
    loadTweets();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* New Tweet */}
      <div className="p-4 border-b border-gray-800">
        <form onSubmit={handleTweet} className="flex flex-col space-y-3">
          <textarea
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={280}
          />
          <button
            type="submit"
            className="self-end px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Tweet
          </button>
        </form>
      </div>

      {/* Tweet List */}
      <div>
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="p-4 border-b border-gray-800 hover:bg-gray-900"
          >
            <p className="font-semibold">@{tweet.author}</p>
            <p className="mt-2">{tweet.content}</p>
            <div className="flex space-x-6 mt-3 text-sm text-gray-400">
              <button onClick={() => handleLike(tweet.id)}>❤️ {tweet.likes}</button>
              <button onClick={() => handleComment(tweet.id)}>💬 {tweet.comments}</button>
              <button onClick={() => handleRetweet(tweet.id)}>🔁 {tweet.retweets}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
