import { ImageAttachment } from './aiAssistant';

export type HazardLevel = 'none' | 'low' | 'medium' | 'high';

export type EnvironmentScanResult = {
  hazardLevel: HazardLevel;
  alertMessage: string;
  objects: string[];
  /** Distancia estimada al obstáculo más cercano en el encuadre (metros), si la IA la infiere */
  estimatedDistanceMeters?: number;
};

/** Mismos modelos que el asistente de chat; 2.0/1.5 devuelven 404 en la API actual. */
const GEMINI_VISION_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash'] as const;

const CLEAR_PHRASES =
  /despejad|sin obst|camino libre|continúa con precaución|todo claro|no hay obst|sin riesgo visible/i;

const SCAN_SYSTEM = `Eres un asistente de accesibilidad para personas ciegas o con baja visión en Tijuana, México.
Analiza fotos de la cámara del teléfono mientras caminan.
Detecta obstáculos, escalones, bordillos, vehículos, postes, banquetas rotas, agujeros, escaleras, reflejos brillantes, muebles y personas en el paso.

REGLAS CRÍTICAS (prioriza seguridad):
- Si la imagen está oscura, rojiza, borrosa o con poca luz: NO uses "none". Usa al menos "low" y pide precaución.
- Si ves CUALQUIER objeto en el camino frontal: hazardLevel mínimo "low" y descríbelo en objects.
- Solo usa "none" si el paso frontal está claramente despejado y bien iluminado.
- Si dudas entre dos niveles, elige el MÁS alto, no el más bajo.
- No digas "camino libre" ni "despejado" si hay objetos listados en objects.

Responde ÚNICAMENTE con JSON válido (sin markdown):
{"hazardLevel":"none|low|medium|high","alertMessage":"frase corta en español para leer en voz alta (máx 120 caracteres)","objects":["objeto1","objeto2"],"estimatedDistanceMeters":1.5}
- estimatedDistanceMeters: número en metros al obstáculo más cercano en el paso frontal (0.2 a 5). Si no hay obstáculo claro, usa 2.5 o más.
- none: camino frontal claramente despejado
- low: precaución leve u objeto lejano
- medium: obstáculo cercano, reducir velocidad
- high: peligro inmediato, detenerse o cambiar rumbo`;

const GUIDED_SYSTEM = `Eres un guía de movilidad en tiempo real para una persona ciega en México.
La cámara apunta hacia adelante mientras camina. En cada imagen debes dar UNA sola instrucción oral corta (máximo 100 caracteres).

Prioriza en alertMessage:
- Dirección: "Gira un poco a la izquierda", "Gira a la derecha", "Sigue recto", "Detente ahora".
- Obstáculos muy cercanos: "Escalón delante, sube despacio", "Bordillo a la izquierda".
- Si el paso parece libre y bien iluminado: "Sigue recto con precaución".

REGLAS:
- No digas "toma una foto" ni describas la app.
- Si la imagen está oscura o borrosa: "Avanza muy despacio, no veo bien el camino".
- estimatedDistanceMeters solo si hay obstáculo en el paso (0.2–5 m); si está libre usa 2.5 o más.
- hazardLevel: none solo si el paso frontal está claramente despejado; si dudas, usa low.

Responde ÚNICAMENTE JSON válido (sin markdown):
{"hazardLevel":"none|low|medium|high","alertMessage":"instrucción de voz en español","objects":["objeto"],"estimatedDistanceMeters":1.5}`;

function getGeminiApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

function normalizeBase64(data: string): string {
  const trimmed = data.trim();
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',');
    if (comma >= 0) return trimmed.slice(comma + 1).replace(/\s/g, '');
  }
  return trimmed.replace(/\s/g, '');
}

function normalizeImage(image: ImageAttachment): ImageAttachment {
  return {
    base64: normalizeBase64(image.base64),
    mimeType: image.mimeType?.startsWith('image/') ? image.mimeType : 'image/jpeg',
  };
}

function calibrateScanResult(
  raw: EnvironmentScanResult,
  mode: 'scan' | 'guided',
): EnvironmentScanResult {
  let { hazardLevel, alertMessage, objects, estimatedDistanceMeters } = raw;
  const hasObjects = objects.length > 0;

  if (hasObjects && hazardLevel === 'none') {
    hazardLevel = objects.length >= 2 ? 'medium' : 'low';
    if (CLEAR_PHRASES.test(alertMessage)) {
      const list = objects.slice(0, 2).join(' y ');
      alertMessage = `Posible ${list} en el camino. Reduce velocidad y confirma con la vara o el pie.`;
    }
  }

  if (
    hazardLevel === 'none' &&
    mode === 'guided' &&
    !CLEAR_PHRASES.test(alertMessage)
  ) {
    hazardLevel = 'low';
  }

  if (alertMessage.length < 10 && hazardLevel === 'none') {
    hazardLevel = 'low';
    alertMessage =
      'No pude confirmar si el camino está libre. Avanza con precaución y escanea de nuevo.';
  }

  return { hazardLevel, alertMessage, objects, estimatedDistanceMeters };
}

