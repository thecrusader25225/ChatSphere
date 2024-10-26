import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, onValue, push, query, ref, set, update } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import SearchBox from "./SearchBox";
import Friends from "./Friends";
import Navbar from "./Navbar";
export default function Dashboard({user, setUser}){
    const navigate=useNavigate()
    const [username, setUsername]=useState("")
    const [chatUser, setChatUser]=useState(null) //the user i am chatting with
    const [messege, setMessege]=useState("")
    const [allMesseges, setAllMesseges]=useState([])
    const [isMessegeSent, setIsMessegeSent]=useState(false)
   
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
        setIsMessegeSent(true)
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

    function addFriend(){
        get(query(ref(db, `users/${user.uid}/friends/${chatUser.uid}`))).then(snapshot=>{
            if(!snapshot.exists())
                set(ref(db, `users/${user.uid}/friends/${chatUser.uid}`), {
                    ...chatUser
                })
        })
    }

    const targetRef=useRef(null)
    const scrollToDiv = () => {
        if(targetRef.current)
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    useEffect(() => {
        if(isMessegeSent){
            scrollToDiv();
            setIsMessegeSent(false)
        }
    }, [allMesseges]);

    return <>
      <Navbar username={username} setUsername={setUsername} user={user}/>
    <div className="w-full h-full flex pt-16">
        <span className="w-1/4 h-full flex flex-col">
        <SearchBox chatUser={chatUser} setChatUser={setChatUser} user={user}/>   
        <Friends user={user} chatUser={chatUser} setChatUser={setChatUser} setAllMesseges={setAllMesseges} allMesseges={allMesseges} messege={messege}/>
        </span>
        <span className="flex justify-between flex-col w-3/4 h-full">
            <span className="w-full h-1/4 border">
                <p>Dashboard</p>
                
            </span>
            {chatUser? 
            <span className="w-full h-3/4 flex flex-col justify-between items-center">
                <p>Chat with {chatUser?chatUser.displayName:null}</p>
                <button onClick={addFriend}>Add Friend</button>
                <span className="w-full h-3/4 border border-red-600 overflow-y-auto">
                {
                    allMesseges && Object.values(allMesseges).map(
                        msg=><><div key={msg.messegeId} className=" flex flex-col justify-center py-2">
                            {
                                msg.sender == user.uid?
                                <span className="flex justify-end w-full">
                                    <span className="flex flex-col">
                                        <p className="text">{msg.text}</p>
                                        <p className="text-xs text-end">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                    </span>
                                    <img src={user.photoURL} alt="sender image" className="w-12 h-12 rounded-full"/>
                                </span>:
                                 <span className="flex">
                                    <img src={chatUser.photoURL} alt="sender image" className="w-12 h-12 rounded-full"/>
                                    <span className="flex flex-col">
                                        <p className="text">{msg.text}</p>
                                        <p className="text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                    </span>
                                </span>
                            }
                        </div>
                        </>
                    )   
                    
                }
                
                <div ref={targetRef}/>
               
                </span>
                <span className="flex border w-full h-16 items-center justify-center backdrop-blur-lg">
                    <input type="text" className="bg-transparent border w-3/4 h-10" placeholder="Messege..." onChange={e=>setMessege(e.target.value)}/>
                    <button onClick={()=>{sendmessege();}}>Send</button>
                </span>
                
            </span>:
            <span className="w-full h-3/4 flex">
                <p>Select a chat</p>
            </span>
            }
        </span>
    </div>
    </>
}   