import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { RouteOptionCard } from '../components/RouteOptionCard';
import { SectionHeader } from '../components/SectionHeader';
import { ROUTE_OPTIONS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';

type Props = {
  onOpenDetail?: () => void;
};

export function PlanearScreen({ onOpenDetail }: Props) {
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const [origin, setOrigin] = useState('Mi ubicación');
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState<'search' | 'results'>('search');
  const [selectedId, setSelectedId] = useState('accessible');

  const handleSearch = () => {
    if (destination.trim().length > 0) setStep('results');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionHeader
          title={step === 'search' ? 'Planear ruta' : 'Selección de ruta'}
          subtitle={
            step === 'search'
              ? 'Destino accesible en Tijuana'
              : `${origin} → ${destination || 'Destino'}`
          }
        />

        {step === 'search' ? (
          <>
            <View style={[styles.field, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="my-location" size={22} color={colors.primary} />
              <TextInput
                value={origin}
                onChangeText={setOrigin}
                style={[styles.input, { fontFamily: fontRegular, color: colors.onSurface }]}
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
            <View style={[styles.field, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="place" size={22} color={colors.secondary} />
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="¿A dónde vas?"
                style={[styles.input, { fontFamily: fontRegular, color: colors.onSurface }]}
                placeholderTextColor={colors.onSurfaceVariant}
                onSubmitEditing={handleSearch}
              />
            </View>

            <Pressable
              onPress={handleSearch}
              disabled={!destination.trim()}
              style={[
                styles.searchBtn,
                {
                  backgroundColor: destination.trim() ? colors.primary : colors.surfaceContainerHigh,
                  opacity: destination.trim() ? 1 : 0.6,
                },
              ]}
            >
              <MaterialIcons name="directions" size={22} color={colors.onPrimary} />
              <Text style={[styles.searchBtnText, { fontFamily: fontBold, color: colors.onPrimary }]}>
                Buscar rutas
              </Text>
            </Pressable>

            {isHackathon ? (
              <View style={[styles.hint, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.hintText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                  Modo cyber: compara ruta rápida vs. más accesible con puntuación en tiempo real.
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            {ROUTE_OPTIONS.map((route) => (
              <RouteOptionCard
                key={route.id}
                route={route}
                selected={selectedId === route.id}
                onSelect={() => setSelectedId(route.id)}
                onChoose={() => onOpenDetail?.()}
              />
            ))}
            <Pressable onPress={() => setStep('search')} style={styles.backLink}>
              <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
              <Text style={[styles.backText, { fontFamily: fontRegular, color: colors.primary }]}>
                Cambiar destino
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: spacing.edge,
    paddingBottom: 120,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.md,
    marginTop: 8,
  },
  searchBtnText: { fontSize: 16 },
  hint: {
    marginTop: spacing.gutter,
    padding: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    borderStyle: 'dashed',
  },
  hintText: { fontSize: 13, lineHeight: 20 },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  backText: { fontSize: 15 },
});
