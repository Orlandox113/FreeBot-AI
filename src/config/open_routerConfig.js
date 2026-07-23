import { readFileAsText } from "../hooks/fileHelpers";

const API_KEY = import.meta.env.VITE_OPEN_ROUTER_API_KEY;

export const IS_OPENROUTER_CONFIGURED = !!API_KEY;

const MODEL_NAME = "tngtech/deepseek-r1t2-chimera:free";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * 
 * @param {Array<object>} messages - El historial de mensajes de la conversación.
 * @param {Array<File>} files - Archivos adjuntos.
 * @returns {Promise<string>} - El texto de respuesta del modelo.
 */
export async function callOpenRouterApi(messages, files = []) {
    if (!IS_OPENROUTER_CONFIGURED) {
        return "Error de Configuración: La variable VITE_OPEN_ROUTER_API_KEY no está definida. Revisa tu archivo .env";
    }

    // Procesar archivos como texto
    let fileContext = "";
    if (files && files.length > 0) {
        for (const file of files) {
            try {
                const text = await readFileAsText(file);
                // Truncar el contenido si es demasiado largo para evitar errores 400 (Payload too large / Context exceeded)
                const truncatedText = text.length > 20000 ? text.substring(0, 20000) + "\n...[Texto truncado]..." : text;
                fileContext += `\n--- Archivo Adjunto: ${file.name} ---\n${truncatedText}\n-------------------------------\n`;
            } catch (e) {
                fileContext += `\n[El archivo ${file.name} no se pudo leer como texto]\n`;
            }
        }
    }

    // Convertimos nuestro formato de historial al que espera la API (compatible con OpenAI).
    const formattedMessages = messages.map((msg, index) => {
        let content = msg.text;
        if (index === messages.length - 1 && fileContext) {
            content = fileContext + "\n\n" + content;
        }
        return {
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: content
        };
    });

    const headers = {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href || "https://local-app.com", 
        "X-Title": "Chat App Demo", 
    };
    const payload = {
        model: MODEL_NAME,
        messages: formattedMessages,
    };

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de la API OpenRouter: ${response.status} - ${errorData.error.message || response.statusText}`);
        }

        const chatCompletion = await response.json();

        return chatCompletion.choices[0]?.message?.content || "No se recibió respuesta del modelo.";

    } catch (error) {
        console.error("Error en la llamada a la API de OpenRouter:", error);
        return `Error de API: ${error.message}`;
    }
}