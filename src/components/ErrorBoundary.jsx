import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "An unexpected error occurred.",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            margin: "24px auto",
            maxWidth: 560,
            padding: 24,
            borderRadius: 10,
            backgroundColor: "#ffffff",
            boxShadow: "0px 0px 15px -10px rgba(0,0,0,0.75)",
          }}
        >
          <h2 style={{ color: "#b71c1c", marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 4,
              backgroundColor: "#99532f",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
