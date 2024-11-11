import { onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { ref } from "firebase/database";
import { db } from "../firebase-config";
import { toast } from "react-toastify";

export default function Friends({ user, setChatUser, chatUser, setAllMesseges, setIsChatOpened, allFriends, setAllFriends }) {
   
    // Fetch friends data from the database
    useEffect(() => {
        const unsubscribe = onValue(ref(db, `users/${user?.uid}/friends/`), snapshot => {
            if (snapshot.exists()) {
                setAllFriends(snapshot.val());
            }
        });

        return () => unsubscribe(); 
    }, [user]);

    //fetch msgs for the room with that frnd selected
    useEffect(() => {
        if (!chatUser) return; 

        const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;

        // Fetch messages for the selected chat user
        const unsubscribe = onValue(ref(db, `rooms/${roomName}/messeges/`), snapshot => {
            if (snapshot.exists()) {
                setAllMesseges(snapshot.val());
                setIsChatOpened(true)
            } else {
                console.log("No messages found");
                setAllMesseges([]); 
            }
        });

        return () => unsubscribe(); 
    }, [chatUser, user, setAllMesseges]);

    return (
        <div className="w-full h-2/3 flex flex-col overflow-y-auto">
            <p>Friends</p>
            {allFriends && Object.values(allFriends).map(friend => (<>
                <button key={friend.uid} onClick={() =>{ setChatUser(friend);}} className="b flex items-center">
                    <img src={friend.photoURL} className="w-12 h-12 rounded-full" alt="pfp"/>
                    <span className="flex flex-col">
                        <p>{friend.displayName}</p>
                        <p>@{friend.username}</p>
                    </span>
                </button>
                <div className="hbar"/>
                </>

            ))}
        </div>
    );
}
