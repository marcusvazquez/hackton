import { useAccessibility } from '../context/AccessibilityContext';
import { colors as defaultColors, spacing } from '../theme/colors';
import { hackathonColors, hackathonGlass } from '../theme/hackathonColors';
import { glass as defaultGlass } from '../theme/shadows';

export function useAppTheme() {
  const { hackathonMode, talkBackEnabled } = useAccessibility();
  const isHackathon = hackathonMode && !talkBackEnabled;

  return {
    colors: isHackathon ? hackathonColors : defaultColors,
    glass: isHackathon ? hackathonGlass : defaultGlass,
    isHackathon,
    fontBold: isHackathon ? 'monospace' : 'AtkinsonHyperlegible_700Bold',
    fontRegular: isHackathon ? 'monospace' : 'AtkinsonHyperlegible_400Regular',
    spacing,
  };
}
