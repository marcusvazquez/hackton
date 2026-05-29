import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';
import {
  getInsecureGeolocationMessage,
  isGeolocationSecureContext,
} from '../utils/secureContext';

/**
 * Aviso en web cuando la página no está en contexto seguro (p. ej. http://192.168.x.x).
 */
export function SecureWebBanner() {
  const { colors, fontBold, fontRegular } = useAppTheme();

  if (Platform.OS !== 'web' || isGeolocationSecureContext()) {
    return null;
  }

  const message = getInsecureGeolocationMessage();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.errorContainer,
          borderColor: colors.error,
        },
      ]}
      accessibilityRole="alert"
    >
      <MaterialIcons name="lock-open" size={22} color={colors.error} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { fontFamily: fontBold, color: colors.onErrorContainer }]}>
          Conexión no segura
        </Text>
        <Text style={[styles.body, { fontFamily: fontRegular, color: colors.onErrorContainer }]}>
          {message}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver ayuda de desarrollo seguro"
        onPress={() => {
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-alert
            window.alert(
              'En tu PC (HTTPS + GPS):\n• npm run web:secure\n• Abre la URL https://….trycloudflare.com del terminal\n\nSolo en este PC (sin GPS en red):\n• http://localhost:8082\n\nAlternativa:\n• npm run web:tunnel (Expo) y abre el enlace https que muestra.',
            );
          }
        }}
        style={[styles.btn, { backgroundColor: colors.error }]}
      >
        <Text style={[styles.btnText, { fontFamily: fontBold, color: colors.onError }]}>Ayuda</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.gutter,
    marginHorizontal: spacing.edge,
    marginTop: spacing.gutter,
    padding: spacing.gutter,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, marginBottom: 4 },
  body: { fontSize: 12, lineHeight: 16 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignSelf: 'center',
  },
  btnText: { fontSize: 12 },
});
