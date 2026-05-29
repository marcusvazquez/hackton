export type TabId = 'mapa' | 'planear' | 'reportar' | 'comunidad';

export type ScreenId = TabId | 'perfil' | 'detalle';

export const TAB_ORDER: TabId[] = ['mapa', 'planear', 'reportar', 'comunidad'];

export const TAB_LABELS: Record<TabId, string> = {
  mapa: 'Mapa',
  planear: 'Planear',
  reportar: 'Reportar',
  comunidad: 'Comunidad',
};
