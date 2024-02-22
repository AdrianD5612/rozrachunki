"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, BillLite, getBillsToManage, saveBills, deleteBill, addBill, saveManagedBills } from '@/utils';
import { TuiDateMonthPicker } from 'nextjs-tui-date-picker';

export default function Home() {
    const checkboxClass="text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600";
    const enabledClass='w-16 border-2 border-green-500';
    const disabledClass='w-16 border-2';
    const router = useRouter();
    const [finished, setFinished] = useState(false);
    const [bills, setBills] = useState<BillLite[] | []>([]);


    useEffect(() => {
      let ignore = false;
      
      if (!ignore)  getBillsToManage(setBills, setFinished)
      return () => { ignore = true; }
      },[]);

    if (!finished) return  <div className="flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">Ładowanie, proszę czekać...</div>
    return (
        <main className="flex flex-col items-center justify-center p-24 border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4 lg:bg-zinc-800/30">
    
          <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm lg:flex">
            
          </div>

          <div className="-z-5 max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm lg:flex">
            <table className="text-white">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Cykliczność</th>
                  <th>Stały termin</th>
                  <th>Stała kwota</th>
                  <th>Usuń</th>
                </tr>
              </thead>
              <tbody>
              {bills?.map((bill: BillLite, i) =>(
                <tr key={bill.id}>
                <td className='md:text-md text-sm'>
                  <input
                    type="string"
                    className='w-16'
                    value={bill.name}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: BillLite) =>
                          prevBill.id === bill.id ? { ...prevBill, name: newValue } : prevBill
                        )
                      );
                    }}
                  />
                </td>
                <td className='md:text-md text-sm'>
                  <input
                    id={bill.id}
                    type="checkbox"
                    className={checkboxClass}
                    checked={bill.bimonthly}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: BillLite) =>
                          prevBill.id === bill.id ? { ...prevBill, bimonthly: newValue } : prevBill
                        )
                      );
                    }}
                  />
                  <label htmlFor={bill.id}className="ms-1 text-sm font-medium text-gray-300">Co 2 miesiące</label>
                </td>
                <td className='md:text-md text-sm'>
                  <input
                    type="checkbox"
                    className='w-16'
                    checked={bill.fixedDay}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: BillLite) =>
                          prevBill.id === bill.id ? { ...prevBill, fixedDay: newValue } : prevBill
                        )
                      );
                    }}
                  />
                  <input
                    type="number"
                    className={bill.fixedDay? enabledClass : disabledClass}
                    value={bill.fixedDayV}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setBills((prevBills: any) =>
                        prevBills.map((prevBill: BillLite) =>
                          prevBill.id === bill.id ? { ...prevBill, fixedDayV: newValue } : prevBill
                        )
                      );
                    }}
                  />
                </td>
                <td className='md:text-md text-sm'>
                <input
                  type="checkbox"
                  className='w-16'
                  checked={bill.fixedAmount}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setBills((prevBills: any) =>
                      prevBills.map((prevBill: BillLite) =>
                        prevBill.id === bill.id ? { ...prevBill, fixedAmount: newValue } : prevBill
                      )
                    );
                  }}
                />
                <input
                  type="number"
                  className={bill.fixedAmount? enabledClass : disabledClass}
                  value={bill.fixedAmountV}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    setBills((prevBills: any) =>
                      prevBills.map((prevBill: BillLite) =>
                        prevBill.id === bill.id ? { ...prevBill, fixedAmountV: newValue } : prevBill
                      )
                    );
                  }}
                />
                </td>
                <td>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteBill(bill.id)}>Usuń</button>
                </td>
                </tr>
                ))} 
              </tbody>
            </table>
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => addBill()}>Utwórz nowy</button>
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => saveManagedBills(bills)}>Zapisz zmiany</button>
          </div>
        </main>
    )
}