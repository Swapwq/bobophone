import Image from "next/image";
import '../globals.css';
import FormLogin from "@/components/formLogin";

export default function Home() {
  return (
    <div className="flex justify-center">
      <div className="max-w-[300px] flex flex-col items-center text-white min-h-screen p-6 text-center">
        <Image alt="Logo" src='/logo.png' width={230} height={150}/>
        <h1 className="text-3xl font-bold mb-[10px]">Месснеджер</h1>
        <p className="text-xs text-[#AAAAAA] font-sans-serif mb-[20px]">Введите данные для регестрации:</p>
        <FormLogin/>
      </div>
    </div>
  );
}
