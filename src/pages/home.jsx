import { useChat } from "../hooks/useChat";
import { useModel } from "../components/shared/ModelContext";
import { useTutorial, runDriver } from "../hooks/tutorials";

export default function Home() {
    const {
        chatHistories,
        activeChat,
        activeChatId,
        setActiveChatId,
        input,
        setInput,
        files,
        handleFileSelect,
        removeFile,
        loading,
        isSidebarOpen,
        setIsSidebarOpen,
        model,
        chatContainerRef,
        handleSubmit,
        startNewChat,
        deleteChat,
    } = useChat();

    const { setModel } = useModel();

    const modelDescriptions = {
        gemini: "Modelo potente de Google. Soporta lectura de PDFs y análisis de documentos.",
        groq: "Modelo ultrarrápido ideal para respuestas instantáneas de texto.",
        open_router: "Acceso a múltiples modelos (GPT-4, Claude) mediante una sola API."
    };

    // Hook para manejar el tutorial automático
    useTutorial();

    return (
        <div className="relative md:grid md:grid-cols-4 min-h-screen bg-[#09091A] text-[#F2F4F7] font-['Work_Sans']">
            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-[#1B1D36] transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-auto col-span-1 flex flex-col p-6 z-40 border-r border-[#4B3B73]`}
            >
                <button
                    id="sidebar-new-chat"
                    onClick={startNewChat}
                    className="w-full bg-[#8B5CF6] text-white font-['Inter'] font-extrabold py-3 px-4 rounded-lg hover:brightness-110 transition-all mb-3 shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    <span className="text-xl">+</span> Nuevo Chat
                </button>

                <button
                    onClick={runDriver}
                    className="w-full bg-white text-[#1B1D36] font-['Inter'] font-extrabold py-3 px-4 rounded-lg hover:brightness-110 transition-all mb-8 shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    <span className="text-xl">?</span> Aprende a usarla
                </button>
                
                <div className="mb-6">
                    <h2 className="text-[10px] font-['Inter'] font-extrabold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4">Modelos</h2>
                    <div id="sidebar-model-selector" className="flex flex-col gap-1">
                        {['gemini', 'groq', 'open_router'].map(m => (
                            <button 
                                key={m}
                                onClick={() => { setModel(m); setIsSidebarOpen(false); }}
                                className={`text-left px-3 py-2 rounded-md text-sm capitalize transition-colors ${model === m ? 'bg-[#4B3B73] text-[#8B5CF6] font-bold' : 'text-[#A0AEC0] hover:text-white'}`}
                            >
                                {m.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <h2 className="text-[10px] font-['Inter'] font-extrabold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4">Historial Reciente</h2>
                <div id="sidebar-history" className="grow overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {chatHistories[model].length > 0 ? (
                        [...chatHistories[model]].reverse().map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => { setActiveChatId(chat.id); setIsSidebarOpen(false); }}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-xs flex items-center justify-between group
                                    ${activeChatId === chat.id
                                        ? 'bg-[#4B3B73]/40 text-[#8B5CF6] border border-[#4B3B73]'
                                        : 'text-[#A0AEC0] hover:bg-[#1B1D36]/50 hover:text-white border border-transparent'
                                    }`}
                            >
                                <span className="truncate pr-2">{chat.title}</span>
                                <div 
                                    onClick={(e) => deleteChat(chat.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all cursor-pointer"
                                    title="Borrar chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    ) : <p className="mt-4 text-[11px] italic text-[#A0AEC0]/50 px-3 font-medium">Vacío en {model.replace('_', ' ')}</p>}
                </div>
            </aside>

            {/* Chat principal */}
            <main className="col-span-4 md:col-span-3 flex flex-col h-screen bg-[#09091A]">
                {/* Header Superior */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-[#4B3B73] bg-[#09091A]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-[#A0AEC0] md:hidden hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                            <h1 className="text-xs font-['Inter'] font-extrabold tracking-widest text-[#F2F4F7] uppercase">
                                {model.replace('_', ' ')} <span className="text-[#A0AEC0] ml-1 font-normal lowercase italic text-[10px]">v2.5</span>
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Área de Mensajes */}
                <div className="flex-1 overflow-hidden relative">
                    <div
                        ref={chatContainerRef}
                        id="chat-messages-area"
                        className="h-full overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col custom-scrollbar"
                    >
                        {!activeChat ? (
                            <div className="m-auto text-center px-4 max-w-lg animate-in fade-in zoom-in duration-700">
                                <div className="w-20 h-20 bg-linear-to-tr from-[#8B5CF6] to-[#4B3B73] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#8B5CF6]/20">
                                    <span className="text-4xl text-white">✨</span>
                                </div>
                                <h1 className="text-3xl font-['Inter'] font-extrabold text-[#F2F4F7] mb-4 tracking-tight">¿Qué vamos a crear hoy?</h1>
                                <p className="text-[#A0AEC0] text-sm leading-relaxed max-w-sm mx-auto">
                                    {modelDescriptions[model]}
                                </p>
                            </div>
                        ) : (
                            activeChat.messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`group flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`px-5 py-3 rounded-xl max-w-[85%] sm:max-w-xl text-sm transition-all ${msg.role === "user"
                                            ? "bg-[#8B5CF6] text-white shadow-lg"
                                            : "bg-[#1B1D36] text-[#F2F4F7] border border-[#4B3B73]"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] font-['Inter'] font-bold text-[#A0AEC0] mt-1 px-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                        {msg.role === "user" ? "Tú" : model.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="self-start flex gap-1.5 items-center bg-[#1B1D36] px-4 py-3 rounded-xl border border-[#4B3B73]">
                                <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Fijo al Final */}
                <div className="p-4 md:p-6">
                    <div className="max-w-4xl mx-auto w-full">
                        {/* Tags de archivos */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 px-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 rounded-lg text-[10px] text-[#F2F4F7] font-medium shadow-sm">
                                        <span className="font-bold">📄</span>
                                        <span className="truncate max-w-[120px]">{file.name}</span>
                                        <button onClick={() => removeFile(i)} className="hover:text-[#EF4444] ml-1 text-sm">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-[#1B1D36] border-2 border-[#4B3B73] rounded-xl p-2 shadow-xl focus-within:border-[#8B5CF6] transition-all">
                            {/* Adjuntar Archivo */}
                            <label id="file-upload-btn" className="flex items-center justify-center h-10 w-10 text-[#A0AEC0] hover:text-[#8B5CF6] cursor-pointer transition-colors rounded-lg hover:bg-[#09091A]">
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </label>

                            <textarea
                                rows="1"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                id="chat-input-area"
                                placeholder={`Hablar con ${model}...`}
                                className="flex-1 bg-transparent text-sm py-2.5 px-2 outline-none resize-none max-h-48 placeholder:text-[#A0AEC0]/50 text-[#F2F4F7]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            
                            <button
                                type="submit"
                                disabled={loading || (!input.trim() && files.length === 0)}
                                className="h-10 w-10 flex items-center justify-center bg-[#8B5CF6] text-white rounded-lg hover:brightness-110 disabled:opacity-30 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <p className="text-[9px] text-[#A0AEC0] font-['Inter'] font-extrabold uppercase tracking-[0.3em] opacity-40">IA Powered</p>
                            <div className="h-px w-8 bg-[#4B3B73]"></div>
                            <p className="text-[9px] text-[#A0AEC0] font-['Inter'] font-extrabold uppercase tracking-[0.3em] opacity-40">FreeBotAI 2024</p>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=Work+Sans:wght@400;500&display=swap');
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4B3B73; border-radius: 10px; }
                
                .font-inter { font-family: 'Inter', sans-serif; }
                .text-inter { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
}