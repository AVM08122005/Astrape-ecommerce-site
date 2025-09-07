"use client";
import { useEffect, useState } from "react";

export default function ProfilePage(){
  const [user, setUser] = useState(null);
  useEffect(()=>{ (async()=>{
    try{
      const res = await fetch("/api/profile");
      if(!res.ok) return;
      const data = await res.json();
      setUser(data.user);
    }catch(e){console.error(e);}
  })(); }, []);

  if(!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-4">
        <div className="text-sm text-gray-600">Name</div>
        <div className="font-medium">{user.name}</div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-gray-600">Email</div>
        <div className="font-medium">{user.email}</div>
      </div>
    </div>
  );
}
