import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabId } from '../types/navigation';

export type AIContextId = TabId | 'accesibilidad';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUri?: string;
};

export type ImageAttachment = {
  base64: string;
  mimeType: string;
};

type CacheEntry = {
  key: string;
  response: string;
  context: AIContextId;
  updatedAt: number;
};

type QueuedMessage = {
  id: string;
  context: AIContextId;
  message: string;
  createdAt: number;
};

const CACHE_KEY = 'ai_cache';
const QUEUE_KEY = 'ai_queue';
const MAX_HISTORY = 10;
const MAX_CACHE_ENTRIES = 40;

const SYSTEM_PROMPTS: Record<AIContextId, string> = {
  mapa: `Eres el asistente de IA de ParaTodos en la sección Mapa. Ayudas a personas con discapacidad visual o movilidad reducida a navegar rutas accesibles, entender filtros del mapa e interpretar íconos (obstáculos, rampas, cruces seguros, reportes comunitarios). Responde siempre en español, con frases claras y accionables. Si no sabes algo del mapa local, indícalo y sugiere revisar filtros o la leyenda.`,
  planear: `Eres el asistente de IA de ParaTodos en Planear viaje. Ayudas a planificar trayectos accesibles origen-destino según tipo de movilidad (silla de ruedas, bastón, perro guía, movilidad reducida). Explica cómo elegir origen/destino, comparar rutas y qué significa cada indicador de accesibilidad. Responde siempre en español.`,
  reportar: `Eres el asistente de IA de ParaTodos en Reportar. Guías para crear reportes efectivos de obstáculos, rampas rotas, señales inexistentes o infraestructura dañada. Sugiere qué foto tomar, descripción útil y categoría correcta. Responde siempre en español.`,
  comunidad: `Eres el asistente de IA de ParaTodos en Comunidad. Ayudas a publicar y leer experiencias de accesibilidad, interactuar con respeto y encontrar consejos útiles de otros usuarios. Responde siempre en español.`,
  accesibilidad: `Eres el asistente de IA de ParaTodos en Accesibilidad y perfil. Explicas TalkBack, reduce motion, fuentes Atkinson Hyperlegible, tipo de persona/movilidad y ajustes del perfil. Responde siempre en español con pasos concretos.`,
};

const OFFLINE_DEFAULTS: Record<AIContextId, string> = {
  mapa: 'Sin conexión: en Mapa puedes ver rutas accesibles, activar filtros por tipo de obstáculo y tocar marcadores para detalles. Cuando vuelva internet, podré ayudarte con preguntas más específicas.',
  planear: 'Sin conexión: en Planear elige origen y destino, revisa rutas sugeridas y abre el detalle para ver pendientes y obstáculos. Guarda tus preferencias de movilidad en el perfil.',
  reportar: 'Sin conexión: en Reportar describe el obstáculo, elige categoría y, si puedes, adjunta una foto clara. Tu reporte se enviará cuando haya conexión.',
  comunidad: 'Sin conexión: en Comunidad puedes leer publicaciones guardadas. Para publicar o comentar necesitarás conexión; tus borradores pueden quedar en cola.',
  accesibilidad: 'Sin conexión: en Perfil puedes activar TalkBack simulado (alto contraste), reduce motion y elegir tu tipo de movilidad. Estos ajustes se guardan en el dispositivo.',
};

