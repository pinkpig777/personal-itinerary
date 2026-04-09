export default function ToolsMenu({ onSelectTool }) {
  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-0">
      <h2 className="font-sans font-black tracking-tighter uppercase text-2xl text-white mb-4">Trip Tools Hub</h2>
      <div className="grid gap-4">
        <button
          onClick={() => onSelectTool('money-split')}
          className="p-5 rounded-none border flex items-start gap-4 text-left transition-colors duration-0 w-full bg-transparent border-[#333333] hover:border-white hover:bg-white group"
        >
          <div className="text-white group-hover:text-[#0A0A0A] bg-transparent border border-[#333333] group-hover:border-[#0A0A0A] rounded-none p-2 h-14 w-14 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg tracking-tight uppercase text-white group-hover:text-[#0A0A0A]">Money Split</h3>
            </div>
            <p className="text-sm font-medium tracking-wide uppercase text-gray-400 group-hover:text-[#333333]">
              Log group expenses and calculate who owes what.
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectTool('roulette')}
          className="p-5 rounded-none border flex items-start gap-4 text-left transition-colors duration-0 w-full bg-transparent border-[#333333] hover:border-white hover:bg-white group"
        >
          <div className="text-white group-hover:text-[#0A0A0A] bg-transparent border border-[#333333] group-hover:border-[#0A0A0A] rounded-none p-2 h-14 w-14 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg tracking-tight uppercase text-white group-hover:text-[#0A0A0A]">Restaurant Roulette</h3>
            </div>
            <p className="text-sm font-medium tracking-wide uppercase text-gray-400 group-hover:text-[#333333]">
              Spin a flat high-speed wheel to let fate pick.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
