import { useSelector} from "react-redux";
import { RootState } from "../../store";
import { Navigate } from "react-router-dom";
import React from "react";

export default function RequireAuth({children}: {children: React.ReactNode}) {
    const token = useSelector((state: RootState) => state.auth.token);

    if (!token){
        return <Navigate to="/" replace/>
    }
    
    return children
}
