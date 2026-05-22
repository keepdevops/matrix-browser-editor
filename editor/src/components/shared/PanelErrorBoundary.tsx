import { Component, type ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[PanelErrorBoundary:${this.props.name}]`, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: 24, gap: 12,
        background: '#0a0f1e', color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{ fontSize: 28 }}>⚠</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
          {this.props.name} crashed
        </div>
        <div style={{
          fontSize: 11, color: '#94a3b8', maxWidth: 320, textAlign: 'center',
          background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
          padding: '8px 12px', fontFamily: 'monospace', wordBreak: 'break-word',
        }}>
          {error.message || String(error)}
        </div>
        <button
          onClick={this.reset}
          style={{
            padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
            background: '#1e293b', border: '1px solid #334155', color: '#a5b4fc',
          }}
        >
          ↺ Reload panel
        </button>
      </div>
    );
  }
}
