import { useState, useEffect, useMemo, useRef } from "react";
import { useModel } from "../components/shared/ModelContext";
import { callGeminiApiDirectly } from "../config/geminiConfig";
import { callGroqApi } from "../config/groqConfig";
import { callOpenRouterApi } from "../config/open_routerConfig";

const VALID_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];

export function useChat() {
    // --- ESTADO Y CONTEXTO ---
    const [chatHistories, setChatHistories] = useState(() => {
        const savedHistories = localStorage.getItem('chatHistories');
        return savedHistories ? JSON.parse(savedHistories) : { gemini: [], groq: [], open_router: [] };
    });

    const [activeChatId, setActiveChatId] = useState(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { model, setResetChat } = useModel();
    const chatContainerRef = useRef(null);

    // --- DATOS DERIVADOS ---
    const activeChat = useMemo(() => {
        return chatHistories[model]?.find(chat => chat.id === activeChatId) || null;
    }, [chatHistories, model, activeChatId]);


    // --- MANEJADORES DE EVENTOS Y FUNCIONES ---
    const handleFileSelect = (selectedFiles) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles);
        const filteredFiles = newFiles.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return VALID_EXTENSIONS.includes(ext);
        });
        setFiles((prev) => [...prev, ...filteredFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        let currentChatId = activeChatId;
        let newChatCreated = false;

        if (!currentChatId) {
            newChatCreated = true;
            currentChatId = Date.now().toString();
            setActiveChatId(currentChatId);
        }

        const userMessage = { role: "user", text: input };
        const currentMessages = activeChat ? activeChat.messages : [];
        const updatedMessages = [...currentMessages, userMessage];

        setChatHistories(prev => {
            const newHistories = { ...prev };
            const modelChats = [...newHistories[model]];
            if (newChatCreated) {
                modelChats.push({
                    id: currentChatId,
                    title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
                    messages: updatedMessages,
                });
            } else {
                const chatIndex = modelChats.findIndex(chat => chat.id === currentChatId);
                if (chatIndex !== -1) {
                    modelChats[chatIndex] = { ...modelChats[chatIndex], messages: updatedMessages };
                }
            }
            newHistories[model] = modelChats;
            return newHistories;
        });

        setInput("");
        setLoading(true);

        let response;
        switch (model) {
            case "gemini":
                response = await callGeminiApiDirectly(updatedMessages, files);
                break;
            case "groq":
                response = await callGroqApi(updatedMessages, files);
                break;
            case "open_router":
                response = await callOpenRouterApi(updatedMessages, files);
                break;
            default:
                response = "Error: Modelo no reconocido.";
        }

        const aiMessage = { role: "ai", text: response };

        setChatHistories(prev => {
            const newHistories = { ...prev };
            const modelChats = [...newHistories[model]];
            const chatIndex = modelChats.findIndex(chat => chat.id === currentChatId);
            if (chatIndex !== -1) {
                modelChats[chatIndex].messages = [...updatedMessages, aiMessage];
                newHistories[model] = modelChats;
            }
            return newHistories;
        });

        setLoading(false);
        setFiles([]);
    };

    const startNewChat = () => setActiveChatId(null);

    const deleteChat = (chatId, e) => {
        if (e) e.stopPropagation(); // Evita que se seleccione el chat al borrarlo
        setChatHistories(prev => {
            const newHistories = { ...prev };
            newHistories[model] = newHistories[model].filter(chat => chat.id !== chatId);
            return newHistories;
        });
        if (activeChatId === chatId) {
            setActiveChatId(null);
        }
    };

    // --- EFECTOS SECUNDARIOS (useEffect) ---
    useEffect(() => {
        const chatsForNewModel = chatHistories[model] || [];
        if (chatsForNewModel.length > 0) {
            setActiveChatId(chatsForNewModel[chatsForNewModel.length - 1].id);
        } else {
            startNewChat();
        }
        setResetChat(() => startNewChat);
    }, [model, setResetChat]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    }, [chatHistories]);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [activeChat?.messages]);

    // El hook devuelve un objeto con todos los estados y funciones
    // que el componente de UI necesitará para renderizarse.
    return {
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
    };
}