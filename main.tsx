import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import App from "./App";
import "./styles/globals.css";

// Add error boundary for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
          <h1>Something went wrong</h1>
          <p>Please reload the page. If the problem continues, contact support.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const appContent = (
  <ErrorBoundary>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <AuthProvider>
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
          <App />
          <Toaster position="top-center" richColors expand={true} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>{appContent}</React.StrictMode>
);
