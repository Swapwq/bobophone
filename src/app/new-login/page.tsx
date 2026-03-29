import React from 'react';
import { Mail, Lock, Apple } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <div className="text-white text-3xl font-bold">M</div>
        </div>
        <h1 className="text-2xl font-bold mb-8">Welcome Back!</h1>
        
        <div className="space-y-4 text-left">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 size-5" />
            <input 
              type="email" 
              placeholder="Email or Phone" 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 size-5" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold mt-8 hover:bg-blue-600 transition-colors">
          Log In
        </button>

        <div className="mt-8">
          <p className="text-gray-400 text-sm mb-4">Social login</p>
          <div className="flex justify-center gap-4">
            <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50"></button>
            <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50"><Apple className="size-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;