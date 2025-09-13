import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import { FiImage } from "react-icons/fi"; // ✅ Album / photo icon

export default function TweetBox({ onTweetPosted }) {
  const [tweet, setTweet] = useState("");
  const [image, setImage] = useState(null);

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!tweet.trim() && !image) return;

    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `tweets/${auth.currentUser.uid}/${Date.now()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "tweets"), {
        text: tweet,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        imageUrl: imageUrl || null,
      });

      setTweet("");
      setImage(null);
      if (onTweetPosted) onTweetPosted();
    } catch (err) {
      console.error("Error posting tweet:", err);
    }
  };

  return (
    <form onSubmit={handleTweet} className="border-b border-gray-700 p-4 flex space-x-3">
      <div className="flex-1">
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="What's happening?"
          className="w-full bg-transparent outline-none resize-none text-lg"
          rows="2"
        />
        {image && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="rounded-lg max-h-48 object-cover"
            />
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          {/* ✅ Icon button instead of Choose File */}
          <label className="cursor-pointer flex items-center space-x-2 text-blue-400 hover:text-blue-500">
            <FiImage size={22} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600"
          >
            Tweet
          </button>
        </div>
      </div>
    </form>
  );
}
