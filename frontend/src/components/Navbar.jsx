import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData,backendUrl,setIsLoggedin,setUserData } = useContext(AppContext);

  const sendVerificationOtp = async()=>{
    try {
        axios.defaults.withCredentials=true;
        const {data} = await axios.post(backendUrl +"/api/auth/send-verify-otp");
        if(data.success){
            navigate("/email-verify");
            toast.success(data.message);
        }
        else{
            toast.error(data.error)
        }
    } catch (error) {
        toast.error(error.message);
    }
  }

  const logout = async ()=>{
    try {
      const {data}= await axios.post(backendUrl+"/api/auth/logout");
     data.success && setIsLoggedin(false);
     data.success && setUserData(false);
     toast.success(data.message);
     navigate("/");

    } catch (error) {
        toast.error(data.message);
    }
  }

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />

      {userData ? (
        <div className="relative group w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-8 right-0 bg-white text-black shadow-lg rounded-md w-40 z-10">
            <ul className="p-2">
                {!userData.isAccountVerified && <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">Verify Email</li>}
              
              <li onClick={logout} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">Log Out</li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 cursor-pointer text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
