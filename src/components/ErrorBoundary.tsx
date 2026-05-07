import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.name} ErrorBoundary]`, error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 border border-red-200 rounded-xl bg-red-50 text-red-700">
          <h3 className="font-bold mb-2">🚨 {this.props.name} crashed</h3>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border border-red-100 whitespace-pre-wrap">
            {this.state.error.message}
            {"\n\n"}
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}