import React, { Component } from "react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <h3 style={{ width: "100vw", textAlign: "center" }}>
          Something went wrong. Please Refresh and try again
        </h3>
      );
    }

    return this.props.children;
  }
}
