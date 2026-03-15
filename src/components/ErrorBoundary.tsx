import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Try to parse FirestoreErrorInfo
      let displayMessage = "Terjadi kesalahan pada aplikasi.";
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed.error && parsed.operationType) {
          displayMessage = `Gagal melakukan operasi (${parsed.operationType}). Pastikan Anda memiliki akses yang sesuai.`;
          if (parsed.error.includes('Missing or insufficient permissions')) {
            displayMessage = "Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.";
          }
        }
      } catch (e) {
        // Not a JSON error
        displayMessage = this.state.errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-2">Oops! Ada Masalah</h2>
            <p className="text-stone-500 mb-6">{displayMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
