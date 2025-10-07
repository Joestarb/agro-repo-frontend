import React from "react";
import AdminLoginForm from "./components/adminLoginForm";
import AgroImage from "../../../assets/image/agroimage.png";
const Login: React.FC = () => {
  return (
      <div className="grid grid-cols-2 w-screen h-screen overflow-hidden bg-[#F2FFEF]">
        <section className=" relative">
        <AdminLoginForm/>
        </section>

        <section className="z-10 w-full">
          <img src={AgroImage} className="w-full" alt="AgroImage" />
        </section>
      </div>
  );
};

export default Login;
