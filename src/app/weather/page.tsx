"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, Cloud, CloudRain, Navigation, Search, Bell, User } from 'lucide-react';

export default function WeatherDesign() {
  // Настройка анимации скролла для эффекта параллакса
  const { scrollYProgress } = useScroll();
  const yQuote = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityQuote = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scaleCard = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  const days = [
    { day: 'Пнд', temp: '+22°', icon: <Sun className="text-yellow-400" /> },
    { day: 'Втр', temp: '+24°', icon: <Sun className="text-yellow-500" /> },
    { day: 'Срд', temp: '+21°', icon: <Cloud className="text-blue-200" /> },
    { day: 'Чтв', temp: '+19°', icon: <CloudRain className="text-blue-400" /> },
    { day: 'Птн', temp: '+23°', icon: <Sun className="text-yellow-400" /> },
  ];

  return (
    <main className="relative min-h-[200vh] bg-gradient-to-br from-blue-200 via-rose-100 to-orange-100 font-sans text-slate-800">
      
      {/* Фиксированный фон с мягким размытием при скролле */}
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center p-8 backdrop-blur-md">
        <h1 className="text-2xl font-serif tracking-widest font-bold">AURORA</h1>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-2 w-4 h-4 opacity-50" />
            <input 
              type="text" 
              placeholder="Поиск города..." 
              className="bg-white/20 border border-white/30 rounded-full py-1.5 pl-10 pr-4 outline-none focus:ring-2 ring-white/50 transition-all w-64"
            />
          </div>
          <Bell className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
          <User className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </header>

      {/* Контент */}
      <div className="relative z-10 pt-48 px-10 max-w-6xl mx-auto">
        
        {/* Секция с цитатой (исчезает при скролле) */}
        <motion.section 
          style={{ y: yQuote, opacity: opacityQuote }}
          className="text-center mb-40"
        >
          <span className="text-sm uppercase tracking-[0.3em] opacity-60 mb-4 block">Daily Inspiration</span>
          <h2 className="text-5xl md:text-7xl font-serif leading-tight max-w-4xl mx-auto">
            «Твоя улыбка — это солнце, которое разгоняет любые тучи»
          </h2>
          <p className="mt-8 text-lg italic opacity-70">— Твое утреннее вдохновение</p>
        </motion.section>

        {/* Виджет погоды (увеличивается при скролле) */}
        <motion.section 
          style={{ scale: scaleCard }}
          className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-[3rem] p-12 shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            {/* Текущая погода */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 opacity-60 mb-2">
                <Navigation size={16} />
                <span className="text-lg">Сан-Франциско, CA</span>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-9xl font-light tracking-tighter">+22°</span>
                <div className="pb-4 text-left leading-tight">
                  <p className="text-2xl font-medium">Ясно</p>
                  <p className="opacity-60">Ощущается как +24°</p>
                </div>
              </div>
            </div>{/* Детали */}
            <div className="grid grid-cols-2 gap-8 border-l border-white/20 pl-10">
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">Ветер</p>
                <p className="text-xl">5 м/с</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">Влажность</p>
                <p className="text-xl">65%</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">Осадки</p>
                <p className="text-xl">5%</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">УФ-индекс</p>
                <p className="text-xl">Низкий</p>
              </div>
            </div>
          </div>

          {/* Прогноз на неделю */}
          <div className="mt-16 flex justify-between items-center gap-4">
            {days.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/10 hover:bg-white/30 transition-colors cursor-pointer w-full">
                <span className="opacity-70">{item.day}</span>
                <div className="scale-125">{item.icon}</div>
                <span className="text-xl font-semibold">{item.temp}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Дополнительный контент для демонстрации скролла */}
        <section className="mt-20 py-20 text-center opacity-50">
           <p>Листай вниз, чтобы увидеть больше деталей...</p>
        </section>
      </div>
    </main>
  );
}