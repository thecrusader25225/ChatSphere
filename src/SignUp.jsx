import { useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebase-config";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { useState } from "react";
export default function SignUp({user, setUser, isSignedIn}){
    const [userExists, setUserExists]=useState(false)
    const navigate=useNavigate()
    function signIn(){
        signInWithPopup(auth, provider)
  .then((result) => {
    if(!result || !result.user)new Error("Info not found")
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    setUser(user)
    //check if the user exists or not
    onValue(ref(db, `users/${user.uid}`), snapshot=>{
        if(snapshot.exists()){
            console.log("user already exists")
            setUserExists(true)
        }
        else{
            console.log("User doesnt exist. saving user info")
            set(ref(db, `/users/${user.uid}`), {
            displayName:user.displayName,
            photoURL:user.photoURL,
            email:user.email,
            uid:user.uid
            }
        )
    }
    })
    console.log(userExists)
    // console.log(user)
    console.log("Signed in")
    navigate("/")   
    

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
  });
    }
    return <div className="w-full h-full flex justify-center items-center">
        <div className="h-96 w-96 border">
            <span className="flex flex-col justify-center items-center">
                <button onClick={signIn}>Sign Up</button>
                <p></p>
            </span>


        </div>
    </div>
}