const OFFLINE_HINTS: Record<AIContextId, { keywords: string[]; response: string }[]> = {
  mapa: [
    {
      keywords: ['filtro', 'filtros', 'icono', 'iconos', 'leyenda'],
      response:
        'En Mapa, abre el panel de filtros para mostrar u ocultar rampas, obstáculos y reportes. Los íconos indican tipo de punto: verde suele ser accesible, naranja advertencia y rojo obstáculo.',
    },
    {
      keywords: ['ruta', 'navegar', 'caminar'],
      response:
        'Selecciona un destino en el mapa o ve a Planear para una ruta completa. Prioriza rutas con menos pendiente y menos obstáculos reportados.',
    },
  ],
  planear: [
    {
      keywords: ['origen', 'destino', 'direccion', 'dirección'],
      response:
        'Indica origen y destino en los campos superiores. ParaTodos sugerirá opciones según accesibilidad; abre una ruta para ver detalle de pendientes y barreras.',
    },
    {
      keywords: ['silla', 'ruedas', 'baston', 'bastón', 'perro'],
      response:
        'Configura tu tipo de movilidad en Perfil para que las rutas eviten escaleras empinadas y superficies difíciles según tu perfil.',
    },
  ],
  reportar: [
    {
      keywords: ['foto', 'fotografia', 'fotografía', 'imagen'],
      response:
        'Toma la foto de frente, con buena luz, mostrando el obstáculo completo y referencias cercanas (esquina, número, negocio).',
    },
    {
      keywords: ['categoria', 'categoría', 'tipo'],
      response:
        'Elige la categoría que mejor describa el problema: rampa, acera, señalización, transporte u otro. Una descripción breve ayuda a la comunidad.',
    },
  ],
  comunidad: [
    {
      keywords: ['publicar', 'post', 'comentar'],
      response:
        'Comparte experiencias concretas: lugar, qué funcionó o falló, y recomendaciones. Evita datos personales sensibles.',
    },
  ],
  accesibilidad: [
    {
      keywords: ['talkback', 'talk back', 'lector', 'voz'],
      response:
        'TalkBack en ParaTodos activa fondo negro y alto contraste. Actívalo en Perfil; combínalo con reduce motion si prefieres menos animaciones.',
    },
    {
      keywords: ['fuente', 'fuentes', 'atkinson', 'letra'],
      response:
        'ParaTodos usa Atkinson Hyperlegible para mejor legibilidad. En modo TalkBack se prioriza contraste máximo.',
    },
    {
      keywords: ['reduce', 'motion', 'animacion', 'animación'],
      response:
        'Reduce motion desactiva animaciones innecesarias. Encuéntralo en Perfil junto a otros ajustes de accesibilidad.',
    },
  ],
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function cacheKey(context: AIContextId, message: string): string {
  return `${context}:${normalizeText(message)}`;
}

export function getSystemPrompt(context: AIContextId): string {
  return SYSTEM_PROMPTS[context];
}

export function getOfflineResponse(context: AIContextId, message: string): string {
  const normalized = normalizeText(message);
  const hints = OFFLINE_HINTS[context] ?? [];

  for (const hint of hints) {
    if (hint.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      return hint.response;
    }
  }

  return OFFLINE_DEFAULTS[context];
}

async function readCache(): Promise<CacheEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CacheEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCache(entries: CacheEntry[]): Promise<void> {
  const trimmed = entries
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CACHE_ENTRIES);
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
}

export async function getCachedResponse(
  context: AIContextId,
  message: string,
): Promise<string | null> {
  const key = cacheKey(context, message);
  const entries = await readCache();
  const hit = entries.find((entry) => entry.key === key);
  return hit?.response ?? null;
}

export async function saveCachedResponse(
  context: AIContextId,
  message: string,
  response: string,
): Promise<void> {
  const key = cacheKey(context, message);
  const entries = await readCache();
  const next = entries.filter((entry) => entry.key !== key);
  next.push({ key, response, context, updatedAt: Date.now() });
  await writeCache(next);
}

async function readQueue(): Promise<QueuedMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedMessage[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueMessage(
  context: AIContextId,
  message: string,
): Promise<void> {
  const queue = await readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    context,
    message,
    createdAt: Date.now(),
  });
  await writeQueue(queue);
}

const GEMINI_MODEL = 'gemini-3.5-flash';
const LYRIA_MODEL = 'lyria-3-pro-preview';
const LYRIA_API_REVISION = '2026-05-20';

function getGeminiApiKey(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ??
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
  );
}

