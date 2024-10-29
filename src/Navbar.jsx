import { useEffect, useState } from "react";
import { BiChat, BiEdit, BiNotification, BiSearch } from "react-icons/bi";
import { update, ref, get, query } from "firebase/database";
import { db } from "../firebase-config";
import { CgClose } from "react-icons/cg";
import { TiTick } from "react-icons/ti";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { TbFriends } from "react-icons/tb";
import { CiSettings } from "react-icons/ci";
import { MdMenu } from "react-icons/md";
export default function Navbar({user, username, setUsername, setChatUser, setIsChatorFriendOpen, isChatOrFriendOpen}){
    const [isProfileOpen, setIsProfileOpen]=useState(false)
    const [isEditingUsername, setIsEditingUsername]=useState(false)
    const [isNotifOpen, setIsNotifOpen]=useState(false)
    const [allNotifs, setAllNotifs]=useState([])
    const [isMenuOpen, setIsMenuOpen]=useState(false)
    const navigate=useNavigate()
    
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
        get(query(ref(db, `users/${user?.uid}/notifications`))).then(snapshot=>{
            if(snapshot.exists())
                setAllNotifs({...Object.values(snapshot.val())})
            else setAllNotifs([])
        })
    }, [user])

    return <><div className={`${isMenuOpen?"w-48":"w-16"} h-[calc(100%-48px)] top-12 left-0 fixed  flex flex-col justify-between p-2 backdrop-blur-md z-50 bg-zinc-900`}>
        <span className={`flex flex-col ${!isMenuOpen && "items-center"}`}>
            <p className="flex items-center sbb" onClick={()=>setIsMenuOpen(prev=>!prev)}>
                <MdMenu />
            </p>
            <p className={`flex items-center sbb ${isChatOrFriendOpen.chat && "bg-white bg-opacity-10"}`}  onClick={()=>setIsChatorFriendOpen({chat:true, friend:false})}>
                <BiChat/>
                {isMenuOpen && <p className="text-base">Chats</p>}
            </p>
            <p className={`flex items-center sbb ${isChatOrFriendOpen.friend && "bg-white bg-opacity-10"}`} onClick={()=>setIsChatorFriendOpen({chat:false, friend:true})}>
                <TbFriends />
                {isMenuOpen && <p className="text-base">Friends</p>}
            </p>
            <p className="flex items-center sbb"  onClick={()=>{setIsNotifOpen(prev=>!prev); setIsMenuOpen(false)}}>
                <BiNotification/>
                {isMenuOpen && <p className="text-base">Notifications</p>}
            </p>
        </span>
        <span className={`flex flex-col ${!isMenuOpen && "items-center"}`}>
           <p className="flex items-center sbb">
               <CiSettings/>
               {isMenuOpen && <p className="text-base">Settings</p>}
           </p>
            <p className={`flex items-center ${isMenuOpen && "sb"}`}  onClick={()=>{setIsProfileOpen(!isProfileOpen);  setIsMenuOpen(false)}}>
                <img src={user?user.photoURL:"#"} className="rounded-full w-10 h-10 cursor-pointer" alt="pfp"/>
                {isMenuOpen && <p className="text-base">Profile</p>}
            </p>
        </span>
    </div>
    {/* profile */}
    {   isProfileOpen &&
        <div className="menu bottom-0 left-16 z-50">
            <img className="w-20 h-20 rounded-full" src={user?user.photoURL:"#"} alt="pfp"/>
            <p className="text-2xl font-bold">{user? user.displayName:"null"}</p>
            <p className="text-sm">{user?user.email:"null"}</p>
            <fieldset className="border rounded-full w-11/12 flex items-center justify-center px-4">
                <legend className="text-sm">Username</legend>
                {isEditingUsername?
                    <><input placeholder="username" onChange={(e)=>setUsername(e.target.value)} className="w-3/4 bg-transparent outline-none rounded-full"/>
                    <TiTick className="sb" onClick={()=>{update(ref(db, `users/${user.uid}`),{username:username}); setIsEditingUsername(false)}}/>
                    <CgClose className="sb" onClick={()=>setIsEditingUsername(false)}/>
                    </>:
                    <><p className="text-base">@{user?user.username:"null"}</p> 
                    <BiEdit className="sb" onClick={()=>setIsEditingUsername(true)}/>  
                    </> 
                }
            </fieldset>
            <button className="hover:underline py-2" onClick={signOutButton}>Sign out</button>
    </div>}
    {/* notifications */}
    {
        isNotifOpen && 
        <div className="menu top-12 left-16 overflow-y-auto z-50">
            {
                allNotifs && Object.values(allNotifs).map(notif=><><button key={notif.uid} className="b flex" onClick={()=>setChatUser(notif)}>
                    <img src={notif.photoURL} className="w-12 h-12 rounded-full" alt="pfp"/>
                    <p className="text-sm">{notif.displayName} wants to messege you!</p>
                </button>
                <div className="hbar"/>
                </>
                )
            }
        </div>
    }
    </>
}