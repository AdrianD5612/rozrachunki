"use client";
import React from "react";

interface Props {
  t: (key: string) => string;
  unpaidList: String[];
}

export default function UnpaidBanner({ t, unpaidList }: Props) {
  return (
    <div
      className="mt-2 items-center justify-center flex text-red-500"
      style={{ display: unpaidList.length > 0 ? "block" : "none" }}
    >
      <p>{t("unpaidMonths")}:</p>
      {unpaidList.map((unpaid: String, index: number) => (
        <p key={index}>{unpaid}</p>
      ))}
    </div>
  );
}
