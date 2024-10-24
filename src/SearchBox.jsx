import { equalTo, get, orderByChild, query, ref } from "firebase/database"
import { useState } from "react"
import { db } from "../firebase-config"

export default function SearchBox(){
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
    console.log("search user data ", userdata)
    return <div className="w-full h-full border flex flex-col">
        <input type="text" className="bg-transparent" onChange={e=>setUsername(e.target.value)}/>
        <button onClick={searchUser}>Search</button>
        {userdata &&
            <span className="flex">
                <p>{userdata.displayName}</p>
            </span>
        }
    </div>
}