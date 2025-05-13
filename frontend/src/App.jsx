import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword';
import PageNotFound from './pages/PageNotFound'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <div >
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='*' element={<PageNotFound/>}/>
      </Routes>
    </div>
  )
}

export default App