export type AudioGenerationResult = {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  error?: string;
};

export async function generateAudio(
  prompt: string,
): Promise<AudioGenerationResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { success: false, error: 'Falta la clave de API. Configura EXPO_PUBLIC_GEMINI_API_KEY.' };
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/interactions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Api-Revision': LYRIA_API_REVISION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `models/${LYRIA_MODEL}`,
        input: prompt,
        response_format: { type: 'audio' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Lyria API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      output?: { data?: string; mime_type?: string };
      audio?: { data?: string; mime_type?: string };
    };

    const audio = data.output ?? data.audio;
    if (audio?.data) {
      return {
        success: true,
        audioBase64: audio.data,
        mimeType: audio.mime_type ?? 'audio/mp3',
      };
    }

    return { success: false, error: 'No se recibió audio en la respuesta.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, error: message };
  }
}

export async function syncQueuedMessages(
  historyByContext: Partial<Record<AIContextId, ChatMessage[]>>,
): Promise<{ synced: number; replies: ChatMessage[] }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { synced: 0, replies: [] };

  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, replies: [] };

  const remaining: QueuedMessage[] = [];
  const replies: ChatMessage[] = [];

  for (const item of queue) {
    try {
      const history = historyByContext[item.context] ?? [];
      const response = await requestGeminiReply(
        apiKey,
        item.context,
        item.message,
        history,
      );
      await saveCachedResponse(item.context, item.message, response);
      replies.push({
        id: `assistant-sync-${item.id}`,
        role: 'assistant',
        content: response,
      });
    } catch {
      remaining.push(item);
    }
  }

  await writeQueue(remaining);
  return { synced: queue.length - remaining.length, replies };
}

function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-MAX_HISTORY);
}

export async function requestAssistantReply(
  context: AIContextId,
  userMessage: string,
  history: ChatMessage[],
  isConnected: boolean,
  image?: ImageAttachment,
): Promise<{ content: string; fromCache: boolean; queued: boolean }> {
  if (!image) {
    const cached = await getCachedResponse(context, userMessage);
    if (cached) {
      return { content: cached, fromCache: true, queued: false };
    }
  }

  if (!isConnected) {
    const offline = image
      ? 'Sin conexión: guardé tu mensaje. Cuando haya internet podré analizar la foto que adjuntaste.'
      : getOfflineResponse(context, userMessage);
    if (!image) {
      await saveCachedResponse(context, userMessage, offline);
    }
    await enqueueMessage(context, userMessage);
    return { content: offline, fromCache: false, queued: true };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      content:
        'Falta la clave de Gemini. Agrega EXPO_PUBLIC_GEMINI_API_KEY en .env.local y reinicia Expo.',
      fromCache: false,
      queued: false,
    };
  }

  try {
    const content = await requestGeminiReply(
      apiKey,
      context,
      userMessage,
      history,
      image,
    );
    if (!image) {
      await saveCachedResponse(context, userMessage, content);
    }
    return { content, fromCache: false, queued: false };
  } catch {
    await enqueueMessage(context, userMessage);
    return {
      content:
        'No pude obtener respuesta de Gemini. Revisa tu clave API o intenta de nuevo en unos segundos.',
      fromCache: false,
      queued: true,
    };
  }
}

async function requestGeminiReply(
  apiKey: string,
  context: AIContextId,
  userMessage: string,
  history: ChatMessage[],
  image?: ImageAttachment,
): Promise<string> {
  type GeminiPart =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };

  const contents: Array<{ role: 'user' | 'model'; parts: GeminiPart[] }> = trimHistory(history)
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }));

  const userParts: GeminiPart[] = [];
  if (image) {
    userParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
  }
  userParts.push({ text: userMessage || 'Describe esta imagen en el contexto de accesibilidad urbana.' });
  contents.push({ role: 'user', parts: userParts });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: getSystemPrompt(context) }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || 'No pude generar una respuesta. Intenta de nuevo.';
}
