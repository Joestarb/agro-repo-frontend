import { useSelector} from "react-redux";
import { RootState } from "../../store";
import { Navigate } from "react-router-dom";

export default function RequireAuth({children}: {children: JSX.Element}) {
    const token = useSelector((state: RootState) => state.auth.token);

    if (!token){
        return <Navigate to="/" replace/>
    }
    
    return children
}
