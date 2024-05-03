"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, Bill, getBills, saveBills, getMonthData, setPaidBool, setMonthNote, uploadFile, deleteFile, downloadFile } from '@/utils';
import { TuiDateMonthPicker } from 'nextjs-tui-date-picker';
import { MdDeleteForever, MdFolderOpen } from "react-icons/md";
import { getTranslation } from '@/translations';


export default function Home() {
  const inputClass = "w-16 text-white bg-zinc-400/30";
  const router = useRouter();
  const [bills, setBills] = useState<Bill[] | []>([]);
  const [editMode, setEditMode] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  const [filterNeeded, setFilterNeeded] = useState(Boolean);
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState(String);
  const [unpaidList, setUnpaidList] = useState<String[] | []>([]);
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
    const promises = [getMonthData(shortDate,setPaid, setNote, setUnpaidList), getBills(shortDate, setBills, setFinished)];
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
          } else {
            element.amount=0;
          }
        }
        if (!element.day) {
          if (element.fixedDay) {
            element.day=element.fixedDayV;
          } else {
            element.day=0;
          }
        }
        if (!element.file) {
          element.file=false;
        }
        validatedBills.push(element);
      }
    })
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
                setUser({ email: user.email, uid: user.uid });
                fetchNewDate(selectedDate);
			} else {
				return router.push("/login");
			}
		});
	}, [router]);
  const t = (key: string) => getTranslation(key);

  useEffect(() => {
    isUserLoggedIn()
}, [isUserLoggedIn]);

if (!finished) return  <div className="flex justify-center border-b border-neutral-800 bg-gradient-to-b from-zinc-600/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:p-4">...</div>
  return (
    <main className="flex flex-col items-center justify-center p-24 border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
      <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm flex">
        <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => router.push("/manage")}>{t("manage")}</button>
        <button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus:ring focus:ring-orange-300 py-2 px-4 rounded-full" onClick={() => router.push("/chart")}>{t("charts")}</button>
        <button className="bg-lime-500 hover:bg-lime-600 active:bg-lime-700 focus:outline-none focus:ring focus:ring-lime-300 py-2 px-4 rounded-full" onClick={() => router.push("/misc")}>{t("misc")}</button>
      </div>
      <div className="z-10 w-0 from-black via-black items-center justify-end lg:justify-center font-sans text-sm flex">
        <>
          <TuiDateMonthPicker
            handleChange={dateChanged}
            date={selectedDate}
            inputWidth={140}
            fontSize={16}
          />
        </>
        <input type="checkbox" id="editing" name="editing" checked={editMode} onChange={() => setEditMode(!editMode)}></input>
        <label htmlFor="editing">{t("editMode")}</label><br></br>
      </div>
      <div className="mt-2 items-center justify-center flex text-red-500" style={{
        //show only if there is at least one unpaid month
        display: unpaidList.length>0 ? "block": "none"
      }}>
        <p>{t("unpaidMonths")}:</p>
        {unpaidList.map((unpaid: String, index: number) => (
          <p key={index}>{unpaid}</p>
        ))}
      </div>
      <div className="-z-5 max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm md:text-base flex">
        <table className="text-white">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("day")}</th>
              <th>{t("amount")}</th>
              <th>{t("file")}</th>
            </tr>
          </thead>
          <tbody>
            {/* get all when it's bimonth or else get only non-bimonthly */}
          {bills?.filter((entry:any) => (!filterNeeded || !entry.bimonthly)).map((bill: Bill) =>(
            <tr key={bill.id}>
            <td className='text-sm md:text-base'>{bill.name}</td>
            <td className='text-sm md:text-base'>
              {editMode ? (
                <input
                  type="number"
                  className={inputClass}
                  value={bill.day ? (bill.day) : (bill.fixedDay? (bill.fixedDayV): '' )}
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
              <td className='text-sm md:text-base'>
              {editMode? (
                <input
                  type="number"
                  className={inputClass}
                  value={bill.amount ? (bill.amount) : (bill.fixedAmount? (bill.fixedAmountV): '' )}
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
              {editMode? (
                (bill.file? (
                  <MdDeleteForever
                  className="text-3xl text-red-500 cursor-pointer"
                  onClick={() => {
                    deleteFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id);
                    setBills((prevBills: any) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, file: false } : prevBill
                    )
                    );
                  } } />
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
                ) )
              ) : (
                (bill.file? (
                  <MdFolderOpen 
                    className="text-3xl text-green-500 cursor-pointer"
                    onClick={() => {
                      downloadFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id, bill.name);
                    }}
                  />
                ) : (
                  <p></p>
                )
              )
              )
              }
            </td>
            </tr>
            ))} 
          </tbody>
        </table>
      </div>
      <div className="mt-2 items-center justify-center flex" style={{
        display: editMode? "block":"none"
      }}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => uploadBills()}>{t("saveChanges")}</button>
      </div>
      <div className="mt-2 items-center justify-end flex" style={{
        display: editMode? "block":"none"
      }}>
          <div>
            <input
              type="text"
              id="noteInput"
              name="noteInput"
              className={inputClass+' w-auto'}
              value={note}
              onChange={(e) => {setNote(e.target.value)}}
            />
          </div>
          <div className="mt-2 items-center justify-center flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => setMonthNote((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), note)}>{t("saveNote")}</button>
          </div>
      </div>
      <div className="mt-2 items-center justify-center flex" style={{
        // display label when not editing and note exists
        display: editMode? "none": (note==''? "none" : "block")
      }}>
        {note}
      </div>
      <div className="mt-2 items-center justify-center flex">
      {paid? (
        <><p className={`m-0 max-w-[30ch] opacity-80 text-emerald-500`}>
            {t("monthIsPaid")}
          </p><button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => uploadPaid(false)}>{t("change")}</button></>
      ) : (
        <><p className={`m-0 max-w-[30ch] opacity-80 text-rose-500`}>
            {t("monthIsNotPaid")}
          </p><button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => uploadPaid(true)}>{t("change")}</button></>
      )}
      </div>
    </main>
  );
}
