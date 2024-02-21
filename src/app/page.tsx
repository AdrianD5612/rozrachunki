"use client"
import Image from "next/image";
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, Bill, getBills, saveBills } from '@/utils';
import { TuiDateMonthPicker } from 'nextjs-tui-date-picker';


export default function Home() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[] | []>([]);
  const [editMode, setEditMode] = useState(true); //set to false
  const [finished, setFinished] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  const [filterNeeded, setFilterNeeded] = useState(Boolean);
  const dateChanged = (value: string) => {
    setSelectedDate(new Date(value));
    fetchNewDate(new Date(value));
  }
  const fetchNewDate = async (givenDate: Date) => {
    setFinished(false);
    if ((givenDate.getMonth()+1)%2 == 0 ) {
      setFilterNeeded(false);
    } else {
      setFilterNeeded(true);
    }
    let shortDate=(givenDate.getFullYear().toString()+'.'+(givenDate.getMonth()+1).toString());
    console.log(shortDate);
    const promises = [getBills(shortDate, setBills, setFinished)];
    await Promise.all(promises);
  }
  const uploadBills = () => {
    let validatedBills: Bill [];
    validatedBills=[];
    let valid=true;
    //validate if all fields are filled
    bills.forEach((element: Bill) => {
      if (!element.amount) {
        if (element.fixedAmount) {
          element.amount=element.fixedAmountV;
          validatedBills.push(element);
        } else {
          valid=false;
        }
      } else {
        validatedBills.push(element);
      }
      if (!element.day) {
        if (element.fixedDay) {
          element.day=element.fixedDayV;
          validatedBills.push(element);
        } else {
          valid=false;
        }
      } else {
        validatedBills.push(element);
      }
    })
    if (valid) {
      setBills(validatedBills);
      let shortDate=(selectedDate.getFullYear().toString()+'.'+(selectedDate.getMonth()+1).toString());
      saveBills(shortDate, bills);
    }
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
      <div>
        <a href='/manage'>Zarządzaj</a>
      </div>
      <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm lg:flex">
        <>
          <TuiDateMonthPicker
            handleChange={dateChanged}
            date={selectedDate}
            inputWidth={140}
            fontSize={16}
          />
        </>
        <input type="checkbox" id="editing" name="editing" checked={editMode} onChange={() => setEditMode(!editMode)}></input>
        <label htmlFor="editing">Tryb edycji</label><br></br>
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
            {/* get all when it's bimonth or else get only non-bimonthly */}
          {bills?.filter((entry:any) => (!filterNeeded || !entry.bimonthly)).map((bill: Bill, i) =>(
            <tr key={bill.id}>
            <td className='md:text-md text-sm'>{bill.name}</td>
            <td className='md:text-md text-sm'>
              {editMode ? (
                <input
                  type="number"
                  className='w-16'
                  value={bill.day ? (bill.day) : (bill.fixedDay? (bill.fixedDayV): NaN )}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setBills((prevBills: any) =>
                      prevBills.map((prevBill: Bill) =>
                        prevBill.id === bill.id ? { ...prevBill, day: newValue } : prevBill
                      )
                    );
                  }}
                />
              ) : (
                bill.day
              )}
              </td>
              <td className='md:text-md text-sm'>
              {editMode? (
                <input
                  type="number"
                  className='w-16'
                  value={bill.amount ? (bill.amount) : (bill.fixedAmount? (bill.fixedAmountV): NaN )}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    setBills((prevBills: any) =>
                      prevBills.map((prevBill: Bill) =>
                        prevBill.id === bill.id ? { ...prevBill, amount: newValue } : prevBill
                      )
                    );
                  }}
                />
              ) : (
                bill.amount
              )}
            </td>
            </tr>
            ))} 
          </tbody>
        </table>
      </div>
      <div style={{
        display: editMode?"block":"none"
      }}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => uploadBills()}>Zapisz zmiany</button>
      </div>
    </main>
  );
}
