import { useState } from 'react';
import { Scale, Info, Target, ChevronRight, Activity } from 'lucide-react';

const getCategories = (gender) => {
  const maxNormal = gender === 'Female' ? 24.0 : 24.9;
  const maxOver = gender === 'Female' ? 29.0 : 29.9;
  return [
    { label: 'Underweight', range: '< 18.5', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
    { label: 'Normal',      range: `18.5 – ${maxNormal}`, color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
    { label: 'Overweight',  range: `${maxNormal + 0.1} – ${maxOver}`, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)' },
    { label: 'Obese',       range: `≥ ${maxOver + 0.1}`,      color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
  ];
};

function getCategoryInfo(bmi, gender) {
  const cats = getCategories(gender);
  const maxNormal = gender === 'Female' ? 24.0 : 24.9;
  const maxOver = gender === 'Female' ? 29.0 : 29.9;
  
  if (bmi < 18.5) return cats[0];
  if (bmi <= maxNormal) return cats[1];
  if (bmi <= maxOver) return cats[2];
  return cats[3];
}

export default function BMIPage() {
  const [gender, setGender]   = useState('Male');
  const [height, setHeight]   = useState('');
  const [weight, setWeight]   = useState('');
  const [unit, setUnit]       = useState('cm');
  const [bmi, setBmi]         = useState(null);
  const [idealRange, setIdealRange] = useState(null);
  const [catInfo, setCatInfo] = useState(null);

  const activeCategories = getCategories(gender);

  const calculate = (overrideGender) => {
    const activeGender = typeof overrideGender === 'string' ? overrideGender : gender;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return;

    let hM;
    if (unit === 'cm') {
      hM = h / 100;
    } else {
      // height entered as feet (e.g. 5.11 = 5ft 11in)
      const feet   = Math.floor(h);
      const inches = Math.round((h - feet) * 100);
      hM = feet * 0.3048 + inches * 0.0254;
    }

    const val = w / (hM * hM);
    const rounded = parseFloat(val.toFixed(1));
    const maxNormal = activeGender === 'Female' ? 24.0 : 24.9;

    setBmi(rounded);
    setCatInfo(getCategoryInfo(rounded, activeGender));
    setIdealRange({
      min: parseFloat((18.5 * hM * hM).toFixed(1)),
      max: parseFloat((maxNormal * hM * hM).toFixed(1)),
    });
  };

  const reset = () => {
    setHeight(''); setWeight(''); setBmi(null); setCatInfo(null); setIdealRange(null);
  };

  // Needle position on scale bar (BMI 10–40 range)
  const needlePct = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : null;

  const inputClass =
    'bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all w-full';
  const selectClass =
    'bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shrink-0';

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Activity size={13} /> Body Composition Tool
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            BMI <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Calculator</span>
          </h1>
          <p className="text-slate-400 text-sm">Know your Body Mass Index and ideal weight range instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Input Card ── */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5 h-fit">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Info size={17} className="text-indigo-400" /> Enter Your Details
            </h2>

            {/* Gender */}
            <div className="space-y-1.5 pb-2">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Biological Sex</label>
              <div className="flex gap-3">
                <label className="flex items-center justify-center gap-2 text-white cursor-pointer bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl flex-1 hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10">
                  <input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={(e) => { setGender(e.target.value); if(bmi) calculate(e.target.value); }} className="accent-indigo-500" />
                  <span className="text-sm font-medium">Male</span>
                </label>
                <label className="flex items-center justify-center gap-2 text-white cursor-pointer bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl flex-1 hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10">
                  <input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={(e) => { setGender(e.target.value); if(bmi) calculate(e.target.value); }} className="accent-indigo-500" />
                  <span className="text-sm font-medium">Female</span>
                </label>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Height</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder={unit === 'cm' ? 'e.g. 170' : 'e.g. 5.10  (ft.in)'}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                />
                <select value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className={selectClass}>
                  <option value="cm">cm</option>
                  <option value="ft">ft/in</option>
                </select>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              onClick={calculate}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Scale size={16} /> Calculate BMI
            </button>

            {bmi && (
              <button onClick={reset} className="w-full text-slate-500 hover:text-slate-300 text-xs py-1.5 transition-colors">
                Reset
              </button>
            )}

            {/* Category Legend */}
            <div className="pt-2 border-t border-slate-700/50 space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3 flex justify-between">
                <span>BMI Categories</span>
                <span className="text-indigo-400 capitalize">{gender} Chart</span>
              </p>
              {activeCategories.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-slate-300 font-medium">{c.label}</span>
                  </div>
                  <span className="text-slate-500">{c.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Result Card ── */}
          <div className="space-y-5">
            {bmi ? (
              <>
                {/* Main Result */}
                <div
                  className="rounded-2xl p-6 border text-center relative overflow-hidden transition-all"
                  style={{ background: catInfo.bg, borderColor: catInfo.border }}
                >
                  <div
                    className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30"
                    style={{ background: catInfo.color }}
                  />
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Your BMI</p>
                  <div className="text-7xl font-black mb-3" style={{ color: catInfo.color }}>{bmi}</div>
                  <div
                    className="inline-block px-5 py-1.5 rounded-full text-sm font-bold border"
                    style={{ color: catInfo.color, borderColor: catInfo.border, background: catInfo.bg }}
                  >
                    {catInfo.label}
                  </div>

                  {/* Ideal Weight */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: catInfo.border }}>
                    <div className="flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                          <Target size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs font-medium">Ideal Weight Range</p>
                          <p className="text-white font-bold text-lg">
                            {idealRange.min} – {idealRange.max} <span className="text-sm font-normal text-slate-400">kg</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* Scale Bar */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4 text-center">BMI Scale</p>
                  <div className="relative h-4 w-full rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400"   style={{ width: '28.3%' }} />
                    <div className="h-full bg-emerald-400" style={{ width: '19.7%' }} />
                    <div className="h-full bg-yellow-400" style={{ width: '15%' }} />
                    <div className="h-full bg-red-400"    style={{ width: '37%' }} />
                    {/* Needle */}
                    <div
                      className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-xl transition-all duration-700 border border-slate-900/40"
                      style={{ left: `${needlePct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-semibold text-slate-500">
                    <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
                  </div>
                  <div className="flex justify-between mt-0.5 text-[9px] text-slate-600">
                    <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                  <p className="text-white font-semibold text-sm">💡 Health Tips</p>
                  {catInfo.label === 'Normal' && (
                    <p className="text-slate-400 text-sm">You're in the healthy range! Keep maintaining a balanced diet and regular exercise.</p>
                  )}
                  {catInfo.label === 'Underweight' && (
                    <p className="text-slate-400 text-sm">Consider consulting a nutritionist to increase calorie intake with nutrient-dense foods.</p>
                  )}
                  {catInfo.label === 'Overweight' && (
                    <p className="text-slate-400 text-sm">A moderate calorie deficit combined with regular activity can help you reach a healthy range.</p>
                  )}
                  {catInfo.label === 'Obese' && (
                    <p className="text-slate-400 text-sm">Please consider speaking with a healthcare provider for a personalised plan to improve your health.</p>
                  )}
                </div>
              </>
            ) : (
              /* Placeholder */
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center p-12 space-y-4 h-full min-h-[320px]">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                  <Scale size={32} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-white font-semibold">Ready to Calculate</p>
                  <p className="text-slate-500 text-sm mt-1">Enter your height and weight to see your BMI result.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
