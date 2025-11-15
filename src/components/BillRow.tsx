"use client";
import React from "react";
import { Bill, deleteFile, downloadFile } from "@/utils";
import { MdDeleteForever, MdFolderOpen } from "react-icons/md";

interface Props {
  bill: Bill;
  editMode: boolean;
  filterNeeded: boolean;
  selectedDate: Date;
  inputClass: string;
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  prepareUploadFile: (file: File | undefined, id: string) => void;
}

export default function BillRow({
  bill,
  editMode,
  filterNeeded,
  selectedDate,
  inputClass,
  setBills,
  prepareUploadFile,
}: Props) {
  const displayStyle = (!bill.bimonthly && !bill.bimonthlyOdd)
    ? "table-row"
    : (bill.day
        ? "table-row"
        : (((!filterNeeded || !bill.bimonthly) && (filterNeeded || !bill.bimonthlyOdd) && (selectedDate.getMonth() + 1 == new Date().getMonth() + 1 || editMode))
            ? "table-row"
            : "none"));

  const noteDisplayStyle = !bill.noteEnabled
    ? "none"
    : ((!bill.bimonthly && !bill.bimonthlyOdd)
        ? "table-row"
        : (bill.day
            ? "table-row"
            : (((!filterNeeded || !bill.bimonthly) && (filterNeeded || !bill.bimonthlyOdd) && (selectedDate.getMonth() + 1 == new Date().getMonth() + 1 || editMode))
                ? "table-row"
                : "none")));

  return (
    <React.Fragment key={bill.id + 'Frag'}>
      <tr key={bill.id} style={{ display: displayStyle }}>
        <td className='text-sm md:text-base'>{bill.name}</td>
        <td className='text-sm md:text-base'>
          {editMode ? (
            <input
              type="number"
              className={inputClass}
              value={bill.day ? (bill.day) : (bill.fixedDay ? (bill.fixedDayV) : '')}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, day: newValue } : prevBill));
              }}
            />
          ) : (
            bill.day
          )}
        </td>
        <td className='text-sm md:text-base'>
          {editMode ? (
            <input
              type="number"
              className={inputClass + ' w-20'}
              value={bill.amount ? (bill.amount) : (bill.fixedAmount ? (bill.fixedAmountV) : '')}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, amount: newValue } : prevBill));
              }}
            />
          ) : (
            bill.amount
          )}
        </td>
        <td>
          {editMode ? (
            bill.file ? (
              <MdDeleteForever
                className="text-3xl text-red-500 cursor-pointer"
                onClick={() => {
                  deleteFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id);
                  setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, file: false } : prevBill));
                }}
              />
            ) : (
              <input
                type="file"
                name="file"
                className="block w-full mb-5 text-xs border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400"
                onChange={(e) => {
                  prepareUploadFile(e.target.files?.[0], bill.id);
                  setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, file: true } : prevBill));
                }}
              />
            )
          ) : (
            bill.file ? (
              <MdFolderOpen
                className="text-3xl text-green-500 cursor-pointer"
                onClick={() => {
                  downloadFile((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), bill.id, bill.name);
                }}
              />
            ) : (
              <p></p>
            )
          )}
        </td>
        {editMode && (
          <td>
            <input
              type="checkbox"
              className='w-16'
              checked={bill.noteEnabled}
              onChange={(e) => {
                const newValue = e.target.checked;
                setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, noteEnabled: newValue } : prevBill));
              }}
            />
          </td>
        )}
      </tr>
      <tr key={bill.id + 'Note'} className='text-sm md:text-base' style={{ display: noteDisplayStyle }}>
        <td colSpan={4}>
          {editMode ? (
            <input
              type="text"
              className={inputClass + ' w-full'}
              value={bill.noteContent}
              onChange={(e) => {
                const newValue = e.target.value;
                setBills((prevBills: Bill[]) => prevBills.map((prevBill: Bill) => prevBill.id === bill.id ? { ...prevBill, noteContent: newValue } : prevBill));
              }}
            />
          ) : (
            <p>{bill.noteContent}</p>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}