function parseScanResult(raw: string): EnvironmentScanResult {
  const fallback: EnvironmentScanResult = {
    hazardLevel: 'low',
    alertMessage:
      'No pude analizar bien la imagen. Avanza despacio y vuelve a escanear si tienes dudas.',
    objects: [],
  };

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    const parsed = JSON.parse(jsonMatch[0]) as {
      hazardLevel?: string;
      alertMessage?: string;
      objects?: string[];
      estimatedDistanceMeters?: number;
    };
    const level = parsed.hazardLevel;
    const hazardLevel: HazardLevel =
      level === 'high' || level === 'medium' || level === 'low' || level === 'none'
        ? level
        : 'low';
    let estimatedDistanceMeters: number | undefined;
    if (
      typeof parsed.estimatedDistanceMeters === 'number' &&
      Number.isFinite(parsed.estimatedDistanceMeters)
    ) {
      estimatedDistanceMeters = Math.min(
        5,
        Math.max(0.15, parsed.estimatedDistanceMeters),
      );
    }

    return {
      hazardLevel,
      alertMessage:
        typeof parsed.alertMessage === 'string' && parsed.alertMessage.trim()
          ? parsed.alertMessage.trim()
          : fallback.alertMessage,
      objects: Array.isArray(parsed.objects)
        ? parsed.objects.filter((o) => typeof o === 'string').slice(0, 6)
        : [],
      estimatedDistanceMeters,
    };
  } catch {
    return fallback;
  }
}

async function callGeminiVision(
  apiKey: string,
  model: string,
  image: ImageAttachment,
  userPrompt: string,
  systemInstruction: string = SCAN_SYSTEM,
): Promise<string> {
  const normalized = normalizeImage(image);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: normalized.mimeType,
                data: normalized.base64,
              },
            },
            { text: userPrompt },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.15,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key inválida o sin permisos.');
    }
    if (response.status >= 500) {
      throw new Error('Servidor de IA ocupado o caído.');
    }
    throw new Error(`Gemini vision error (${model}): ${response.status} ${detail.slice(0, 120)}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function requestGeminiVisionText(
  apiKey: string,
  image: ImageAttachment,
  userPrompt: string,
  systemInstruction: string,
): Promise<string> {
  let lastError: Error | null = null;
  for (const model of GEMINI_VISION_MODELS) {
    try {
      const text = await callGeminiVision(apiKey, model, image, userPrompt, systemInstruction);
      if (text.trim()) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Error desconocido');
      // No reintenta en otros modelos si la API Key es inválida
      if (lastError.message.includes('API Key')) {
        throw lastError;
      }
    }
  }
  if (lastError) {
    console.warn('[environmentVision] Todos los modelos fallaron:', lastError.message);
    throw lastError;
  }
  return '';
}

export async function analyzeEnvironmentFrame(
  image: ImageAttachment,
  mode: 'scan' | 'guided' = 'scan',
): Promise<EnvironmentScanResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      hazardLevel: 'low',
      alertMessage:
        'Sin conexión a la IA. Configura EXPO_PUBLIC_GEMINI_API_KEY para detección automática.',
      objects: [],
    };
  }

  const userPrompt =
    mode === 'guided'
      ? 'Modo guía activo. Describe obstáculos inmediatos en el paso frontal. Si la foto está oscura o poco clara, asume precaución (no digas que está libre).'
      : 'Escaneo de entorno. ¿Hay obstáculos o riesgos en el camino frontal? Si la luz es mala, indica precaución.';

  const text = await requestGeminiVisionText(apiKey, image, userPrompt, SCAN_SYSTEM);
  if (!text.trim()) {
    return {
      hazardLevel: 'low',
      alertMessage:
        'No pude conectar con Gemini. Revisa tu clave API o intenta de nuevo en unos segundos.',
      objects: [],
    };
  }

  return calibrateScanResult(parseScanResult(text), mode);
}

/** Guía en vivo: Gemini orienta con giros y avisos de voz (no modo “tomar foto”). */
export async function analyzeGuidedEnvironmentFrame(
  image: ImageAttachment,
): Promise<EnvironmentScanResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      hazardLevel: 'low',
      alertMessage:
        'Sin conexión a la IA. Configura EXPO_PUBLIC_GEMINI_API_KEY para la guía con cámara.',
      objects: [],
    };
  }

  const userPrompt =
    'Guía en vivo. ¿Hacia dónde debe girar o avanzar la persona? Una sola frase clara para leer en voz alta.';

  const text = await requestGeminiVisionText(apiKey, image, userPrompt, GUIDED_SYSTEM);
  if (!text.trim()) {
    return {
      hazardLevel: 'low',
      alertMessage:
        'No pude analizar el camino ahora. Avanza muy despacio y mantén la cámara al frente.',
      objects: [],
    };
  }

  const raw = parseScanResult(text);
  if (!raw.alertMessage || raw.alertMessage.length < 8) {
    raw.alertMessage = 'Sigue recto con precaución. Escaneo activo.';
  }
  return calibrateScanResult(raw, 'guided');
}
