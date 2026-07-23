import { GoogleGenAI } from "@google/genai";
import { readFileAsBase64, readFileAsText } from "../hooks/fileHelpers";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // Modelo más reciente y recomendado

const API_KEY_MISSING = !API_KEY || API_KEY === "TU_CLAVE_API_AQUÍ";

const ai = !API_KEY_MISSING ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Llama directamente a la API de Gemini para obtener una respuesta.
 * @param {Array<object>} messages - El historial de mensajes de la conversación.
 * @param {Array<File>} files - Archivos adjuntos para el último mensaje.
 * @returns {Promise<string>} - El texto de respuesta del modelo.
 */
export async function callGeminiApiDirectly(messages, files = []) {
    if (API_KEY_MISSING) {
        return "Error de Configuración: La variable VITE_GEMINI_API_KEY no está definida. Revisa tu archivo .env";
    }

    try {
        // Procesar archivos adjuntos para el último mensaje
        const fileParts = [];
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.type.startsWith("image/") || file.type === "application/pdf") {
                    const base64Data = await readFileAsBase64(file);
                    fileParts.push({ inlineData: { mimeType: file.type, data: base64Data } });
                } else {
                    try {
                        const textData = await readFileAsText(file);
                        fileParts.push({ text: `\n[Contenido del archivo ${file.name}]:\n${textData}\n` });
                    } catch (e) {
                        console.warn(`No se pudo leer el archivo ${file.name} como texto.`);
                    }
                }
            }
        }

        // Convertimos nuestro historial al formato que espera la API de Gemini.
        // La clave es que el rol 'ai' debe ser 'model'.
        const contents = messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const parts = [{ text: msg.text }];
            
            // Si es el último mensaje y hay archivos, los agregamos a las partes
            if (isLastMessage && fileParts.length > 0) {
                parts.unshift(...fileParts);
            }

            return {
                role: msg.role === 'user' ? 'user' : 'model',
                parts: parts
            };
        });

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents, // Enviamos el historial formateado
            generationConfig: {
                // 'temperature' controla la creatividad del modelo. Un valor más alto genera respuestas más variadas.
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        });

        // La respuesta de esta librería viene en response.text
        return response.text || "No se recibió una respuesta válida.";

    } catch (error) {
        console.error("Error en la llamada directa a Gemini:", error);
        // Retorna un mensaje de error amigable para el usuario en caso de fallo en la API.
        return `Error de API: No se pudo obtener la respuesta. (${error.response?.data?.error?.message || error.message || 'Clave inválida o error de red'}).`;
    }
}
