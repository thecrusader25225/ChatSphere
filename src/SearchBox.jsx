import { equalTo, get, orderByChild, query, ref, set, update } from "firebase/database"
import { useState } from "react"
import { db } from "../firebase-config"

export default function SearchBox({chatUser, setChatUser, user}){
    const [username, setUsername]=useState("")
    const [userdata, setUserdata]=useState(null)
  
    function searchUser(){
        get(query(ref(db, `users`), orderByChild('username'), equalTo(username))).then(snapshot=>{
            if(snapshot.exists){
                setUserdata(Object.values(snapshot.val())[0])
            }else{
                console.log("No user found")
            }
        })
    }
    function chatRoom(){
        setChatUser(userdata)
        const roomName=userdata.uid>user.uid?userdata.uid+'_'+user.uid:user.uid+'_'+userdata.uid; //to create unique chat rooms
        
        //check if it exists already
        get(query(ref(db, `users/${user.uid}/${roomName}`))).then(snapshot=>{
            if(!snapshot.exists()){
                set(ref(db, `users/${user.uid}/${roomName}`), {
                    chatUser:userdata?.uid
                })
                console.log("Chat room created")
            }
            else console.log("Chat room exists")
        })
    }
    console.log("search user data ", userdata)
    return <div className="w-full h-full border flex flex-col">
        <input type="text" className="bg-transparent" onChange={e=>setUsername(e.target.value)}/>
        <button onClick={searchUser}>Search</button>
        {userdata &&
            <button className="flex flex-col" onClick={chatRoom}>
                <p>{userdata.displayName}</p>
                <p>{userdata.username}</p>
            </button>
        }
    </div>
}