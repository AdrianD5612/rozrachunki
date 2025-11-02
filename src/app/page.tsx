"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { User, Bill, getBills, saveBills, getYears, getMonthData, setPaidBool, setMonthNote, uploadFile } from '@/utils';
import { getTranslation } from '@/translations';
import NavButtons from '@/components/NavButtons';
import DateControls from '@/components/DateControls';
import UnpaidBanner from '@/components/UnpaidBanner';
import BillsTable from '@/components/BillsTable';
import SaveChangesBar from '@/components/SaveChangesBar';
import MonthNoteEditor from '@/components/MonthNoteEditor';
import MonthNoteDisplay from '@/components/MonthNoteDisplay';
import PaidStatusBar from '@/components/PaidStatusBar';


export default function Home() {
  const inputClass = "w-16 text-white bg-zinc-400/30";
  const router = useRouter();
  const [years, setYears] = useState<number[]>([1970]);
  const [bills, setBills] = useState<Bill[] | []>([]);
  const [editMode, setEditMode] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date(Date.now()).getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date(Date.now()).getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  const [filterNeeded, setFilterNeeded] = useState(Boolean);
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState(String);
  const [unpaidList, setUnpaidList] = useState<String[] | []>([]);
  const dateChanged = (selected: number) => {
    if (selected > 12) {
      setSelectedDate(new Date(selected, selectedMonth-1, 1));
    fetchNewDate(new Date(selected, selectedMonth-1, 1));
    }
    else {
    setSelectedDate(new Date(selectedYear, selected-1, 1));
    fetchNewDate(new Date(selectedYear, selected-1, 1));
    }
  }

  const fetchYears = async () => {
    getYears(setYears);
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
      if ((filterNeeded && element.bimonthly) || (!filterNeeded && element.bimonthlyOdd)) {
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
        if (!element.noteEnabled) {
          element.noteEnabled=false;
        }
        if (!element.noteContent) {
          element.noteContent='';
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
                fetchYears().then(() => fetchNewDate(selectedDate));
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
      <NavButtons
        t={t}
        onManage={() => router.push("/manage")}
        onChart={() => router.push("/chart")}
        onMisc={() => router.push("/misc")}
      />

      <DateControls
        t={t}
        years={years}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        dateChanged={dateChanged}
        editMode={editMode}
        toggleEditMode={() => setEditMode(!editMode)}
      />

      <UnpaidBanner t={t} unpaidList={unpaidList} />

      <BillsTable
        t={t}
        bills={bills as Bill[]}
        editMode={editMode}
        filterNeeded={filterNeeded as any}
        selectedDate={selectedDate}
        inputClass={inputClass}
        setBills={setBills}
        prepareUploadFile={prepareUploadFile}
      />

      <SaveChangesBar t={t} editMode={editMode} onSave={() => uploadBills()} />

      <MonthNoteEditor
        t={t}
        editMode={editMode}
        note={note as any}
        setNote={(v: any) => setNote(v)}
        onSaveNote={() => setMonthNote((selectedDate.getFullYear().toString() + '.' + (selectedDate.getMonth() + 1).toString()), note as any)}
        inputClass={inputClass}
      />

      <MonthNoteDisplay editMode={editMode} note={note as any} />

      <PaidStatusBar t={t} paid={paid} onChangePaid={uploadPaid} />
    </main>
  );
}

