"use client"
import Image from "next/image";
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, Bill, getBills, saveBills, getPaid, setPaidBool, uploadFile, deleteFile, downloadFile } from '@/utils';
import { TuiDateMonthPicker } from 'nextjs-tui-date-picker';
import { MdDeleteForever, MdFolderOpen } from "react-icons/md";


export default function Home() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[] | []>([]);
  const [editMode, setEditMode] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  const [filterNeeded, setFilterNeeded] = useState(Boolean);
  const [paid, setPaid] = useState(true);
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
    const promises = [getPaid(shortDate,setPaid), getBills(shortDate, setBills, setFinished)];
    await Promise.all(promises);
  }
  const uploadBills = () => {
    let validatedBills: Bill [];
    validatedBills=[];
    //validate if all fields are filled
    bills.forEach((element: Bill) => {
      if (filterNeeded && element.bimonthly) {
        } else {
        if (!element.amount) {
          if (element.fixedAmount) {
            element.amount=element.fixedAmountV;
            validatedBills.push(element);
          } else {
            element.amount=0;
            validatedBills.push(element);
          }
        } else {
          validatedBills.push(element);
        }
        if (!element.day) {
          if (element.fixedDay) {
            element.day=element.fixedDayV;
            validatedBills.push(element);
          } else {
            element.day=0;
            validatedBills.push(element);
          }
        } else {
          validatedBills.push(element);
        }
      }
    })
    //TODO DRY these if elses with push
    let shortDate=(selectedDate.getFullYear().toString()+'.'+(selectedDate.getMonth()+1).toString());
    saveBills(shortDate, validatedBills);
  }
  const uploadPaid = (state: boolean) => {
    setPaid(state);
    let shortDate=(selectedDate.getFullYear().toString()+'.'+(selectedDate.getMonth()+1).toString());
    setPaidBool(shortDate, state);
  }
  const prepareUploadFile = (file: File| undefined, id: string) => {
    if (file != undefined) {
      let shortDate=(selectedDate.getFullYear().toString()+'.'+(selectedDate.getMonth()+1).toString());
      uploadFile(file, shortDate, id);
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
      <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm lg:flex">
        <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => router.push("/manage")}>Zarządzaj</button>
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
              <th>Faktura</th>
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
                  className='w-16 text-black'
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
                  className='w-16 text-black'
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
            <td>
              {bill.file? (
                <><MdFolderOpen 
                    className="text-3xl text-green-500 cursor-pointer"
                    onClick={() => {
                      downloadFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id, bill.name);
                    }}
                  />
                <MdDeleteForever
                    className="text-3xl text-red-500 cursor-pointer"
                    onClick={() => {
                      deleteFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id);
                      setBills((prevBills: any) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, file: false } : prevBill
                      )
                      );
                    } } /></>
              ) : (
              <input
              type="file"
              name="file"
              className="block w-full mb-5 text-xs border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400"
              onChange={(e) => {
                prepareUploadFile(e.target.files?.[0], bill.id);
                setBills((prevBills: any) =>
                  prevBills.map((prevBill: Bill) =>
                    prevBill.id === bill.id ? { ...prevBill, file: true } : prevBill
                  )
                );
              }}
              />
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
      <div className="items-center justify-center lg:flex">
      {paid? (
        <><p className={`m-0 max-w-[30ch] opacity-80 text-emerald-500`}>
            Wybrany miesiąc został już oznaczony jako opłacony 🎉
          </p><button className="bg-rose-500 hover:bg-rose-600 active:bg-rose-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => uploadPaid(false)}>Nieopłacony</button></>
      ) : (
        <><p className={`m-0 max-w-[30ch] opacity-80 text-rose-500`}>
            Wybrany miesiąc nie został jeszcze oznaczony jako opłacony ❌
          </p><button className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => uploadPaid(true)}>Opłacony</button></>
      )}
      </div>
    </main>
  );
}
