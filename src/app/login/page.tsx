import Image from "next/image";
import Link from "next/link";
import Login from "@/components/regestraton";

export default function Home() {
  return (
    <div className="flex justify-center">
      <div className="max-w-[300px] flex flex-col items-center text-white min-h-screen p-6 text-center">
        <Image alt="Logo" src='/logo.png' width={230} height={150}/>
        <h1 className="text-3xl font-bold mb-[10px]">Месснеджер</h1>
        <p className="text-xs text-[#AAAAAA] font-sans-serif mb-[20px]">Прежде всего вам необходимо войти в существующий или зарегестрировать новый аккаунт</p>
        <Login/>
        <div className="flex flex-col font-sans-serif text-[16px]">
          <Link href='/registration'><button className="cursor-pointer w-[280px] h-[38px] rounded-[8px] text-[#8774e1] hover:bg-[#8378db40]/50 duration-100">Регестрация</button></Link>
        </div>
      </div>
    </div>
  );
}
