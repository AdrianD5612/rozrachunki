"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, BillLite, getBillsToManage, saveBills, deleteBill, addBill, saveManagedBills, errorMessage, LogOut } from '@/utils';
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { getTranslation , switchLang} from '@/translations';


export default function Home() {
    const checkboxClass="text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600";
    const enabledClass='w-20 border-2 border-green-500 text-white bg-zinc-400/30';
    const disabledClass='w-20 border-2 border-black text-white bg-zinc-400/30';
    const router = useRouter();
    const [finished, setFinished] = useState(false);
    const [bills, setBills] = useState<BillLite[] | []>([]);
    const t = (key: string) => getTranslation(key);

    useEffect(() => {
      let ignore = false;
      
      if (!ignore)  getBillsToManage(setBills, setFinished)
      return () => { ignore = true; }
      },[]);

    if (!finished) return  <div className="flex justify-center border-b border-neutral-800 bg-gradient-to-b from-zinc-600/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:p-4">...</div>
    return (
        <main className="flex flex-col gap-1 items-center justify-center p-24 border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4 lg:bg-zinc-800/30">
    
          <div className=" from-black via-black items-center justify-center font-mono text-sm lg:flex">
            <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => router.push("/")}>{t("mainPage")}</button>
            <button className="bg-lime-500 hover:bg-lime-600 active:bg-lime-700 focus:outline-none focus:ring focus:ring-lime-300 py-2 px-4 rounded-full" onClick={() => {
              switchLang()
              router.refresh()}}>{t("switchLang")}</button>
            <button className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 py-2 px-4 rounded-full" onClick={() => LogOut(router)}>{t("logOut")}</button>
          </div>

          <div className="max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm lg:flex">
            <table className="text-white">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("name")}</th>
                  <th>{t("frequency")}</th>
                  <th>{t("fixedD")}</th>
                  <th>{t("fixedA")}</th>
                  <th>{t("delete")}</th>
                </tr>
              </thead>
              <tbody>
              {bills?.map((bill: BillLite, i) =>(
                <tr key={bill.id}>
                <td className='md:text-md text-sm items-center justify-center'>
                  <MdArrowUpward
                  className="text-white cursor-pointer"
                  onClick={() => {
                    const newBills = [...bills];
                    const currentIndex = newBills.findIndex((billTemp: BillLite) => billTemp.id === bill.id);
                    const previousIndex = currentIndex - 1;
                    if (previousIndex >= 0) {
                      const currentBill = newBills[currentIndex];
                      const previousBill = newBills[previousIndex];
                      newBills[currentIndex] = { ...currentBill, order: currentBill.order - 1 };
                      newBills[previousIndex] = { ...previousBill, order: previousBill.order + 1 };
                      saveManagedBills(newBills);
                    } else {
                      errorMessage(t("cantMoveUp"));
                    }
                  }}
                  />
                  <MdArrowDownward
                  className="text-white cursor-pointer"
                  onClick={() => {
                    const newBills = [...bills];
                    const currentIndex = newBills.findIndex((billTemp: BillLite) => billTemp.id === bill.id);
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < newBills.length) {
                      const currentBill = newBills[currentIndex];
                      const nextBill = newBills[nextIndex];
                      newBills[currentIndex] = { ...currentBill, order: currentBill.order + 1 };
                      newBills[nextIndex] = { ...nextBill, order: nextBill.order - 1 };
                      saveManagedBills(newBills);
                    } else {
                      errorMessage(t("cantMoveDown"));
                    }
                  }}
                  />
                </td>
                <td className='md:text-md text-sm'>
                  <input
                    type="string"
                    className='w-30 text-white bg-zinc-400/30'
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
                  <label htmlFor={bill.id}className="ms-1 text-sm font-medium text-gray-300">{t("bimonthly")}</label>
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
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                      const isConfirmed = confirm(t("confirmDelete"));
                      if (isConfirmed) {
                        deleteBill(bill.id)
                      }
                  }
                  }
                    >{t("delete")}</button>
                </td>
                </tr>
                ))} 
              </tbody>
            </table>
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => addBill(bills.length)}>{t("createNew")}</button>
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => saveManagedBills(bills)}>{t("saveChanges")}</button>
          </div>
        </main>
    )
}