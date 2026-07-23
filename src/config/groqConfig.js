import { readFileAsText } from "../hooks/fileHelpers";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL_NAME = "openai/gpt-oss-20b"; // Usando el modelo gratuito de Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const IS_GROQ_CONFIGURED = !!API_KEY;

/**
 * Llama a la API de Groq para obtener una respuesta.
 * @param {Array<object>} messages - El historial de mensajes de la conversación.
 * @param {Array<File>} files - Archivos adjuntos.
 * @returns {Promise<string>} - El texto de respuesta del modelo.
 */
export async function callGroqApi(messages, files = []) {
    if (!IS_GROQ_CONFIGURED) {
        return "Error de Configuración: La variable VITE_GROQ_API_KEY no está definida. Revisa tu archivo .env";
    }

    // Procesar archivos como texto (Groq no soporta imágenes/PDF nativos usualmente en estos endpoints estándar)
    let fileContext = "";
    if (files && files.length > 0) {
        for (const file of files) {
            try {
                const text = await readFileAsText(file);
                // Truncar el contenido si es demasiado largo para evitar error 400 (Context Length Exceeded)
                // Reducimos a 6000 caracteres (~1500 tokens) para evitar exceder el límite de TPM (8000-30000)
                const truncatedText = text.length > 6000 ? text.substring(0, 6000) + "\n...[Texto truncado por exceso de longitud]..." : text;
                fileContext += `\n--- Archivo Adjunto: ${file.name} ---\n${truncatedText}\n-------------------------------\n`;
            } catch (e) {
                fileContext += `\n[El archivo ${file.name} no se pudo leer como texto]\n`;
            }
        }
    }

    // La API de Groq espera mensajes con 'role' y 'content'.
    // Asegurémonos de que nuestro historial tenga ese formato.
    const formattedMessages = messages.map((msg, index) => {
        let content = msg.text;
        // Adjuntar contexto de archivos al último mensaje del usuario
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
    };

    const payload = {
        model: MODEL_NAME,
        messages: formattedMessages,
        temperature: 1,
        max_tokens: 1024, // Reducido para dejar espacio al contexto del archivo
        top_p: 1,
    };

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(`Error de la API Groq: ${response.status} - ${errorData.error.message}`);
        }

        const chatCompletion = await response.json();

        return chatCompletion.choices[0]?.message?.content || "No se recibió respuesta del modelo.";

    } catch (error) {
        console.error("Error en la llamada a la API de Groq:", error);
        // Devolvemos el mensaje de error para mostrarlo al usuario
        return `Error de API: ${error.message}`;
    }
}
