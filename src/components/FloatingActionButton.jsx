export default function FloatingActionButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-none border border-white bg-[#0A0A0A] text-white text-4xl flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] transition-colors duration-0 z-20"
    >
      +
    </button>
  );
}
