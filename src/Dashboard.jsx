import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, push, ref, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import SearchBox from "./SearchBox";
export default function Dashboard({user, setUser}){
    const navigate=useNavigate()
    const [username, setUsername]=useState("")
    const [chatUser, setChatUser]=useState(null) //the user i am chatting with
    const [messege, setMessege]=useState("")
    const [allMesseges, setAllMesseges]=useState([])

    function signOutButton(){
        signOut(auth).then(() => {
            console.log("Signed out")
            navigate("/signup")
            // Sign-out successful.
          }).catch((error) => {
            console.error(error)
            // An error happened.
          });
          
    }
    useEffect(()=>{
        const unsubscribe=onAuthStateChanged(auth, currentUser=>{
            if(currentUser){
                setUser(currentUser)
                fetchUserData(currentUser.uid)
            }
            else navigate("/signup")
        })

        return ()=>unsubscribe()
    },[])

    function fetchUserData(uid){
        onValue(ref(db, `/users/${uid}`), snapshot=>{
            const userData=snapshot.val()
            setUser(prev=>({
                ...prev, ...userData
            }))
        })
    }

    function sendmessege(){
        if (!chatUser) {
            console.error("Chat user is not selected.");
            return; // Exit the function if chatUser is null
        }
        const roomName=chatUser.uid>user.uid?chatUser.uid+'_'+user.uid:user.uid+'_'+chatUser.uid;
        const msgId=push(ref(db, `rooms/${roomName}/messeges/`))
        set(msgId,{
            text:messege,
            sender:user.uid,
            timestamp:Date.now(),
            seen:false,
            messegeId:msgId.key
        })
        setMessege("")
    }
    useEffect(()=>{
        if (!chatUser) {
            console.error("Chat user is not selected.");
            return; // Exit the function if chatUser is null
        }
        const roomName=chatUser.uid>user.uid?chatUser.uid+'_'+user.uid:user.uid+'_'+chatUser.uid;
        onValue(ref(db, `rooms/${roomName}/messeges/`),snapshot=>{
            if(snapshot.exists())
                setAllMesseges(snapshot.val())
            else console.log("No msgs found")
        })
        console.log("all msgs",allMesseges)
    },[messege, chatUser])


    return <div className="w-full h-full flex ">
        <span className="w-1/4 h-full">
        <SearchBox chatUser={chatUser} setChatUser={setChatUser} user={user}/>
        </span>
        <span className="flex justify-between flex-col w-3/4 h-full">
            <span className="w-full h-1/4 border">
                <p>Dashboard</p>
                <p>{user? user.displayName:"null"}</p>
                <p>{user?user.email:"null"}</p>
                <p>username:{user?user.username:"null"}</p> 
                <img className="w-12 h-12" src={user?user.photoURL:"#"} alt="pfp"/>
                <input placeholder="username" onChange={(e)=>setUsername(e.target.value)}/><button onClick={()=>update(ref(db, `users/${user.uid}`),{username:username})}>Save</button>
                <button onClick={signOutButton}>Sign out</button>
            </span>
            {chatUser && 
            <span className="w-full h-3/4 flex flex-col justify-between">
                <p>Chat with {chatUser?chatUser.displayName:null}</p>
                <span className="w-full h-full border">
                {
                    allMesseges && Object.values(allMesseges).map(
                        msg=><div key={msg.messegeId} className="border flex flex-col">
                            <p>{msg.text}</p>
                        </div>
                    )
                }
                </span>
                <span className="flex border">
                    <input type="text" className="bg-transparent" onChange={e=>setMessege(e.target.value)}/>
                    <button onClick={sendmessege}>Send</button>
                </span>
            
            </span>}
        </span>
    </div>
}   