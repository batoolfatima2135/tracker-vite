import React, { useEffect, useState } from "react";
import { IpcRendererEvent } from "electron";
import Timer from "./Timer";

interface Screenshot {
  time: string;
  dataURL: string;
  activeWin: string;
  mouseClicks: number;
  keypressCount: number;
}

interface IPCRenderer {
  captureScreenshot: () => void;
  getScreenshot: (
    callback: (event: IpcRendererEvent, data: Screenshot) => void
  ) => void;
  removeListener: () => void;
  startMonitoring: () => void;
  getActiveTime: (
    callback: (event: IpcRendererEvent, data: number) => void
  ) => void;
}

// Extend the Window interface to include the 'ipc' object
declare global {
  interface Window {
    ipc: IPCRenderer;
  }
}

const Home: React.FC = () => {
  const [screenshotData, setScreenshotData] = useState<Screenshot[]>([]);
  const [activeTime, setActiveTime] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      window.ipc.captureScreenshot();
    }, 30000);

    return () => {
      clearInterval(intervalId);
      window.ipc.removeListener();
    };
  }, []);

  useEffect(() => {
    window.ipc.getScreenshot((event, data) => {
      setScreenshotData((prev) => [...prev, data]);
    });

    return () => {
      window.ipc.removeListener();
    };
  }, []);

  useEffect(() => {
    window.ipc.getActiveTime((event, data) => {
      setActiveTime(data);
    });
  }, []);

  return (
    <div>
      <div className="flex justify-center my-10 flex-col">
        <h1 className="text-white text-center text-4xl font-extrabold">
          TRACKER APP
        </h1>
        <div className="flex justify-center my-10 flex-col border-2 rounded-md p-5">
          <h1 className="font-bold text-2xl font-poppins text-center text-white">
            It monitors your active time! ⌛
          </h1>
          <p className="text-center text-base my-2 text-white">
            Click on "Start Monitoring" to track your active time on your PC! 🕓
            😃
          </p>
          <button
            onClick={() => window.ipc.startMonitoring()}
            className="mx-auto bg-sky-700 text-white p-2 my-4 w-48 font-semibold rounded-md"
          >
            Start Monitoring ⏱️
          </button>
          <div
            id="activeTime"
            className="flex text-pink-800 items-center justify-between border-white bg-gray-300 w-64 px-2 mx-auto font-semibold font-poppins h-14 text-center shadow-lg rounded-md text-5xl"
          >
            <Timer seconds={activeTime} />
          </div>
        </div>
        <h1 className="font-bold text-2xl font-poppins text-center text-white mb-4">
          It takes screenshots of your desktop every 30 seconds! 🖥️📸
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {/* Render screenshots */}
          {screenshotData.map((data, index) => (
            <div className="text-black border border-white bg-white p-2 rounded-md">
              <div className="flex justify-between  my-2">
                <p className="font-bold">Time:</p>
                <p className="font-semibold"> {data.time}</p>
              </div>
              <figure key={index}>
                <img
                  src={data.dataURL}
                  alt={`Screenshot ${index}`}
                  className="w-full border border-black rounded-sm"
                />
                <figcaption className="font-semi-bold text-center font-semibold">
                  {data.activeWin}
                </figcaption>
              </figure>
              <div className="flex justify-between  my-2">
                <p className="font-semibold">Mouse clicks:</p>
                <p>{data.mouseClicks}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Key presses:</p>
                <p>{data.keypressCount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
