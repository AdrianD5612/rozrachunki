"use client";
import React from "react";

interface Props {
  t: (key: string) => string;
  paid: boolean;
  onChangePaid: (state: boolean) => void;
}

export default function PaidStatusBar({ t, paid, onChangePaid }: Props) {
  return (
    <div className="mt-2 items-center justify-center flex">
      {paid ? (
        <>
          <p className={`m-0 max-w-[30ch] opacity-80 text-emerald-500`}>
            {t("monthIsPaid")}
          </p>
          <button
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={() => onChangePaid(false)}
          >
            {t("change")}
          </button>
        </>
      ) : (
        <>
          <p className={`m-0 max-w-[30ch] opacity-80 text-rose-500`}>
            {t("monthIsNotPaid")}
          </p>
          <button
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={() => onChangePaid(true)}
          >
            {t("change")}
          </button>
        </>
      )}
    </div>
  );
}
