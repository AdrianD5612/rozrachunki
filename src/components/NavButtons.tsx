"use client";
import React from "react";

interface Props {
  t: (key: string) => string;
  onManage: () => void;
  onChart: () => void;
  onMisc: () => void;
}

export default function NavButtons({ t, onManage, onChart, onMisc }: Props) {
  return (
    <div className="z-10 w-0 from-black via-black items-center justify-center font-mono text-sm flex">
      <button
        className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full"
        onClick={onManage}
      >
        {t("manage")}
      </button>
      <button
        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus:ring focus:ring-orange-300 py-2 px-4 rounded-full"
        onClick={onChart}
      >
        {t("charts")}
      </button>
      <button
        className="bg-lime-500 hover:bg-lime-600 active:bg-lime-700 focus:outline-none focus:ring focus:ring-lime-300 py-2 px-4 rounded-full"
        onClick={onMisc}
      >
        {t("misc")}
      </button>
    </div>
  );
}
