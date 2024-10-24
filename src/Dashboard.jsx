import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, ref, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import SearchBox from "./SearchBox";
export default function Dashboard({user, setUser}){
    const navigate=useNavigate()
    const [username, setUsername]=useState("")
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
    console.log(user)
    return <div className="w-full h-full flex ">
        <span className="w-1/4 h-full">
        <SearchBox/>
        </span>
        <span className="flex justify-between flex-col w-3/4 h-full">
            <p>Dashboard</p>
            
                <p>{user? user.displayName:"null"}</p>
                <p>{user?user.email:"null"}</p>
                <p>username:{user?user.username:"null"}</p>
                <img className="w-12 h-12" src={user?user.photoURL:"#"} alt="pfp"/>
            <input placeholder="username" onChange={(e)=>setUsername(e.target.value)}/><button onClick={()=>update(ref(db, `users/${user.uid}`),{username:username})}>Save</button>
            <button onClick={signOutButton}>Sign out</button>
        </span>
    </div>
}   