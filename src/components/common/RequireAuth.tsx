import { Navigate } from "react-router-dom";
import React from "react";

export default function RequireAuth({children}: {children: React.ReactNode}) {
    const token = localStorage.getItem("access_token");
     ;

    if (!token){
        return <Navigate to="/" replace/>
    }
    
    return children
}
