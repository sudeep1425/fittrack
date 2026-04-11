import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "./api/axios";
import toast from "react-hot-toast";
import { Clock, Utensils, Droplets, Loader2 } from "lucide-react";

const DailyLog = ({ darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState({ foods: [], water: 0 });
  const [loading, setLoading] = useState(false);

  const fetchDailyData = async (date) => {
    setLoading(true);
    const dateString = date.toISOString().split('T')[0];
    
    try {
      const response = await api.get(`/daily-log?date=${dateString}`);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching daily log:", err);
      toast.error("Failed to fetch logs for this date");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(selectedDate);
  }, [selectedDate, token]);

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20" 
    : "bg-white border-slate-200 shadow-sm";

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Daily Activity Log</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        {/* Calendar Card */}
        <div className={`${cardClasses} p-4 md:p-6 rounded-3xl border lg:col-span-1 h-fit`}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            <Clock className="text-purple-400" size={20} />
            Select Date
          </h2>
          <div className={`custom-calendar ${darkMode ? "calendar-dark" : "calendar-light"}`}>
            <Calendar 
              onChange={setSelectedDate} 
              value={selectedDate}
              className="border-none rounded-2xl w-full"
            />
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl border`}>
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              Details for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8">
              <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center gap-4">
                <Droplets className="text-cyan-400" />
                <div>
                  <p className="text-xs md:text-sm opacity-60">Water Intake</p>
                  <p className="text-lg md:text-xl font-bold">{data.water} Liters</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Utensils className="text-green-400" size={20} />
              Meal Log
            </h3>

            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-purple-500" size={48} />
              </div>
            ) : data.foods && data.foods.length > 0 ? (
              <div className="space-y-3">
                {data.foods.map((food, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-2xl ${darkMode ? "bg-white/5" : "bg-slate-50"} border ${darkMode ? "border-white/5" : "border-slate-100"}`}>
                    <div>
                      <p className="font-semibold">{food.food_name}</p>
                      <p className="text-xs opacity-60">{food.calories} calories</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      food.meal_type === "Healthy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {food.meal_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-50 bg-slate-500/5 rounded-2xl border border-dashed border-slate-500/20">
                No food logs found for this date.
              </div>
            )}
          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-dark .react-calendar {
          background: transparent;
          color: white;
          border: none;
        }
        .calendar-dark .react-calendar__tile:enabled:hover,
        .calendar-dark .react-calendar__tile:enabled:focus {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .calendar-dark .react-calendar__tile--active {
          background: #9333ea !important;
          color: white;
          border-radius: 12px;
        }
        .calendar-dark .react-calendar__navigation button:enabled:hover,
        .calendar-dark .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .calendar-dark .react-calendar__month-view__days__day--neighboringMonth {
          opacity: 0.3;
        }
        .calendar-light .react-calendar {
          background: transparent;
          border: none;
        }
        .calendar-light .react-calendar__tile--active {
          background: #9333ea !important;
          color: white;
          border-radius: 12px;
        }
      `}} />
    </div>
  );
};

export default DailyLog;
