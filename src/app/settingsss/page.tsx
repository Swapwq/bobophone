"use client";

import React from 'react';
import { 
  User, Bell, Palette, Lock, 
  LogOut, Camera, ChevronRight, Moon 
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-10">
      <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex overflow-hidden border border-gray-200">
        
        {/* Левая панель меню */}
        <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            <SettingsItem icon={<User size={20} />} label="Account" active />
            <SettingsItem icon={<Bell size={20} />} label="Notifications" />
            <SettingsItem icon={<Palette size={20} />} label="Appearance" />
            <SettingsItem icon={<Lock size={20} />} label="Privacy & Security" />
          </nav>

          <div className="p-6 mt-auto border-t border-gray-100">
            <button className="flex items-center gap-3 text-red-500 font-medium hover:bg-red-50 w-full p-3 rounded-xl transition-all">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Правая панель с контентом (как на картинке) */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-2xl">
            {/* Профиль заголовок */}
            <div className="flex items-center gap-6 mb-10">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white border-2 border-white shadow-sm hover:bg-blue-600">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ivan Petrov</h2>
                <p className="text-green-500 flex items-center gap-1 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online Status
                </p>
              </div>
            </div>

            {/* Секция Account Info */}
            <section className="mb-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Info</h3>
              <div className="space-y-4">
                <InfoRow label="Phone" value="+(13) 356 7980" />
                <InfoRow label="Username" value="@ivanp" />
                <InfoRow label="Status" value="Available" />
              </div>
            </section>

            {/* Секция Appearance (как на картинке) */}
            <section className="mb-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Appearance</h3>
              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
                <button className="px-6 py-2 bg-white rounded-xl shadow-sm text-sm font-bold">Light</button>
                <button className="px-6 py-2 text-gray-500 hover:text-gray-900 text-sm font-bold flex items-center gap-2">
                  <Moon size={16} />
                  Dark Mode
                </button>
              </div>
            </section>

            {/* Account Management */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Management</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-700">Change Password</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Вспомогательные компоненты для чистоты кода
function SettingsItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
    }`}>
      {icon}
      <span className="font-bold">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col border-b border-gray-50 pb-3">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );
}