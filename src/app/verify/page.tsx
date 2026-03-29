'use client'

import React from 'react';
import { Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

const VerifyEmailPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-50">
        
        {/* Иконка конверта с анимацией "пульса" */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
          <div className="relative bg-blue-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
            <Mail className="text-white size-10" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Почти готово! 🚀</h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Мы отправили письмо с подтверждением на твою почту. 
          Пожалуйста, перейди по ссылке в письме, чтобы активировать свой аккаунт.
        </p>

        <div className="space-y-4">
          {/* Кнопка быстрого перехода в почту (опционально) */}
          <button 
            onClick={() => window.open('https://mail.google.com', '_blank')}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
          >
            Открыть почту <ExternalLink size={18} />
          </button>

          {/* Кнопка возврата на логин */}
          <button 
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
          >
            Войти в аккаунт <ArrowRight size={18} />
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Не пришло письмо? Проверь папку <b>Спам</b> или подожди пару минут.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;