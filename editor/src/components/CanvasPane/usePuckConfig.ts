import { useMemo } from 'react';
import type { Config } from '@measured/puck';
import { useLibraryStore } from '../../store/libraryStore';
import { useEditorStore } from '../../store/editorStore';
import { useSessionStore } from '../../store/sessionStore';
import { PuckItemFrame } from './PuckItemFrame';

export function usePuckConfig(): Config {
  const { components: library } = useLibraryStore();
  const { code, componentName } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  return useMemo(() => {
    const config: Config = { components: {} };

    // Register each library component
    library.forEach((item) => {
      const name = item.name.replace(/[^a-zA-Z0-9_]/g, '_') || 'Component';
      config.components[name] = {
        label: item.name,
        fields: {
          propsJson: { type: 'text', label: 'Props (JSON)' },
          height: { type: 'number', label: 'Height (px)' },
        },
        defaultProps: { propsJson: '{}', height: 200 } as Record<string, unknown>,
        render: ({ propsJson, height }: { propsJson: string; height: number }) =>
          PuckItemFrame({ code: item.code, propsJson, height: Number(height) || 200, styleSystem, theme }),
      };
    });

    // Also expose the current editor component if it has code
    if (code.trim()) {
      const name = (componentName || 'Current').replace(/[^a-zA-Z0-9_]/g, '_');
      const label = `✦ ${componentName || 'Current'} (editor)`;
      config.components[`__current_${name}`] = {
        label,
        fields: {
          propsJson: { type: 'text', label: 'Props (JSON)' },
          height: { type: 'number', label: 'Height (px)' },
        },
        defaultProps: { propsJson: '{}', height: 200 } as Record<string, unknown>,
        render: ({ propsJson, height }: { propsJson: string; height: number }) =>
          PuckItemFrame({ code, propsJson, height: Number(height) || 200, styleSystem, theme }),
      };
    }

    return config;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library, code, componentName, styleSystem, theme]);
}
