import React, { useState, useEffect } from "react";
import { Wind, Play, RotateCcw, Activity, Timer, Zap } from "lucide-react";

const ZenMode = ({ darkMode }) => {
  const [isActive, setIsActive] = useState(false);
  const [breathStage, setBreathStage] = useState("Ready?");
  const [timer, setTimer] = useState(60);
  const [activeTab, setActiveTab] = useState("breathing");

  // Lung Test States
  const [lungTestActive, setLungTestActive] = useState(false);
  const [lungTestStage, setLungTestStage] = useState("Ready");
  const [lungTimer, setLungTimer] = useState(0);
  const [inhaleTime, setInhaleTime] = useState(0);
  const [exhaleTime, setExhaleTime] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
        
        // Stages for Box Breathing (4-4-4-4)
        const cycle = timer % 16;
        if (cycle >= 12) setBreathStage("Inhale... 🌬️");
        else if (cycle >= 8) setBreathStage("Hold... 🛑");
        else if (cycle >= 4) setBreathStage("Exhale... 🌪️");
        else setBreathStage("Hold... 🛑");
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setBreathStage("Done! 🧘");
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Lung Test Effect
  useEffect(() => {
    let interval;
    if (lungTestActive) {
      interval = setInterval(() => {
        setLungTimer((t) => t + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [lungTestActive]);

  const toggleZen = () => {
    setIsActive(!isActive);
    if (!isActive && timer === 0) {
      setTimer(60);
      setBreathStage("Inhale... 🌬️");
    }
  };

  const resetZen = () => {
    setIsActive(false);
    setTimer(60);
    setBreathStage("Ready?");
  };

  // Lung Test Functions
  const startLungTest = () => {
    setLungTestActive(true);
    setLungTestStage("Inhale deeply...");
    setLungTimer(0);
    setInhaleTime(0);
    setExhaleTime(0);
    setHoldTime(0);
  };

  const nextLungStage = () => {
    if (lungTestStage === "Inhale deeply...") {
      setInhaleTime(lungTimer);
      setLungTestStage("Hold your breath...");
      setLungTimer(0);
    } else if (lungTestStage === "Hold your breath...") {
      setHoldTime(lungTimer);
      setLungTestStage("Exhale slowly...");
      setLungTimer(0);
    } else if (lungTestStage === "Exhale slowly...") {
      setExhaleTime(lungTimer);
      setLungTestActive(false);
      setLungTestStage("Test Complete!");
      setTestResults({
        inhale: inhaleTime.toFixed(1),
        hold: holdTime.toFixed(1),
        exhale: exhaleTime.toFixed(1),
        total: (inhaleTime + holdTime + exhaleTime).toFixed(1)
      });
    }
  };

  const resetLungTest = () => {
    setLungTestActive(false);
    setLungTestStage("Ready");
    setLungTimer(0);
    setTestResults(null);
  };

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20" 
    : "bg-white border-slate-200 shadow-sm";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Wind className="text-cyan-400" />
          Zen Mode
        </h1>
        <p className="opacity-60 text-lg">Calm your mind and reduce stress with guided breathing.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className={`${cardClasses} p-2 rounded-2xl border flex gap-2`}>
          <button
            onClick={() => setActiveTab("breathing")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "breathing" 
                ? "bg-cyan-500 text-white shadow-lg" 
                : "hover:bg-white/10"
            }`}
          >
            Guided Breathing
          </button>
          <button
            onClick={() => setActiveTab("lungtest")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "lungtest" 
                ? "bg-cyan-500 text-white shadow-lg" 
                : "hover:bg-white/10"
            }`}
          >
            Lung Capacity Test
          </button>
        </div>
      </div>

      {activeTab === "breathing" && (
        <div className={`${cardClasses} p-12 rounded-[3rem] border flex flex-col items-center space-y-12 relative overflow-hidden`}>
          {/* Animated Background Pulse */}
          <div 
            className={`absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl transition-all duration-[4000ms] ${isActive ? "scale-150 opacity-100" : "scale-100 opacity-50"}`}
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          ></div>

          {/* Breathing Circle */}
          <div className="relative z-10">
            <div 
              className={`w-64 h-64 rounded-full border-8 border-cyan-400/30 flex flex-col items-center justify-center shadow-2xl transition-all duration-[4000ms] ${
                isActive && breathStage.includes("Inhale") ? "scale-150 bg-cyan-400/20" : 
                isActive && breathStage.includes("Exhale") ? "scale-100 bg-cyan-400/5" : "scale-110"
              }`}
            >
              <p className="text-3xl font-black text-cyan-400">{breathStage}</p>
              <p className="text-sm opacity-60 mt-2 font-mono">00:{timer < 10 ? `0${timer}` : timer}</p>
            </div>
          </div>

          {/* Breathing Progress Bar */}
          {isActive && (
            <div className="relative z-10 w-full max-w-md">
              <div className="flex justify-between text-xs font-bold text-cyan-400 mb-2">
                <span>Inhale</span>
                <span>Hold</span>
                <span>Exhale</span>
                <span>Hold</span>
              </div>
              <div className="w-full h-3 bg-cyan-400/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ 
                    width: `${((60 - timer) % 16) / 16 * 100}%`,
                    background: breathStage.includes("Inhale") ? "linear-gradient(to right, #06b6d4, #0891b2)" :
                               breathStage.includes("Exhale") ? "linear-gradient(to right, #0891b2, #0e7490)" :
                               "linear-gradient(to right, #0e7490, #0e7490)"
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                {[0, 4, 8, 12, 16].map((mark, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-1 h-1 rounded-full ${
                      ((60 - timer) % 16) >= mark ? "bg-cyan-400" : "bg-cyan-400/30"
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 relative z-10">
            <button 
              onClick={toggleZen}
              className={`px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all hover:scale-105 ${
                isActive ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"
              } text-white shadow-xl shadow-cyan-500/20`}
            >
              {isActive ? "Pause" : timer === 0 ? "Restart" : "Start Guided Session"}
              <Play size={24} className={isActive ? "hidden" : ""} />
            </button>
            
            <button 
              onClick={resetZen}
              className={`p-4 rounded-2xl border transition-all hover:scale-110 ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-100 border-slate-200 hover:bg-slate-200"}`}
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center relative z-10 pt-8 border-t border-white/5">
            <div className={`p-4 rounded-2xl transition-all duration-1000 ${
              isActive && breathStage.includes("Inhale") ? "bg-cyan-400/20 border border-cyan-400/50" : "bg-transparent"
            }`}>
              <p className={`text-xs uppercase font-bold tracking-widest mb-1 transition-colors ${
                isActive && breathStage.includes("Inhale") ? (darkMode ? "text-cyan-300" : "text-cyan-600") : (darkMode ? "text-cyan-400" : "text-cyan-700")
              }`}>Inhale</p>
              <p className={`text-sm ${darkMode ? "opacity-60" : "text-gray-700"}`}>Deeply through nose</p>
              <p className={`text-xs ${darkMode ? "opacity-40" : "text-gray-600"} mt-1`}>4 seconds</p>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-1000 ${
              isActive && breathStage.includes("Hold") ? "bg-cyan-400/20 border border-cyan-400/50" : "bg-transparent"
            }`}>
              <p className={`text-xs uppercase font-bold tracking-widest mb-1 transition-colors ${
                isActive && breathStage.includes("Hold") ? (darkMode ? "text-cyan-300" : "text-cyan-600") : (darkMode ? "text-cyan-400" : "text-cyan-700")
              }`}>Hold</p>
              <p className={`text-sm ${darkMode ? "opacity-60" : "text-gray-700"}`}>Keep breath steady</p>
              <p className={`text-xs ${darkMode ? "opacity-40" : "text-gray-600"} mt-1`}>4 seconds</p>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-1000 ${
              isActive && breathStage.includes("Exhale") ? "bg-cyan-400/20 border border-cyan-400/50" : "bg-transparent"
            }`}>
              <p className={`text-xs uppercase font-bold tracking-widest mb-1 transition-colors ${
                isActive && breathStage.includes("Exhale") ? (darkMode ? "text-cyan-300" : "text-cyan-600") : (darkMode ? "text-cyan-400" : "text-cyan-700")
              }`}>Exhale</p>
              <p className={`text-sm ${darkMode ? "opacity-60" : "text-gray-700"}`}>Slowly through mouth</p>
              <p className={`text-xs ${darkMode ? "opacity-40" : "text-gray-600"} mt-1`}>4 seconds</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "lungtest" && (
        <div className={`${cardClasses} p-12 rounded-[3rem] border flex flex-col items-center space-y-12 relative overflow-hidden`}>
          {/* Lung Test Background */}
          <div 
            className={`absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl transition-all duration-1000 ${lungTestActive ? "scale-150 opacity-100" : "scale-100 opacity-50"}`}
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          ></div>

          {/* Lung Test Circle */}
          <div className="relative z-10">
            <div 
              className={`w-64 h-64 rounded-full border-8 border-green-400/30 flex flex-col items-center justify-center shadow-2xl transition-all duration-1000 ${
                lungTestActive ? "scale-125 bg-green-400/20" : "scale-110"
              }`}
            >
              <Activity className={`${darkMode ? "text-green-400" : "text-green-600"} mb-2`} size={32} />
              <p className={`text-2xl font-black ${darkMode ? "text-green-400" : "text-green-700"} text-center`}>{lungTestStage}</p>
              {lungTestActive && (
                <p className={`text-lg mt-2 font-mono ${darkMode ? "opacity-60" : "text-gray-700"}`}>{lungTimer.toFixed(1)}s</p>
              )}
            </div>
          </div>

          {/* Lung Test Progress Bar */}
          {lungTestActive && (
            <div className="relative z-10 w-full max-w-md">
              <div className={`flex justify-between text-xs font-bold mb-2 ${darkMode ? "text-green-400" : "text-green-700"}`}>
                <span>Inhale</span>
                <span>Hold</span>
                <span>Exhale</span>
              </div>
              <div className="w-full h-3 bg-green-400/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ 
                    width: lungTestStage === "Inhale deeply..." ? "33%" :
                           lungTestStage === "Hold your breath..." ? "66%" :
                           lungTestStage === "Exhale slowly..." ? "100%" : "0%"
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                {[0, 1, 2, 3].map((mark, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-1 h-1 rounded-full ${
                      (lungTestStage === "Inhale deeply..." && index <= 0) ||
                      (lungTestStage === "Hold your breath..." && index <= 1) ||
                      (lungTestStage === "Exhale slowly..." && index <= 2) ||
                      (lungTestStage === "Test Complete!" && index <= 3) ? "bg-green-400" : "bg-green-400/30"
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full relative z-10">
              <div className={`${darkMode ? "bg-white/5" : "bg-slate-50"} p-4 rounded-2xl border border-green-400/20 text-center`}>
                <Timer className={`${darkMode ? "text-green-400" : "text-green-600"} mx-auto mb-2`} size={20} />
                <p className={`text-xs uppercase font-bold ${darkMode ? "text-green-400" : "text-green-700"} tracking-widest`}>Inhale</p>
                <p className={`text-xl font-black ${darkMode ? "" : "text-gray-900"}`}>{testResults.inhale}s</p>
              </div>
              <div className={`${darkMode ? "bg-white/5" : "bg-slate-50"} p-4 rounded-2xl border border-green-400/20 text-center`}>
                <Zap className={`${darkMode ? "text-green-400" : "text-green-600"} mx-auto mb-2`} size={20} />
                <p className={`text-xs uppercase font-bold ${darkMode ? "text-green-400" : "text-green-700"} tracking-widest`}>Hold</p>
                <p className={`text-xl font-black ${darkMode ? "" : "text-gray-900"}`}>{testResults.hold}s</p>
              </div>
              <div className={`${darkMode ? "bg-white/5" : "bg-slate-50"} p-4 rounded-2xl border border-green-400/20 text-center`}>
                <Wind className={`${darkMode ? "text-green-400" : "text-green-600"} mx-auto mb-2`} size={20} />
                <p className={`text-xs uppercase font-bold ${darkMode ? "text-green-400" : "text-green-700"} tracking-widest`}>Exhale</p>
                <p className={`text-xl font-black ${darkMode ? "" : "text-gray-900"}`}>{testResults.exhale}s</p>
              </div>
              <div className={`${darkMode ? "bg-white/5" : "bg-slate-50"} p-4 rounded-2xl border border-green-400/20 text-center`}>
                <Activity className={`${darkMode ? "text-green-400" : "text-green-600"} mx-auto mb-2`} size={20} />
                <p className={`text-xs uppercase font-bold ${darkMode ? "text-green-400" : "text-green-700"} tracking-widest`}>Total</p>
                <p className={`text-xl font-black ${darkMode ? "" : "text-gray-900"}`}>{testResults.total}s</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 relative z-10">
            {!lungTestActive && lungTestStage !== "Test Complete!" && (
              <button 
                onClick={startLungTest}
                className="px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20"
              >
                Start Lung Test
                <Activity size={24} />
              </button>
            )}
            
            {lungTestActive && (
              <button 
                onClick={nextLungStage}
                className="px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20"
              >
                Next Stage
                <Play size={24} />
              </button>
            )}
            
            <button 
              onClick={resetLungTest}
              className={`p-4 rounded-2xl border transition-all hover:scale-110 ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-100 border-slate-200 hover:bg-slate-200"}`}
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="text-center relative z-10 pt-8 border-t border-white/5">
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "" : "text-gray-900"}`}>How to Test Your Lung Capacity</h3>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 text-sm ${darkMode ? "opacity-70" : "text-gray-700"}`}>
              <div>
                <p className={`font-semibold ${darkMode ? "text-green-400" : "text-green-700"} mb-1`}>1. Inhale Deeply</p>
                <p>Take a deep breath through your nose, filling your lungs completely.</p>
              </div>
              <div>
                <p className={`font-semibold ${darkMode ? "text-green-400" : "text-green-700"} mb-1`}>2. Hold Your Breath</p>
                <p>Keep your breath held comfortably without straining.</p>
              </div>
              <div>
                <p className={`font-semibold ${darkMode ? "text-green-400" : "text-green-700"} mb-1`}>3. Exhale Slowly</p>
                <p>Release your breath slowly through your mouth.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZenMode;
