"use client";
import React from "react";

interface Props {
  editMode: boolean;
  note: string;
}

export default function MonthNoteDisplay({ editMode, note }: Props) {
  return (
    <div
      className="mt-2 items-center justify-center flex"
      style={{ display: editMode ? "none" : note == "" ? "none" : "block" }}
    >
      {note}
    </div>
  );
}
