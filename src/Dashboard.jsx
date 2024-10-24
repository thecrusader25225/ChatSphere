import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
export default function Dashboard(){
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
    return <div className="w-full h-full">
        <span className="flex justify-between">
            <p>Dashboard</p>
            <button onClick={signOutButton}>Sign out</button>
        </span>
    </div>
}   