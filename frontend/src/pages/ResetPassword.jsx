import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email,setEmail]= useState('');
    const [newPassword,setNewPassword]=useState('');
    const [isEmailSent,setIsEmailSent] = useState('');
    const [otp,setOtp]=useState(0);
    const [isOtpSubmitted,setIsOtpSubmitted] =useState(false);
    const {backendUrl} = useContext(AppContext);
    axios.defaults.withCredentials=true;
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

    const onSubmitEmail = async (e)=>{
        try {
            e.preventDefault();
            const {data} =await axios.post(backendUrl +"/api/auth/send-reset-otp",{email});
            data.success? toast.success(data.message):toast.error(data.message);
            data.success && setIsEmailSent(true);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const onSubmitOtp = async(e)=>{
      
            e.preventDefault();
            const otpArray = inputRefs.current.map(e=>e.value);
            setOtp(otpArray.join(''));
            setIsOtpSubmitted(true);
       
    }
    const onSubmitNewPassword =async(e)=>{
        try {
            e.preventDefault();
            const {data} = await axios.post(backendUrl+"/api/auth/reset-password",{email,otp,newPassword});
            data.success?toast.success(data.message):toast.error(data.message);
            data.success && navigate("/login");
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
     <div className="flex items-center justify-center min-h-screen bg-purple-400 relative">
          <img
            onClick={() => navigate('/')}
            src={assets.logo}
            alt="Logo"
            className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
          />

          {/* enter email id */}
 {! isEmailSent && 
          <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
          <p className="text-indigo-300 text-center mb-6">Enter your registered email address</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" className='w-3 h-3'/>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} required
            type="email" placeholder='Email id' className='bg-transparent outline-none text-white'/>
          </div>
            <button className='w-full bg-purple-800 py-2.5 text-white rounded-full mt-3'> Submit</button>
          </form>
}

          {/* otp input form */}
          {! isOtpSubmitted && isEmailSent &&
          <form  onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password OTP</h1>
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
          className="w-full py-2.5 bg-purple-800 text-white rounded-full cursor-pointer"
          // onClick={handleVerify} ← You can add this when you implement backend logic
        >
          Submit
        </button>
      </form>
}
          {/* enter new Password */}
          {isOtpSubmitted && isEmailSent &&
          <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">New Password</h1>
          <p className="text-indigo-300 text-center mb-6">Enter the new password below</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" className='w-3 h-3'/>
            <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required 
            type="password" placeholder='Password' className='bg-transparent outline-none text-white'/>
          </div>
            <button className='w-full bg-purple-800 py-2.5 text-white rounded-full mt-3'> Submit</button>
          </form>
}
     </div>
  )
}

export default ResetPassword