import React from "react";
import texture from "../../../assets/image/image.png";
import loginImage from '../../../assets/image/agroimage.png';
import AdminLoginForm from "./components/adminLoginForm";
const Login: React.FC = () => {
  return (
      <div className="grid grid-cols-2 w-screen h-screen overflow-hidden">
          <img
            src={texture}
            alt="textura"
            className="absolute opacity-10 w-full h-full object-cover"
          />
        <section className=" relative">
        <AdminLoginForm/>
        </section>

        <section className="z-10 w-full">
          <img src={loginImage} className="w-full" alt="loginimage" />
        </section>
      </div>
  );
};

export default Login;
