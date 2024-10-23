import React, { Component, ReactNode } from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // You can log the error to an error reporting service here
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI
      return (
        <h3 style={{ width: "100vw", textAlign: "center" }}>
          Something went wrong. Please Refresh and try again
        </h3>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
