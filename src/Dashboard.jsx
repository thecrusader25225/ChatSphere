import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { endAt, get, limitToLast, onValue, orderByChild, orderByKey, push, query, ref, remove, set, update } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import SearchBox from "./SearchBox";
import Friends from "./Friends";
import Navbar from "./Navbar";
import { FaUserFriends } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import { BiPaint, BiPlus, BiUpArrow } from "react-icons/bi";
import { TiTick } from "react-icons/ti";
import Chats from "./Chats";
import CanvasComponent from "./CanvasComponent";
import { BsPlus } from "react-icons/bs";
import { upload } from "@vercel/blob/client";
import { handleUpload } from "@vercel/blob/client";
export default function Dashboard({user, setUser}){
    const navigate=useNavigate()
    const [username, setUsername]=useState("")
    const [chatUser, setChatUser]=useState(null) //the user i am chatting with
    const [messege, setMessege]=useState("")
    const [allMesseges, setAllMesseges]=useState([])
    const [isMessegeSent, setIsMessegeSent]=useState(false)
    const [isChatOpened, setIsChatOpened]=useState(false)
    const [allFriends, setAllFriends] = useState(null);
    const [isChatOrFriendOpen, setIsChatOrFriendOpen]=useState({chat:true, friend:false})
    const [isCanvasOpened, setIsCanvasOpened]=useState(false)
    const chatContainerRef=useRef(null)

    const inputFileRef=useRef(null)
    const [blob, setBlob]=useState(null)

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
        
        get(query(ref(db, `rooms/${roomName}/messeges/`), orderByKey(), limitToLast(10))).then(snapshot=>{
            if(snapshot.exists()){
                setAllMesseges(snapshot.val())
                console.log("allmsgs", allMesseges)
            }else console.log("no msgs found")
        })
        // console.log("all msgs",allMesseges)
    },[messege, chatUser])
    useEffect(()=>{
        setIsCanvasOpened(false)
    },[chatUser])

    console.log("all msgs", allMesseges)

    function fetchMoreMsgs(){
        if (!chatUser) {
            console.error("Chat user is not selected.");
            return; // Exit the function if chatUser is null
        }
        const roomName=chatUser.uid>user.uid?chatUser.uid+'_'+user.uid:user.uid+'_'+chatUser.uid;
        get(query(ref(db, `rooms/${roomName}/messeges/`), orderByKey(), endAt(Object.keys(allMesseges)[0]), limitToLast(11))).then(snapshot=>{
            if(snapshot.exists()){
                const data=snapshot.val();
                const tempArr=Object.keys(data).splice(-1, 1)
                const editedData={...tempArr}
                setAllMesseges(prev=>({...data, ...prev}))
            }
        })
        // console.log("all msgs",allMesseges)
        if(chatContainerRef.current)
            chatContainerRef.current.scrollTop=5
    }

    useEffect(()=>{
        const handleScroll=()=>
        {
            if(chatContainerRef.current)
                if(chatContainerRef.current.scrollTop==0)
                    fetchMoreMsgs()
        }
        if(chatContainerRef.current)
            chatContainerRef.current.addEventListener("scroll", handleScroll)

        return ()=>{if(chatContainerRef.current)chatContainerRef.current.removeEventListener("scroll", handleScroll)}
        
    }, [allMesseges])
    // console.log("messege[0]", Object.keys(allMesseges)[0])
    function addFriend(){
        const reference=ref(db, `users/${user.uid}/friends/${chatUser.uid}`)
        get(query(reference)).then(snapshot=>{
            if(!snapshot.exists()){
                const userData = {
                    uid: chatUser.uid,
                    displayName: chatUser.displayName,
                    photoURL: chatUser.photoURL,
                    username: chatUser.username? chatUser.username: "nil"
                };
                set(reference, {
                    ...userData
                })
            }
                
        })
    }
    function removeFriend(){
        const reference=ref(db, `users/${user.uid}/friends/${chatUser.uid}`)
        get(query(reference)).then(snapshot=>{
            if(snapshot.exists())
                remove(reference)
        })
    }
    function checkStranger() {
        const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;
    
        // Get the messages from the room
        get(ref(db, `rooms/${roomName}/messeges/`)).then(snapshot => {
            if (snapshot.exists()) {
                const messages = snapshot.val();
                const messageCount = Object.keys(messages).length; // Count the number of messages
    
                console.log("Message count:", messageCount); 
    
                // Check if the user is a friend
                get(query(ref(db, `users/${chatUser.uid}/friends/${user.uid}`))).then(friendSnapshot => {
                    const isFriend = friendSnapshot.exists();
                    console.log("Is friend:", isFriend); 
    
                    if (!isFriend && messageCount <= 1) { // Adjusted condition
                        const notificationRef = ref(db, `users/${chatUser.uid}/notifications/${user.uid}`);
    
                        // Check if notification already exists
                        get(notificationRef).then(notificationSnapshot => {
                            if (!notificationSnapshot.exists()) {
                                const notificationData = {
                                    uid: user.uid,
                                    displayName: user.displayName,
                                    photoURL: user.photoURL,
                                    username: user.username? user.username:"nil"
                                    // Add any other fields you deem necessary
                                };
                                
                                set(notificationRef, { ...notificationData }) // Add user as notification
                                    .then(() => console.log("Notification set successfully."))
                                    .catch(error => console.error("Error setting notification:", error));
                            } else {
                                console.log("Notification already exists.");
                            }
                        }).catch(error => {
                            console.error("Error checking notifications:", error);
                        });
                    } else {
                        console.log("Not sending notification.");
                    }
                }).catch(error => {
                    console.error("Error checking friends:", error);
                });
            } else {
                console.log("No messages found in the room.");
            }
        }).catch(error => {
            console.error("Error fetching messages:", error);
        });
    }
  
    const targetRef=useRef(null)
    const scrollToDiv = () => {
        if(targetRef.current)
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    useEffect(() => {
        if (isMessegeSent || isChatOpened) {
            // Use a timeout to ensure the chat is rendered before scrolling
            setTimeout(() => {
                scrollToDiv();
                if (isMessegeSent) setIsMessegeSent(false);
                if (isChatOpened) setIsChatOpened(false);
            }, 100); // You can adjust the timeout if needed
        }
    }, [allMesseges, chatUser]); // Make sure to include `allMesseges` in the dependency array
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const file = inputFileRef.current.files[0];
        if (!file) return; // Handle if no file is selected
        
        try {
          // Call Vercel Blob API's handleUpload function
          const newBlob = await handleUpload(file.name, file, {
            access: 'public', // Can adjust this based on your needs
            handleUploadUrl: '/api/avatar/upload', // This is your backend URL
          });
    
          // Store the uploaded blob URL or data if needed
          setBlob(newBlob);
          console.log('File uploaded successfully:', newBlob);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
    
    return <>
    <Navbar username={username} setUsername={setUsername} user={user} setChatUser={setChatUser} setIsChatorFriendOpen={setIsChatOrFriendOpen} isChatOrFriendOpen={isChatOrFriendOpen}/>
    <div className="absolute top-0 left-0 w-full h-12 bg-zinc-900 flex justify-center items-center">Chat Sphere</div>


    <div className="w-full h-full flex pl-16 pt-12">
        <span className="w-1/3 h-full flex flex-col min-w-64 bg-zinc-850 rounded-tl-2xl rounded-bl-2xl">
            <SearchBox chatUser={chatUser} setChatUser={setChatUser} user={user}/>   
            {isChatOrFriendOpen.friend && <Friends user={user} chatUser={chatUser} setChatUser={setChatUser} setAllMesseges={setAllMesseges} allMesseges={allMesseges} messege={messege} setIsChatOpened={setIsChatOpened} allFriends={allFriends} setAllFriends={setAllFriends}/>}
            {isChatOrFriendOpen.chat && <Chats user={user} setChatUser={setChatUser}/>}
        </span>
        <span className="flex justify-between flex-col w-3/4 h-full">
            {chatUser? 
            <>
            <span className="w-full h-full flex flex-col justify-between items-center bg-zinc-850 rounded-tr-2xl z-50">
                <span className="w-full h-16  flex justify-between items-center">
                    <span className="flex items-center">
                        <img src={chatUser?.photoURL? chatUser.photoURL : ""} alt="sender image" className="w-12 h-12 rounded-full"/>
                        <p>{chatUser?chatUser.displayName:null}</p>
                    </span>  
                  
                        {allFriends && Object.values(allFriends).some(frnd=>frnd.uid==chatUser.uid)?
                          <span className="flex sb" onClick={removeFriend}>
                            <FaUserFriends className="text-lg"/>
                            <TiTick className="text-lg"/>
                        </span>: <span className="flex sb" onClick={addFriend}>
                        <FaUserFriends className="text-lg"/>
                        <BiPlus className="text-lg"/>
                        </span>
                        }
                </span>
                
                {/* messeging area */}
                <span ref={chatContainerRef} className="w-full h-full overflow-y-auto rounded-2xl bg-zinc-800 relative">
                {
                    allMesseges && Object.values(allMesseges).map(
                        msg=><div key={msg.messegeId} className=" flex flex-col justify-center py-2">
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
                    )   
                }
                    <div ref={targetRef}/>
                    <div className="absolute w-full h-full top-0">{isCanvasOpened && <CanvasComponent chatUser={chatUser} user={user} setIsCanvasOpened={setIsCanvasOpened}/>}</div>
                </span>
                
                <span className="flex w-full h-20 items-center justify-center backdrop-blur-lg">
                    <form onSubmit={handleSubmit}>
                        <input ref={inputFileRef} type="file" required />
                        <button type="submit">Upload</button>
                    </form>
                    <BiPaint className="inputb" onClick={()=>setIsCanvasOpened(true)}/>
                    <input type="text" className="bg-transparent w-3/4 h-10 bg-zinc-875 px-4 rounded-full" placeholder="Messege..." onChange={e=>setMessege(e.target.value)}/>
                    <button onClick={()=>{sendmessege(); checkStranger();}}>Send</button>
                </span>
                
            </span></>:
            <span className="w-full h-3/4 flex">
                <p>Select a chat</p>
            </span>
            }
        </span>
    </div>
    </>
}   