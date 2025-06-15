import React from 'react';
import { TrufaCertificateViewer } from '../index';
import '../styles.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">TRUFA Certificate Public Viewer</h1>
        <div className="mb-8 text-center text-gray-600 max-w-2xl mx-auto">
          This is the official public viewer for TRUFA-verified projects in the DOB Protocol ecosystem. All information shown is public and verifiable. No download options are available.
        </div>
        <div className="flex justify-center">
          <TrufaCertificateViewer
            projectId="solar-farm-alpha"
            certificateId="CERT-2024-001"
            mode="full"
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default App; 