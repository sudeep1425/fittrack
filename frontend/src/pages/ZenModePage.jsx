import React from 'react';
import ZenMode from '../ZenMode';

export default function ZenModePage() {
  // You can add dark mode detection here if needed
  const darkMode = false; // For now, set to false or implement theme detection

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <ZenMode darkMode={darkMode} />
    </div>
  );
}