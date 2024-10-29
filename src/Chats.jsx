import { get, query, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase-config";

export default function Chats({user, setChatUser}){
    const [allChats, setAllChats]=useState([])
    useEffect(()=>{
        get(ref(db, `rooms`)).then(snapshot=>{
            if(snapshot.exists()){
                const allRooms=Object.keys(snapshot.val())
                const roomsWithMyUid=allRooms.filter(val=>val.includes(user.uid))
                const allChatUsers=roomsWithMyUid.map(room=>{
                    const [uid1, uid2]=room.split("_")
                    const id= uid1==user.uid?uid2:uid1

                    return get(ref(db,`users/${id}`)).then(snap=>{
                        if(snap.exists()){
                            console.log("Chat users exist", snap.val())
                            const info=snap.val()
                            console.log(info)
                           return {
                                displayName:info.displayName,
                                uid: info.uid,
                                photoURL: info.photoURL,
                                username: info.username? info.username:"nil"
                            }
                        }else {console.log("Chat user Doesnt exist"); return null;}
                    })
                })
                Promise.all(allChatUsers).then(chatUsers=>setAllChats(chatUsers.filter(chatUser=>chatUser!==null)))
            }
        })
    },[user])
    console.log("allchats", allChats)
    return <div className="w-full h-2/3 flex flex-col overflow-y-auto">
        <p>Chats</p>
        {
           allChats && allChats.map(chat=><><button className="b" onClick={()=>setChatUser(chat)}>
            <img src={chat.photoURL} alt="pfp" className="w-12 h-12 rounded-full"/>
            <p>{chat.displayName}</p>
           </button>
           <div className="hbar"/>
           </>
           )
        }
    </div>

}