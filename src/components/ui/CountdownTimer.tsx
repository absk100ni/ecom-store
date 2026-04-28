import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 text-white w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold tabular-nums shadow-lg">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <TimeBox value={timeLeft.hours} label="Hrs" />
      <span className="text-gray-400 text-xl font-bold mt-[-16px]">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-gray-400 text-xl font-bold mt-[-16px]">:</span>
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
