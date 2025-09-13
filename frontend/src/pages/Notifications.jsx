import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", auth.currentUser?.uid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotifications(data);

        // ✅ mark as read
        data.forEach(async (n) => {
          if (!n.read) {
            await updateDoc(doc(db, "notifications", n.id), { read: true });
          }
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 border-b border-gray-800 hover:bg-gray-900"
            >
              <p>
                <span className="font-semibold">{n.fromUserName}</span>{" "}
                {n.type === "like" && "liked your tweet"}
                {n.type === "comment" && "commented on your tweet"}
                {n.type === "follow" && "started following you"}
                {n.type === "retweet" && "retweeted your tweet"}
              </p>
              <p className="text-sm text-gray-400">
                {n.timestamp?.toDate
                  ? n.timestamp.toDate().toLocaleString()
                  : ""}
              </p>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-400">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
