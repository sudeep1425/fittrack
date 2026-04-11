import React, { useState } from "react";
import { Scale, Info, ChevronRight, Target } from "lucide-react";

const BMI = ({ darkMode }) => {
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [idealRange, setIdealRange] = useState({ min: 0, max: 0 });

  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters;

    if (unit === "cm") {
      heightInMeters = height / 100;
    } else {
      const parts = height.split(".");
      const feet = parseInt(parts[0]);
      const inches = parseInt(parts[1] || 0);
      heightInMeters = feet * 0.3048 + inches * 0.0254;
    }

    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    // Calculate Ideal Weight Range (BMI 18.5 to 24.9)
    const minIdeal = (18.5 * (heightInMeters * heightInMeters)).toFixed(1);
    const maxIdeal = (24.9 * (heightInMeters * heightInMeters)).toFixed(1);
    setIdealRange({ min: minIdeal, max: maxIdeal });

    if (bmiValue < 18.5) setCategory("Underweight");
    else if (bmiValue <= 24.9) setCategory("Normal Weight");
    else if (bmiValue <= 29.9) setCategory("Overweight");
    else setCategory("Obese");
  };

  const getCategoryColor = () => {
    switch (category) {
      case "Underweight": return "text-blue-400 border-blue-400/20 bg-blue-400/10";
      case "Normal Weight": return "text-green-400 border-green-400/20 bg-green-400/10";
      case "Overweight": return "text-yellow-400 border-yellow-400/20 bg-yellow-400/10";
      case "Obese": return "text-red-400 border-red-400/20 bg-red-400/10";
      default: return "text-white";
    }
  };

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20" 
    : "bg-white border-slate-200 shadow-sm";

  const inputClasses = darkMode
    ? "bg-white/10 text-white placeholder-slate-400 border-white/20"
    : "bg-slate-50 text-slate-900 border-slate-200";

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
          <Scale className="text-purple-400" />
          Body Composition
        </h1>
        <p className="opacity-60 text-base md:text-lg">Understand your weight in relation to your height.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        {/* Input Card */}
        <div className={`${cardClasses} p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border space-y-6 md:space-y-8 h-fit`}>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Info size={20} className="text-purple-400" />
            Enter Details
          </h2>

          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-70">Height</label>
              <div className="flex gap-2 md:gap-4">
                <input
                  type="text"
                  placeholder={unit === "cm" ? "cm" : "ft.in"}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={`p-4 rounded-2xl border font-bold cursor-pointer focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft/in</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium opacity-70">Weight (kg)</label>
              <input
                type="number"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
              />
            </div>

            <button
              onClick={calculateBMI}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 md:p-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 transition-all active:scale-95"
            >
              Calculate Analysis
            </button>
          </div>
        </div>

        {/* Results Card */}
        {bmi ? (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right duration-700">
            <div className={`${cardClasses} p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border text-center relative overflow-hidden`}>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-lg md:text-xl font-bold opacity-60 mb-2 uppercase tracking-widest">Your Result</h3>
              <div className="text-5xl md:text-7xl font-black text-purple-400 mb-6 drop-shadow-sm">{bmi}</div>
              
              <div className={`inline-block px-4 md:px-6 py-2 rounded-full border font-black text-base md:text-lg ${getCategoryColor()}`}>
                {category}
              </div>

              <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold opacity-60 uppercase tracking-tighter">Ideal Weight Range</p>
                      <p className="text-lg md:text-xl font-black text-green-400">{idealRange.min}kg - {idealRange.max}kg</p>
                    </div>
                  </div>
                  <ChevronRight className="opacity-20" />
                </div>
              </div>
            </div>

            {/* Visual Scale */}
            <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2rem] border`}>
              <h4 className="text-[10px] md:text-sm font-black opacity-60 mb-6 uppercase tracking-widest text-center">BMI Distribution Scale</h4>
              <div className="relative h-3 md:h-4 w-full bg-slate-200/20 rounded-full overflow-hidden flex">
                <div className="h-full w-[18.5%] bg-blue-400" title="Underweight"></div>
                <div className="h-full w-[6.5%] bg-green-400" title="Normal"></div>
                <div className="h-full w-[5%] bg-yellow-400" title="Overweight"></div>
                <div className="h-full w-[70%] bg-red-400" title="Obese"></div>
                
                {/* Pointer */}
                <div 
                  className="absolute top-0 w-2 h-full bg-white shadow-xl transition-all duration-1000 border border-slate-900"
                  style={{ left: `${Math.min(100, (bmi / 40) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-[9px] md:text-[10px] font-black opacity-40 uppercase">
                <span>10</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${cardClasses} p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border flex flex-col items-center justify-center text-center space-y-4 opacity-50 border-dashed`}>
            <div className="p-4 md:p-6 bg-slate-500/10 rounded-full">
              <Scale size={40} md:size={60} />
            </div>
            <p className="text-lg md:text-xl font-bold">Analysis Ready</p>
            <p className="text-xs md:text-sm">Complete the form to see your body composition and ideal range.</p>
          </div>
        )}
      </div>
    </div>

  );
};

export default BMI;
