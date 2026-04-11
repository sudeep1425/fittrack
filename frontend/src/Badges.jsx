import React from "react";
import { Trophy, Star, Shield, Zap, Flame, Crown } from "lucide-react";

const Badges = ({ darkMode }) => {
  const badges = [
    { 
      id: 1, 
      name: "Hydration Hero", 
      desc: "Drank 3L of water in a single day", 
      icon: <Zap className="text-blue-400" />, 
      unlocked: true,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      id: 2, 
      name: "Clean Eater", 
      desc: "Logged only healthy meals for 3 days", 
      icon: <Star className="text-yellow-400" />, 
      unlocked: true,
      color: "from-yellow-500/20 to-orange-500/20"
    },
    { 
      id: 3, 
      name: "Early Bird", 
      desc: "Logged breakfast before 8:00 AM", 
      icon: <Flame className="text-orange-500" />, 
      unlocked: false,
      color: "from-orange-500/20 to-red-500/20"
    },
    { 
      id: 4, 
      name: "BMI Master", 
      desc: "Reached your target BMI range", 
      icon: <Shield className="text-green-400" />, 
      unlocked: false,
      color: "from-green-500/20 to-emerald-500/20"
    },
    { 
      id: 5, 
      name: "Century Club", 
      desc: "Logged over 100 items in total", 
      icon: <Trophy className="text-purple-400" />, 
      unlocked: false,
      color: "from-purple-500/20 to-pink-500/20"
    },
    { 
      id: 6, 
      name: "Consistency King", 
      desc: "7 day login streak", 
      icon: <Crown className="text-yellow-600" />, 
      unlocked: false,
      color: "from-yellow-600/20 to-yellow-400/20"
    },
  ];

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20" 
    : "bg-white border-slate-200 shadow-sm";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Achievement Gallery</h1>
        <p className="opacity-60">Unlock badges by staying consistent with your health goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`${cardClasses} p-8 rounded-3xl border relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${!badge.unlocked && "grayscale opacity-50"}`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${badge.color} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className={`p-5 rounded-2xl ${darkMode ? "bg-white/5" : "bg-slate-50"} border ${darkMode ? "border-white/10" : "border-slate-100"} shadow-xl group-hover:rotate-12 transition-transform`}>
                {React.cloneElement(badge.icon, { size: 40 })}
              </div>
              <div>
                <h3 className="text-xl font-bold">{badge.name}</h3>
                <p className="text-sm opacity-60 mt-1">{badge.desc}</p>
              </div>
              
              {badge.unlocked ? (
                <span className="text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                  Unlocked
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-400/10 px-3 py-1 rounded-full border border-slate-400/20">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
