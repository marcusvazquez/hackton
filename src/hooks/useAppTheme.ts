import { useAccessibility } from '../context/AccessibilityContext';
import { colors as defaultColors, spacing } from '../theme/colors';
import { hackathonColors, hackathonGlass } from '../theme/hackathonColors';
import { glass as defaultGlass } from '../theme/shadows';

export function useAppTheme() {
  const { hackathonMode, talkBackEnabled } = useAccessibility();
  /** Visual hackathon skin is independent of TalkBack (audio/haptics still respect talkBack). */
  const isHackathon = hackathonMode;

  return {
    colors: isHackathon ? hackathonColors : defaultColors,
    glass: isHackathon ? hackathonGlass : defaultGlass,
    isHackathon,
    fontPixel: 'PressStart2P_400Regular',
    fontPixelBody: 'VT323_400Regular',
    /** Negritas / énfasis — VT323 en hackathon (Press Start solo vía fontPixel). */
    fontBold: isHackathon ? 'VT323_400Regular' : 'AtkinsonHyperlegible_700Bold',
    /** Cuerpo y navegación (VT323 en hackathon). */
    fontRegular: isHackathon ? 'VT323_400Regular' : 'AtkinsonHyperlegible_400Regular',
    /** Etiquetas de pestañas y párrafos — evita Press Start en textos largos. */
    fontNav: isHackathon ? 'VT323_400Regular' : 'AtkinsonHyperlegible_700Bold',
    spacing,
  };
}
