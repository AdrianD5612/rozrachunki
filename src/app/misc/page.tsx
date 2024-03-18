"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MiscBill, getMiscBills, addMiscBill, deleteMiscBill, saveMiscBills, errorMessage } from '@/utils';
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

export default function Home() {
    const enabledClass='text-white';
    const disabledClass='text-gray-500';
    const router = useRouter();
    const [finished, setFinished] = useState(false);
    const [bills, setBills] = useState<MiscBill[] | []>([]);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      let ignore = false;
      
      if (!ignore)  getMiscBills(setBills, setFinished)
      return () => { ignore = true; }
      },[]);

    if (!finished) return  <div className="flex justify-center border-b border-neutral-800 bg-gradient-to-b from-zinc-600/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:p-4">Ładowanie, proszę czekać...</div>
    return (
      <main className="flex flex-col gap-1 items-center justify-center p-24 border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4 lg:bg-zinc-800/30">
        <div className=" from-black via-black items-center justify-center font-mono text-sm lg:flex">
          <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => router.push("/")}>Strona główna</button>
        </div>
        <div className="m-2 items-center justify-center flex">
        <input type="checkbox" id="editing" name="editing" checked={editMode} onChange={() => setEditMode(!editMode)}></input>
        <label htmlFor="editing">Tryb edycji</label><br></br>
        </div>
        <div className="max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm lg:flex">
            <table className="text-white">
              <thead>
                <tr>
                  {editMode &&
                  <th>#</th>
                  }
                  <th>Nazwa</th>
                  <th>Kwota</th>
                  <th>Aktywne</th>
                  {editMode &&
                  <th>Usuń</th>
                  }
                </tr>
              </thead>
              <tbody>
              {bills?.map((bill: MiscBill, i) =>(
                <tr key={bill.id}>
                {editMode &&
                  <td className='md:text-md text-sm items-center justify-center'>
                    <MdArrowUpward
                    className="text-white cursor-pointer"
                    onClick={() => {
                      const newBills = [...bills];
                      const currentIndex = newBills.findIndex((billTemp: MiscBill) => billTemp.id === bill.id);
                      const previousIndex = currentIndex - 1;
                      if (previousIndex >= 0) {
                        const currentBill = newBills[currentIndex];
                        const previousBill = newBills[previousIndex];
                        newBills[currentIndex] = { ...currentBill, order: currentBill.order - 1 };
                        newBills[previousIndex] = { ...previousBill, order: previousBill.order + 1 };
                        saveMiscBills(newBills);
                      } else {
                        errorMessage('Nie mogę przenieść wpisu wyżej');
                      }
                    }}
                    />
                    <MdArrowDownward
                    className="text-white cursor-pointer"
                    onClick={() => {
                      const newBills = [...bills];
                      const currentIndex = newBills.findIndex((billTemp: MiscBill) => billTemp.id === bill.id);
                      const nextIndex = currentIndex + 1;
                      if (nextIndex < newBills.length) {
                        const currentBill = newBills[currentIndex];
                        const nextBill = newBills[nextIndex];
                        newBills[currentIndex] = { ...currentBill, order: currentBill.order + 1 };
                        newBills[nextIndex] = { ...nextBill, order: nextBill.order - 1 };
                        saveMiscBills(newBills);
                      } else {
                        errorMessage('Nie mogę przenieść wpisu niżej');
                      }
                    }}
                    />
                  </td>
                }
                <td className='md:text-md text-sm'>
                  {editMode ? (
                  <input
                    type="string"
                    className='w-30 text-white bg-zinc-400/30'
                    value={bill.name}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: MiscBill) =>
                          prevBill.id === bill.id ? { ...prevBill, name: newValue } : prevBill
                        )
                      );
                    }}
                  />
                  ) : (
                    <p className={bill.active? enabledClass : disabledClass}>
                      {bill.name}</p>
                  )
                  }
                </td>
                <td className='md:text-md text-sm'>
                  {editMode ? (
                  <input
                    type="number"
                    className='w-16 text-white bg-zinc-400/30'
                    value={bill.amount}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: MiscBill) =>
                          prevBill.id === bill.id ? { ...prevBill, amount: newValue } : prevBill
                        )
                      );
                    }}
                  />
                  ) : (
                    <p className={bill.active? enabledClass : disabledClass}>
                    {bill.amount}</p>
                  )
                  }
                </td>
                <td className='md:text-md text-sm'>
                  {editMode ? (
                  <input
                    type="checkbox"
                    className='w-16'
                    checked={bill.active}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: MiscBill) =>
                          prevBill.id === bill.id ? { ...prevBill, active: newValue } : prevBill
                        )
                      );
                    }}
                  />
                  ) : (
                    <input
                    type="checkbox"
                    className='w-16'
                    checked={bill.active}
                    readOnly
                    />
                  )
                  }
                  
                </td>
                {editMode &&
                  <td>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                      const isConfirmed = confirm("Czy na pewno chcesz usunąć ten wpis?")
                      if (isConfirmed) {
                        deleteMiscBill(bill.id)
                      }
                  }
                  }
                    >Usuń</button>
                  </td>}
                </tr>
                ))} 
              </tbody>
            </table>
          </div>
          <div className="mt-2 items-center justify-center flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => addMiscBill(bills.length)}>Utwórz nowy</button>
          </div>
          <div className="mt-2 items-center justify-center flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => saveMiscBills(bills)}>Zapisz zmiany</button>
          </div>
      </main>
    )
}