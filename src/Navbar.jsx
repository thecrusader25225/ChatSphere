import { useState } from "react";
import { BiChat, BiEdit, BiSearch } from "react-icons/bi";
import { update, ref } from "firebase/database";
import { db } from "../firebase-config";
import { CgClose } from "react-icons/cg";
import { TiTick } from "react-icons/ti";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
export default function Navbar({user, username, setUsername}){
    const [isProfileOpen, setIsProfileOpen]=useState(false)
    const [isEditingUsername, setIsEditingUsername]=useState(false)
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

    return <><div className="w-full h-16 top-0 left-0 fixed border flex justify-between items-center">
        <span className="flex items-center">
            <BiChat />
            <p>Chat Sphere</p>
        </span>
        <span className="flex items-center">
          
            <img src={user?user.photoURL:"#"} className="rounded-full w-10 h-10 cursor-pointer" alt="pfp" onClick={()=>setIsProfileOpen(!isProfileOpen)}/>
        </span>
    </div>
    {   isProfileOpen &&
        <div className="absolute w-80 h-80 right-0 top-16 border p-8 flex flex-col justify-center items-center backdrop-blur-2xl rounded-3xl">
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
                    </> }
            </fieldset>
            <button className="hover:underline py-2" onClick={signOutButton}>Sign out</button>
    </div>}
    </>
}