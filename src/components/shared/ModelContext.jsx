import { createContext, useState, useContext } from "react";

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {

    const [model, setModel] = useState("gemini"); 
    const [resetChat, setResetChat] = useState(() => () => {});

    const availableModels = ["gemini", "groq", "open_router"];

    const value = {
        model,
        setModel,
        resetChat,
        setResetChat,
        availableModels,
    };

    return (
        <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
    );
};