"use client";
import React from "react";
import { Bill } from "@/utils";
import BillRow from "@/components/BillRow";

interface Props {
  t: (key: string) => string;
  bills: Bill[];
  editMode: boolean;
  filterNeeded: boolean;
  selectedDate: Date;
  inputClass: string;
  setBills: React.Dispatch<any>;
  prepareUploadFile: (file: File | undefined, id: string) => void;
}

export default function BillsTable({
  t,
  bills,
  editMode,
  filterNeeded,
  selectedDate,
  inputClass,
  setBills,
  prepareUploadFile,
}: Props) {
  return (
    <div className="-z-5 max-w-5xl w-full from-black via-black items-center justify-center font-mono text-sm md:text-base flex">
      <table className="text-white">
        <thead>
          <tr>
            <th>{t("name")}</th>
            <th>{t("day")}</th>
            <th>{t("amount")}</th>
            <th>{t("file")}</th>
            {editMode && <th>{t("note")}</th>}
          </tr>
        </thead>
        <tbody>
          {bills?.map((bill: Bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              editMode={editMode}
              filterNeeded={filterNeeded}
              selectedDate={selectedDate}
              inputClass={inputClass}
              setBills={setBills}
              prepareUploadFile={prepareUploadFile}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
