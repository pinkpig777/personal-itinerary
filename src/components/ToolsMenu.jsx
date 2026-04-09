import React from 'react';

export default function ToolsMenu({ onSelectTool }) {
  const tools = [
    {
      id: 'money-split',
      title: 'Money Split',
      icon: '💰',
      description: 'Log group expenses and automatically calculate who owes what.',
      ready: true
    },
    {
      id: 'roulette',
      title: 'Restaurant Roulette',
      icon: '🎲',
      description: 'Spin a high-speed slot machine to let fate pick where you eat!',
      ready: true
    }
  ];

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <h2 className="font-sans font-black tracking-tight text-2xl text-white mb-4">Trip Tools Hub</h2>
      <div className="grid gap-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => tool.ready && onSelectTool(tool.id)}
            disabled={!tool.ready}
            className={`p-5 rounded-xl border flex items-start gap-4 text-left transition-all duration-300 w-full ${
              tool.ready 
                ? 'bg-[#1E1E1E] border-[#333333] hover:-translate-y-1' 
                : 'bg-[#121212] border-[#333333] opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-4xl bg-[#121212] border border-[#333333] rounded-lg p-2 h-14 w-14 flex items-center justify-center flex-shrink-0">
              {tool.icon}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-white">{tool.title}</h3>
                {!tool.ready && (
                  <span className="bg-[#333333] text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${tool.ready ? 'text-gray-400' : 'text-gray-600'}`}>
                {tool.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
