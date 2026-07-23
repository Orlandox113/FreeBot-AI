export default function Header({ model, setModel, onMenuClick }) {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#4B3B73] bg-[#1B1D36]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                {/* Botón de menú para móviles */}
                <button 
                    onClick={onMenuClick} 
                    className="md:hidden text-[#A0AEC0] hover:text-[#8B5CF6] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                
                {/* Branding */}
                <h1 className="text-xl font-['Inter'] font-black tracking-tighter text-[#F2F4F7]">
                    FREEBOT<span className="text-[#8B5CF6]">AI</span>
                </h1>
            </div>

            {/* Selector de Modelos Corregido */}
            <nav className="flex bg-[#09091A] p-1 rounded-lg border border-[#4B3B73] gap-1">
                {['gemini', 'groq', 'open_router'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setModel(m)}
                        className={`px-3 py-1.5 rounded-md text-[9px] font-['Inter'] font-bold uppercase tracking-wider transition-all ${
                            model === m 
                            ? "bg-[#8B5CF6] text-white shadow-lg" 
                            : "text-[#A0AEC0] hover:text-white"
                        }`}
                    >
                        {m.replace('_', ' ')}
                    </button>
                ))}
            </nav>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');
            `}</style>
        </header>
    );
}