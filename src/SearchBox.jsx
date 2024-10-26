import { equalTo, get, orderByChild, query, ref, set, update } from "firebase/database"
import { useState } from "react"
import { db } from "../firebase-config"
import SearchInput from "./SearchInput"

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
    function chatRoom(userdata){
        setChatUser(userdata)
        const roomName=userdata.uid>user.uid?userdata.uid+'_'+user.uid:user.uid+'_'+userdata.uid; //to create unique chat rooms
        
        //check if it exists already
        get(query(ref(db, `rooms/${roomName}`))).then(snapshot=>{
            if(!snapshot.exists()){
                set(ref(db, `rooms/${roomName}`), {
                    user1:userdata?.uid,
                    user2:user?.uid
                })
                console.log("Chat room created")
            }
            else console.log("Chat room exists")
        })
    }
    console.log("search user data ", userdata)
    return <div className="w-full h-1/3 border flex flex-col p-4">
        <SearchInput setUsername={setUsername}/>
        <button onClick={searchUser} className="b flex justify-center">Search</button>
        <div className="hbar"/>
        {userdata &&
            <button className="flex flex-col b" onClick={()=>chatRoom(userdata)}>
                <p>{userdata.displayName}</p>
                <p>{userdata.username}</p>
            </button>
        }
    </div>
}