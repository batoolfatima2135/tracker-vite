import React from "react";

function Timer({ seconds }: { seconds: number }) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Pad single digit numbers with leading zeros
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return (
    <div className="flex w-full">
      <p className="w-32">{formattedHours}</p>
      <p className="-mt-2">:</p>
      <p className="w-32">{formattedMinutes}</p>
      <p className="-mt-2">:</p>
      <p className="w-32">{formattedSeconds}</p>
    </div>
  );
}

export default Timer;
