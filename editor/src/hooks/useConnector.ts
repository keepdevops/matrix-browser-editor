import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

type ConnectorMode = 'export' | 'analyze' | 'inject' | 'live';
type ConnectorStatus = 'idle' | 'loading' | 'success' | 'error';

interface ConnectorState {
  status: ConnectorStatus;
  message: string;
  result: unknown;
}

export function useConnector() {
  const [state, setState] = useState<ConnectorState>({ status: 'idle', message: '', result: null });
  const { code, componentName } = useEditorStore();
  const { targetProjectPath, styleSystem } = useSessionStore();

  const run = useCallback(async (mode: ConnectorMode, options: Record<string, string> = {}) => {
    setState({ status: 'loading', message: `Running ${mode}…`, result: null });

    const body: Record<string, string> = {
      mode,
      componentCode: code,
      componentName,
      styleSystem,
      projectPath: options.projectPath || targetProjectPath,
      targetFile: options.targetFile || '',
    };

    try {
      const response = await fetch(`${SERVER}/api/connector/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setState({ status: 'success', message: `${mode} complete`, result: data.result });
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[useConnector/${mode}] error:`, message);
      setState({ status: 'error', message, result: null });
      throw err;
    }
  }, [code, componentName, styleSystem, targetProjectPath]);

  const exportComponent = (outputDir?: string) => run('export', outputDir ? { projectPath: outputDir } : {});
  const analyzeProject = (projectPath?: string) => run('analyze', projectPath ? { projectPath } : {});
  const injectIntoFile = (targetFile: string) => run('inject', { targetFile });
  const liveInject = (targetUrl?: string) => run('live', targetUrl ? { projectPath: targetUrl } : {});
  const reset = () => setState({ status: 'idle', message: '', result: null });

  return { ...state, exportComponent, analyzeProject, injectIntoFile, liveInject, reset };
}
