"use client";
import React from "react";

interface Props {
  t: (key: string) => string;
  editMode: boolean;
  onSave: () => void;
}

export default function SaveChangesBar({ t, editMode, onSave }: Props) {
  return (
    <div
      className="mt-2 items-center justify-center flex"
      style={{ display: editMode ? "block" : "none" }}
    >
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={onSave}
      >
        {t("saveChanges")}
      </button>
    </div>
  );
}
