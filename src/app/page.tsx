"use client"
import Image from "next/image";
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, getBills } from '@/utils';
import { TuiDateMonthPicker } from 'nextjs-tui-date-picker';

interface Bill {
  id: string;
  bimonthly: boolean;
  fixed: boolean;
  name: string;
  amount: number;
  day: number;
}

export default function Home() {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [finished, setFinished] = useState(false);
  //hardcoded date
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  //const [selectedDate, setSelectedDate] = useState('2024-01');
  const dateChanged = (value: string) => {
    setSelectedDate(new Date(value));
    fetchNewDate(new Date(value));
  }
  const fetchNewDate = async (givenDate: Date) => {
    setFinished(false);
    let shortDate=(givenDate.getFullYear().toString()+'.'+(givenDate.getMonth()+1).toString());
    console.log(shortDate);
    const promises = [getBills(shortDate, setBills, setFinished)];
    await Promise.all(promises);
  }
  const [user, setUser] = useState<User>();
  const isUserLoggedIn = useCallback(() => {
		onAuthStateChanged(auth, async (user) => {
            if (user) {
                //let shortDate=selectedDate.toString().substring(0,7);
                setUser({ email: user.email, uid: user.uid });
                fetchNewDate(selectedDate);
			} else {
				return router.push("/login");
			}
		});
	}, [router]);

  useEffect(() => {
    isUserLoggedIn()
}, [isUserLoggedIn]);

if (!finished) return  <div className="flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">Ładowanie, proszę czekać...</div>
  return (
    <main className="flex flex-col items-center justify-center p-24 border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4 lg:bg-zinc-800/30">

      <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm lg:flex">
        <>
          <TuiDateMonthPicker
            handleChange={dateChanged}
            date={selectedDate}
            inputWidth={140}
            fontSize={16}
          />
        </>
      </div>

      <div className="-z-5 max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm lg:flex">
        <table className="text-white">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Termin</th>
              <th>Kwota</th>
            </tr>
          </thead>
          <tbody>
            {bills?.map((bill: Bill) =>(
            <tr key={bill.id}>
            <td className='md:text-md text-sm'>{bill.name}</td>
            <td className='md:text-md text-sm'>{bill.day}</td>
            <td className='md:text-md text-sm'>{bill.amount}</td>
            </tr>
            ))}   
          </tbody>
        </table>


      </div>



      
      
    </main>
  );
}
