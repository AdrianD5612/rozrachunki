"use client";
import React from "react";

interface Props {
  t: (key: string) => string;
  editMode: boolean;
  note: string;
  setNote: (v: string) => void;
  onSaveNote: () => void;
  inputClass: string;
}

export default function MonthNoteEditor({
  t,
  editMode,
  note,
  setNote,
  onSaveNote,
  inputClass,
}: Props) {
  return (
    <div
      className="mt-2 items-center justify-end flex"
      style={{ display: editMode ? "block" : "none" }}
    >
      <div>
        <input
          type="text"
          id="noteInput"
          name="noteInput"
          className={inputClass + " w-auto"}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </div>
      <div className="mt-2 items-center justify-center flex">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={onSaveNote}
        >
          {t("saveNote")}
        </button>
      </div>
    </div>
  );
}
