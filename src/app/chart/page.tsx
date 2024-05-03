"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChartData } from '@/utils';
import { getTranslation} from '@/translations';
import CanvasJSReact from '@canvasjs/react-charts';

export default function Home() {
    const router = useRouter();
    const [chartData, setChartData] = useState<any>([]);
    const [names, setNames] = useState<String[]>([]);
    const [finished, setFinished] = useState<boolean>(false);
    const t = (key: string) => getTranslation(key);

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  getChartData(setChartData, setNames, setFinished)
        return () => { ignore = true; }
        },[]);

    if (!finished) return  <div className="flex justify-center border-b border-neutral-800 bg-gradient-to-b from-zinc-600/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:p-4">...</div>
    return (
        <main className="items-center justify-center bo24rder-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
            <div className='flex flex-col py-2'>
                <button className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 py-2 px-4 rounded-full" onClick={() => router.push("/")}>{t("mainPage")}</button>
            </div>
            <div className='items-center justify-center'>
                {chartData?.map((entryData: any, index: number) => (
                    <div key={index}>
                        <CanvasJSReact.CanvasJSChart options={{
                            title: { text: names[index] },
                            animationEnabled: true,
                            axisY:{
                                interval: 20
                            },
                            data: [
                                {
                                  type: "column",
                                  dataPoints: entryData
                                }
                                ]
                            }} />
                    </div>
                ))}
            </div>
        </main>
    );
}