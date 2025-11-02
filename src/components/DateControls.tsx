"use client";
import React from "react";
import SelectMenu from "@/components/SelectMenu";

interface Props {
  t: (key: string) => string;
  years: number[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  dateChanged: (v: number) => void;
  editMode: boolean;
  toggleEditMode: () => void;
}

export default function DateControls({
  t,
  years,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  dateChanged,
  editMode,
  toggleEditMode,
}: Props) {
  return (
    <div className="z-10 w-0 from-black via-black items-center justify-center font-sans text-sm flex">
      <>
        <SelectMenu
          entries={years}
          selected={selectedYear}
          setSelected={setSelectedYear}
          dateChanged={dateChanged}
        />
        <SelectMenu
          entries={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          selected={selectedMonth}
          setSelected={setSelectedMonth}
          dateChanged={dateChanged}
        />
      </>
      <input
        type="checkbox"
        id="editing"
        name="editing"
        checked={editMode}
        onChange={toggleEditMode}
      ></input>
      <label htmlFor="editing">{t("editMode")}</label>
      <br></br>
    </div>
  );
}
