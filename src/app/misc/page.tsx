"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MiscBill, getMiscBills, addMiscBill, deleteMiscBill, saveMiscBills } from '@/utils';

export default function Home() {
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
                  <th>Nazwa</th>
                  <th>Kwota</th>
                  <th>Aktywne</th>
                  <th>Usuń</th>
                </tr>
              </thead>
              <tbody>
              {bills?.map((bill: MiscBill, i) =>(
                <tr key={bill.id}>
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
                    bill.name
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
                    bill.amount
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
                    bill.active? "Aktywne" : "Nieaktywne"
                  )
                  }
                  
                </td>
                <td>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                      const isConfirmed = confirm("Czy na pewno chcesz usunąć ten wpis?")
                      if (isConfirmed) {
                        deleteMiscBill(bill.id)
                      }
                  }
                  }
                    >Usuń</button>
                </td>
                </tr>
                ))} 
              </tbody>
            </table>
          </div>
          <div className="mt-2 items-center justify-center flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => addMiscBill()}>Utwórz nowy</button>
          </div>
          <div className="mt-2 items-center justify-center flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => saveMiscBills(bills)}>Zapisz zmiany</button>
          </div>
      </main>
    )
}