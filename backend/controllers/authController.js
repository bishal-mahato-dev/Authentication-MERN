import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  // sending welcom email
    const mailOptions = {
        from:process.env.SENDER_EMAIL,
        to:email,
        subject:'Welcome to advance authentication system',
        text:`Welcom to advance authentication system website. Your account has been created with email id: ${email}`
    }
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// send verification OTP to the User's email
export const sendVerifyOtp = async (req,res)=>{
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
                return res.json({success:false,message:"Account Already Verified"});
        }

       const otp= String(Math.floor(100000 +Math.random() * 900000));
       user.verifyOtp=otp;
       user.verifyOtpExpiredAt=Date.now()+24 * 60 *60*1000;
       await user.save();

       const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:user.email,
        subject:'Account Verification Otp',
        text:`Your OTP is ${otp}. Verify your account using this OTP`
       }
       await transporter.sendMail(mailOptions);
       res.json({success:true,message:`Verification OTP Sent on Email`});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

//verify the email using otp
export const verifyEmail = async (req,res)=>{
    
   try {
    const userId = req.userId;
    const {otp}=req.body;
    if(!userId|| !otp){
        return res.json({success:false,message:"Missing Details"});
    }

    const user = await userModel.findById(userId);
    if(!user){
        return res.json({ success: false, message: 'User not found' });
    }
    if(user.verifyOtp === '' || user.verifyOtp !== otp){
        return res.json({success:false,message:"Invalid OTP"})
    }

    if(user.verifyOtpExpiredAt < Date.now()){
        return res.json({success:false,message:"OTP Expired"});
    }

  user.isAccountVerified=true;
  user.verifyOtp='';
  user.verifyOtpExpiredAt=0;
  await user.save();
  return res.json({success:true,message:"Email verified successfully"});

   } catch (error) {
    res.status(500).json({ success: false, message: error.message });
   }

}


//check if user is authenticated

export const isAuthenticated = async(req,res)=>{
    try {
        return res.json({success:true});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

//set password reset using otp

export const sendResetOtp = async(req,res)=>{
  const {email}=req.body;
  if(!email){
    return res.json({success:false,message:"Email is Required"})
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
        return res.json({success:false,message:"User not found"});
    }

    const otp= String(Math.floor(100000 +Math.random() * 900000));
       user.resetOtp=otp;
       user.resetOtpExpiredAt=Date.now()+15 *60*1000;
       await user.save();

       const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:user.email,
        subject:'Password Reset OTP',
        text:`Your OTP is ${otp}. Use this OTP is to resetting your password`
       }
       await transporter.sendMail(mailOptions);
       res.json({success:true,message:` OTP Sent on Email`});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// reset user password

export const resetPassword = async (req,res)=>{
    try {
        const {email,otp,newPassword}= req.body;
        if(!email || !otp || !newPassword){
            return res.json({success:false,message:"Missing Details"})
        }

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User Not Found"});
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success:false,message:"Invalid OTP"})
        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({success:false,message:"OTP Expired"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.resetOtp='';
        user.resetOtpExpiredAt=0;
        await user.save();

        res.json({success:true,message:"Password has been reset successfully"});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

