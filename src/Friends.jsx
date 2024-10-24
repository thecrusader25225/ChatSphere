import { onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { ref } from "firebase/database";
import { db } from "../firebase-config";

export default function Friends({ user, setChatUser, chatUser, setAllMesseges }) {
    const [allFriends, setAllFriends] = useState(null);

    // Fetch friends data from the database
    useEffect(() => {
        const unsubscribe = onValue(ref(db, `users/${user?.uid}/friends/`), snapshot => {
            if (snapshot.exists()) {
                setAllFriends(snapshot.val());
            }
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, [user]);

    // When chatUser changes, fetch the messages for the selected friend
    useEffect(() => {
        if (!chatUser) return; // Exit if no chatUser is selected

        const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;

        // Fetch messages for the selected chat user
        const unsubscribe = onValue(ref(db, `rooms/${roomName}/messeges/`), snapshot => {
            if (snapshot.exists()) {
                setAllMesseges(snapshot.val());
            } else {
                console.log("No messages found");
                setAllMesseges([]); // Clear messages if none found
            }
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, [chatUser, user, setAllMesseges]);

    return (
        <div className="w-full h-2/3 flex flex-col border">
            <p>Friends</p>
            {allFriends && Object.values(allFriends).map(friend => (
                <button key={friend.uid} onClick={() => setChatUser(friend)}>
                    {friend.displayName}
                </button>
            ))}
        </div>
    );
}
