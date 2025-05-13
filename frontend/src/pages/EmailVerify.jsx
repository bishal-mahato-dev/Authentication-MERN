import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const EmailVerify = () => {
    axios.defaults.withCredentials= true;
    const {backendUrl,isLoggedin, userData, getUserData} = useContext(AppContext);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (!/^\d$/.test(value)) {
      e.target.value = ''; // Only allow digits
      return;
    }

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, 6);
    paste.split('').forEach((char, index) => {
      if (/^\d$/.test(char) && inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler =async(e)=>{
    try {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e=>e.value);
        const otp =otpArray.join('');

        const {data} = await axios.post(backendUrl+"/api/auth/verify-account",{otp})
        if(data.success){
            toast.success(data.message);
            getUserData();
            navigate("/");
        }
        else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message);
    }
  }


  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/');
  },[isLoggedin,userData])
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-400 relative">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Verify Email</h1>
        <p className="text-indigo-300 text-center mb-6">Enter the 6-digit code sent to your email.</p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 bg-[#333A5c] text-white text-center text-xl rounded-md"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-800 text-white rounded-full cursor-pointer"
          // onClick={handleVerify} ← You can add this when you implement backend logic
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
