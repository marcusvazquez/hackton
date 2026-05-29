import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  AIContextId,
  ChatMessage,
  ImageAttachment,
  requestAssistantReply,
  syncQueuedMessages,
} from '../services/aiAssistant';
import { spacing } from '../theme/colors';
import { mapOverlay } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';
import { TAB_LABELS, TabId } from '../types/navigation';
import { uriToImageAttachment } from '../utils/imageAttachment';
import { isNetworkOnline } from '../utils/networkStatus';
import { speakMessage, stopGeneratedAudio } from '../utils/playGeneratedAudio';
import {
  playNavigationSound,
  playTapSound,
  playSuccessSound,
  playErrorSound,
  playMessageReceivedSound,
} from '../utils/talkbackSounds';

type Props = {
  activeTab: TabId;
  overlay?: 'perfil' | 'detalle' | null;
};

const CONTEXT_LABELS: Record<AIContextId, string> = {
  ...TAB_LABELS,
  accesibilidad: 'Accesibilidad',
};

function resolveContext(activeTab: TabId, overlay?: 'perfil' | 'detalle' | null): AIContextId {
  if (overlay === 'perfil') return 'accesibilidad';
  if (overlay === 'detalle') return 'planear';
  return activeTab;
}

export function AIAssistant({ activeTab, overlay = null }: Props) {
  const context = resolveContext(activeTab, overlay);
  const { talkBackEnabled, reduceMotion, speak } = useAccessibility();
  const { colors, isHackathon } = useAppTheme();
  const insets = useSafeAreaInsets();

  const fontRegular = 'AtkinsonHyperlegible_400Regular';
  const fontBold = 'AtkinsonHyperlegible_700Bold';

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ uri: string; attachment: ImageAttachment } | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const translateY = useSharedValue(0);
  const sheetHeight = useSharedValue(0);

  messagesRef.current = messages;

  useEffect(() => {
    void NetInfo.fetch().then((state) => {
      setIsConnected(isNetworkOnline(state));
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(isNetworkOnline(state));
    });
    return unsubscribe;
  }, []);

  const wasOfflineRef = useRef(!isConnected);

  useEffect(() => {
    if (!isConnected) {
      wasOfflineRef.current = true;
      return;
    }
    if (!wasOfflineRef.current) return;
    wasOfflineRef.current = false;

    void syncQueuedMessages({ [context]: messagesRef.current }).then(({ synced, replies }) => {
      if (synced > 0 && replies.length > 0) {
        setMessages((prev) => [...prev, ...replies].slice(-10));
      }
    });
  }, [isConnected, context]);

  const welcomeMessage = useMemo(
    () =>
      `Hola, soy tu guía IA en ${CONTEXT_LABELS[context]}. ¿En qué puedo ayudarte?`,
    [context],
  );

  useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 'welcome',
          role: 'assistant',
          content: welcomeMessage,
        },
      ];
    });
  }, [open, welcomeMessage]);

  useEffect(() => {
    if (open) return;
    void stopGeneratedAudio();
    setAudioLoadingId(null);
  }, [open]);

  const listenToMessage = useCallback(async (message: ChatMessage) => {
    if (audioLoadingId && audioLoadingId !== message.id) return;

    setAudioLoadingId(message.id);
    await stopGeneratedAudio();

    if (talkBackEnabled) playTapSound();

    try {
      await speakMessage(message.content);
    } catch {
      // speakMessage already fails silently on empty text
    } finally {
      setAudioLoadingId(null);
    }
  }, [audioLoadingId, talkBackEnabled]);

  const attachImage = useCallback(async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        source === 'camera'
          ? 'Activa el permiso de cámara para tomar fotos.'
          : 'Activa el permiso de galería para elegir fotos.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
          });

    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      const asset = result.assets[0];
      let attachment: ImageAttachment;
      
      if (asset.base64) {
        attachment = {
          base64: asset.base64,
          mimeType: asset.mimeType || 'image/jpeg',
        };
      } else {
        attachment = await uriToImageAttachment(asset.uri);
      }
      
      setPendingImage({ uri: asset.uri, attachment });
      if (talkBackEnabled) {
        playSuccessSound();
        void speak('Foto adjuntada correctamente');
      }
    } catch {
      if (talkBackEnabled) playErrorSound();
      Alert.alert('Error', 'No se pudo preparar la imagen. Intenta con otra foto.');
    }
  }, [talkBackEnabled, speak]);

  const showAttachOptions = useCallback(() => {
    Alert.alert('Adjuntar foto', 'Elige cómo agregar una imagen al mensaje', [
      { text: 'Tomar foto', onPress: () => void attachImage('camera') },
      { text: 'Elegir de galería', onPress: () => void attachImage('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [attachImage]);

  const closeSheet = useCallback(() => {
    if (reduceMotion) {
      setOpen(false);
      translateY.value = 0;
      return;
    }
    translateY.value = withTiming(sheetHeight.value, { duration: 220 }, () => {
      runOnJS(setOpen)(false);
      translateY.value = 0;
    });
  }, [reduceMotion, sheetHeight, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 800) {
        runOnJS(closeSheet)();
        return;
      }
      translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const sendMessage = async () => {
    const trimmed = input.trim();
    if ((!trimmed && !pendingImage) || loading) return;

    if (talkBackEnabled) {
      playTapSound();
      void speak('Mensaje enviado, esperando respuesta');
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed || '¿Qué ves en esta foto?',
      imageUri: pendingImage?.uri,
    };

    const imageAttachment = pendingImage?.attachment;
    setInput('');
    setPendingImage(null);
    setLoading(true);
    setMessages((prev) => [...prev, userMessage].slice(-10));

    try {
      const history = [...messages, userMessage].slice(-10);
      const { content } = await requestAssistantReply(
        context,
        userMessage.content,
        history,
        isConnected,
        imageAttachment,
      );
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content,
      };
      setMessages((prev) => [...prev, assistantMessage].slice(-10));

      if (talkBackEnabled) {
        playMessageReceivedSound();
        void speak(`Respuesta del asistente: ${content.substring(0, 200)}`);
      }
    } catch {
      if (talkBackEnabled) playErrorSound();
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !reduceMotion }));
    }
  };

  const sheetBackground = talkBackEnabled ? '#000000' : colors.surfaceContainerLowest;
  const sheetText = talkBackEnabled ? '#ffffff' : colors.onSurface;
  const sheetMuted = talkBackEnabled ? '#e5e5e5' : colors.onSurfaceVariant;
  const userBubble = talkBackEnabled ? colors.talkBackBlue : colors.primary;
  const assistantBubble = talkBackEnabled ? '#1a1a1a' : colors.surfaceContainerLow;
  const fabColors = talkBackEnabled
    ? { bg: colors.talkBackBlue, border: '#ffffff', icon: '#ffffff' }
    : { bg: colors.primary, border: colors.onPrimary, icon: colors.onPrimary };

  return (
    <>
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <Pressable
          accessible={true}
          importantForAccessibility="yes"
          accessibilityLabel="Abrir asistente de inteligencia artificial"
          accessibilityHint="Guía de accesibilidad con respuestas según la pantalla activa"
          accessibilityRole="button"
          onPress={() => {
            setOpen(true);
            if (talkBackEnabled) {
              playNavigationSound();
              void speak('Asistente de inteligencia artificial abierto');
            }
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: fabColors.bg,
              borderColor: isHackathon ? colors.secondary : fabColors.border,
              opacity: pressed ? 0.92 : 1,
            },
            shadows.lg,
          ]}
        >
          <View style={[styles.fabBadge, { backgroundColor: colors.secondaryContainer }]}>
            <Text style={[styles.fabBadgeText, { fontFamily: fontBold, color: colors.onSecondaryContainer }]}>
              IA
            </Text>
          </View>
          <MaterialIcons name="pets" size={28} color={fabColors.icon} accessibilityElementsHidden />
        </Pressable>
      </View>

      <Modal animationType={reduceMotion ? 'none' : 'slide'} transparent visible={open} onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable accessibilityLabel="Cerrar asistente" style={styles.backdrop} onPress={closeSheet} />

          <GestureDetector gesture={panGesture}>
            <Animated.View
              onLayout={(event) => {
                sheetHeight.value = event.nativeEvent.layout.height;
              }}
              style={[
                styles.sheet,
                {
                  backgroundColor: sheetBackground,
                  paddingBottom: Math.max(insets.bottom, spacing.gutter),
                },
                sheetAnimatedStyle,
              ]}
            >
              <View style={styles.handleRow}>
                <View style={[styles.handle, { backgroundColor: sheetMuted }]} accessibilityElementsHidden />
              </View>

              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <Text style={[styles.headerTitle, { fontFamily: fontBold, color: sheetText }]}>
                    Guía IA
                  </Text>
                  <Text style={[styles.headerSubtitle, { fontFamily: fontRegular, color: sheetMuted }]}>
                    {CONTEXT_LABELS[context]}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <View
                    accessibilityLabel={isConnected ? 'Conectado' : 'Sin conexión'}
                    style={[
                      styles.statusDot,
                      { backgroundColor: isConnected ? colors.safeGreen : colors.error },
                    ]}
                  />
                  <Pressable
                    accessibilityLabel="Cerrar chat del asistente"
                    accessibilityRole="button"
                    hitSlop={12}
                    onPress={closeSheet}
                  >
                    <MaterialIcons name="close" size={24} color={sheetText} />
                  </Pressable>
                </View>
              </View>

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => {
                  const isUser = item.role === 'user';
                  const isAudioLoading = audioLoadingId === item.id;
                  return (
                    <View
                      style={[
                        styles.bubble,
                        {
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          backgroundColor: isUser ? userBubble : assistantBubble,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          {
                            fontFamily: fontRegular,
                            color: isUser ? colors.onPrimary : sheetText,
                          },
                        ]}
                      >
                        {item.content}
                      </Text>
                      {item.imageUri ? (
                        <Image
                          accessibilityLabel="Imagen adjunta al mensaje"
                          source={{ uri: item.imageUri }}
                          style={styles.messageImage}
                        />
                      ) : null}
                      {!isUser ? (
                        <Pressable
                          accessibilityLabel="Escuchar respuesta del asistente"
                          accessibilityHint="Lee la respuesta en voz alta con el sintetizador del dispositivo"
                          accessibilityRole="button"
                          disabled={Boolean(audioLoadingId && audioLoadingId !== item.id)}
                          hitSlop={8}
                          onPress={() => void listenToMessage(item)}
                          style={({ pressed }) => [
                            styles.listenButton,
                            { opacity: pressed || isAudioLoading ? 0.7 : 1 },
                          ]}
                        >
                          {isAudioLoading ? (
                            <ActivityIndicator size="small" color={sheetText} />
                          ) : (
                            <MaterialIcons name="volume-up" size={20} color={sheetText} />
                          )}
                          <Text
                            style={[
                              styles.listenLabel,
                              { fontFamily: fontRegular, color: sheetMuted },
                            ]}
                          >
                            Escuchar
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                }}
              />

              {loading ? (
                <View style={styles.loadingRow} accessibilityLabel="Generando respuesta">
                  <ActivityIndicator color={userBubble} />
                  <Text style={[styles.loadingText, { fontFamily: fontRegular, color: sheetMuted }]}>
                    Pensando…
                  </Text>
                </View>
              ) : null}

              {pendingImage ? (
                <View style={styles.pendingImageRow}>
                  <Image
                    accessibilityLabel="Vista previa de imagen adjunta"
                    source={{ uri: pendingImage.uri }}
                    style={styles.pendingImage}
                  />
                  <Pressable
                    accessibilityLabel="Quitar imagen adjunta"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setPendingImage(null)}
                    style={styles.removeImageButton}
                  >
                    <MaterialIcons name="close" size={20} color={sheetText} />
                  </Pressable>
                </View>
              ) : null}

              <View style={[styles.inputRow, { borderTopColor: talkBackEnabled ? '#333333' : colors.outlineVariant }]}>
                <Pressable
                  accessibilityLabel="Adjuntar foto"
                  accessibilityHint="Tomar foto o elegir de la galería"
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={showAttachOptions}
                  style={({ pressed }) => [
                    styles.attachButton,
                    {
                      borderColor: talkBackEnabled ? '#444444' : colors.outlineVariant,
                      opacity: loading ? 0.5 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="photo-camera" size={22} color={sheetText} />
                </Pressable>
                <TextInput
                  accessibilityLabel="Escribe tu pregunta al asistente"
                  placeholder="Escribe tu pregunta…"
                  placeholderTextColor={sheetMuted}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  style={[
                    styles.input,
                    {
                      fontFamily: fontRegular,
                      color: sheetText,
                      backgroundColor: talkBackEnabled ? '#111111' : colors.surfaceContainerLow,
                      borderColor: talkBackEnabled ? '#444444' : colors.outlineVariant,
                    },
                  ]}
                />
                <Pressable
                  accessibilityLabel="Enviar mensaje"
                  accessibilityRole="button"
                  disabled={(!input.trim() && !pendingImage) || loading}
                  onPress={sendMessage}
                  style={({ pressed }) => [
                    styles.sendButton,
                    {
                      backgroundColor: userBubble,
                      opacity: (!input.trim() && !pendingImage) || loading ? 0.5 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="send" size={22} color={colors.onPrimary} />
                </Pressable>
              </View>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: mapOverlay.aiFabBottom,
    right: spacing.edge,
    zIndex: 30,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  fabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    fontSize: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.gutter,
    paddingHorizontal: spacing.edge,
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: spacing.gutter,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.gutter,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  messageList: {
    gap: 10,
    paddingBottom: spacing.gutter,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageImage: {
    width: '100%',
    maxWidth: 220,
    height: 160,
    borderRadius: radii.sm,
    marginTop: 8,
  },
  pendingImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: spacing.gutter,
  },
  pendingImage: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
  },
  removeImageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  listenLabel: {
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: spacing.gutter,
  },
  loadingText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.gutter,
  },
  attachButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
