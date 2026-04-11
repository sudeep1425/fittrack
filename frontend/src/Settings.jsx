import React, { useState } from "react";
import api from "./api/axios";
import toast from "react-hot-toast";
import { User, Mail, Weight, Ruler, Calendar as CalendarIcon, Save, Camera } from "lucide-react";

const Settings = ({ darkMode }) => {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    profile_photo: user?.profile_photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.name || "User")
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));

    if (!user?.id) {
      toast.error("User session not found");
      return;
    }

    try {
      const response = await api.put(`/user/${user.id}`, formData);
      const updatedUser = { ...response.data, token: localStorage.getItem('token') };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
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
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Profile Card */}
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl border lg:col-span-1 h-fit text-center`}>
          <div className="relative inline-block mb-6">
            <img 
              src={formData.profile_photo} 
              alt="Profile" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-purple-500 shadow-xl mx-auto"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-700 transition">
              <Camera size={18} />
            </button>
          </div>
          <h2 className="text-xl md:text-2xl font-bold">{formData.name}</h2>
          <p className="text-sm md:text-base opacity-60">{formData.email}</p>
          <div className="mt-6 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs md:text-sm">
            You've been active for <strong>12 days</strong> straight! Keep it up.
          </div>
        </div>

        {/* Edit Form */}
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl border lg:col-span-2`}>
          <h3 className="text-lg md:text-xl font-semibold mb-6">Profile Customization</h3>
          
          <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70 flex items-center gap-2">
                  <User size={16} /> Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70 flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70 flex items-center gap-2">
                  <CalendarIcon size={16} /> Age
                </label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70 flex items-center gap-2">
                  <Ruler size={16} /> Height (ft.in)
                </label>
                <input 
                  type="text" 
                  name="height"
                  placeholder="e.g. 5.8"
                  value={formData.height}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70 flex items-center gap-2">
                  <Weight size={16} /> Weight (kg)
                </label>
                <input 
                  type="number" 
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                />
              </div>

            </div>

            <button 
              type="submit"
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Changes
            </button>
          </form>
        </div>

      </div>
    </div>

  );
};

export default Settings;
