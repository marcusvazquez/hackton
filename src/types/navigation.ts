export type TabId = 'mapa' | 'planear' | 'reportar' | 'comunidad';

export type OverlayId = 'perfil' | 'detalle' | 'settings' | 'expert';

export type ScreenId = TabId | OverlayId;

export const TAB_ORDER: TabId[] = ['mapa', 'planear', 'reportar', 'comunidad'];

export const TAB_LABELS: Record<TabId, string> = {
  mapa: 'Mapa',
  planear: 'Planear',
  reportar: 'Reportar',
  comunidad: 'Comunidad',
};
