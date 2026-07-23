import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export const runDriver = () => {
    const driverObj = driver({
        popoverClass: 'driverjs-theme',
        showProgress: true,
        animate: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: '¡Entendido!',
        steps: [
            {
                element: '#sidebar-new-chat',
                popover: {
                    title: 'Nuevo Chat',
                    description: 'Haz clic aquí para iniciar una conversación limpia desde cero.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#sidebar-model-selector',
                popover: {
                    title: 'Elige tu IA',
                    description: 'Cambia entre Gemini (Docs), Groq (Velocidad) u OpenRouter (Varios) según lo necesites.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#sidebar-history',
                popover: {
                    title: 'Historial',
                    description: 'Aquí se guardan tus chats anteriores. Puedes retomarlos o borrarlos.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#file-upload-btn',
                popover: {
                    title: 'Subir Archivos',
                    description: 'Adjunta PDFs, Word o TXT para que la IA los lea y analice.',
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#chat-input-area',
                popover: {
                    title: 'Tu Espacio de Trabajo',
                    description: 'Escribe aquí tus instrucciones o preguntas para la Inteligencia Artificial.',
                    side: "top",
                    align: 'center'
                }
            },
            {
                element: '#chat-messages-area',
                popover: {
                    title: 'Conversación',
                    description: 'Aquí se mostrará toda la conversación con la IA.',
                    side: "left",
                    align: 'center'
                }
            }
        ]
    });

    driverObj.drive();
};

export const useTutorial = () => {
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
        if (!hasSeenTutorial) {
            runDriver();
            localStorage.setItem("hasSeenTutorial", "true");
        }
    }, []);
};
