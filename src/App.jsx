import { useState } from "react"
import Dashboard from "./Dashboard";
import SignUp from "./SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App(){
  const [isSignedIn, setIsSignedIn]=useState(false);
  const [user, setUser]=useState(null);
  return <div className="w-screen h-screen bg-black text-white text-3xl">
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard isSignedIn={isSignedIn} user={user} setUser={setUser}/>}/>
      <Route path="/signup" element={<SignUp isSignedIn={isSignedIn} user={user} setUser={setUser}/>}/>

    </Routes>
    </BrowserRouter>
  </div>
}