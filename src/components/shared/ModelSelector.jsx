import { useState } from "react";
import { useModel } from "./ModelContext";

export default function ModelSelector() {
    const { model, setModel, availableModels, resetChat } = useModel();
    const [isOpen, setIsOpen] = useState(false);

    const handleModelChange = (newModel) => {
        setModel(newModel);
        resetChat();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-purple-1 text-gray-1 font-semibold text-sm sm:text-base py-1 px-3 sm:py-2 sm:px-4 rounded-lg transition-all hover:bg-purple-1/80 active:scale-95 shadow-md"
            >
                Modelo: <span className="font-bold capitalize">{model}</span>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-dark-2 rounded-md shadow-lg z-50 cssborder-1">
                    <ul className="py-1 ">
                        {availableModels.map((mod) => (
                            <li key={mod}>
                                <button
                                    onClick={() => handleModelChange(mod)}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                        model === mod
                                            ? "bg-purple-1 text-white"
                                            : "text-gray-1 hover:bg-amatista-1"
                                    }`}
                                >
                                    <span className="capitalize">{mod}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}