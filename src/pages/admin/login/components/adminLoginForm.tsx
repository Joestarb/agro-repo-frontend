import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../../services/api";
import { setToken } from "../../../../slices/authSlice";
import Input from "../../../../components/common/Input";
import Button from "../../../../components/common/Button";

const AdminLoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, {isLoading}] = useLoginMutation();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {

        const result = await login({ email, password }).unwrap();
        dispatch(setToken(result.access_token));
        // Guarda el token en localStorage
        console.log("Token recibido:", result.access_token);
        localStorage.setItem("access_token", result.access_token);
        navigate("/admin/dashboard");
        } catch (err) {
        console.log(err);
        setError("Error al iniciar sesión. Por favor verifica tus credenciales.");
        }
    };

    return (
        <div className="min-h-screen     flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                {/* Encabezado */}
                <div className="text-center mb-8">
                {/* <img
                    src={''}
                    alt="Logo"
                    className="mx-auto mb-4"
                /> */}

                    <h3 className="text-2xl font-bold text-green-800">Ingresar</h3>

                </div>

                {/* Formulario de Login */}
                <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    </div>
                )}

                <div>
                    <Input
                    type="text"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Correo electrónico"
                    name="email"
                    required={true}
                    />
                </div>

                <div>
                    <Input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Contraseña"
                    name="password"
                    required={true}
                    />
                </div>

                <div>
                    <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                   
                </div>
                </form>

                {/* Información adicional */}
                <div className="mt-8 text-center text-sm text-gray-600">
                <p className="font-medium">
                    Comunícate con nosotros el día que prefieras
                </p>
                <p>(Lunes a viernes de 8 a 4)</p>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="font-semibold text-blue-800 underline">
                    Recuperar Contraseña
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
    };

export default AdminLoginForm;
