import React from 'react';
import { TrufaCertificateViewer } from '../index';
import '../styles.css';

// Mock data for demonstration
const mockCertificateData = {
  projectName: "Solar Farm Project Alpha",
  operatorName: "Green Energy Solutions",
  validationDate: "2024-03-15T10:00:00Z",
  expiryDate: "2025-03-15T10:00:00Z",
  trufaScore: 92,
  deviceSpecifications: {
    type: "Solar Panel Array",
    model: "SP-2000X",
    manufacturer: "SolarTech Industries",
    specifications: {
      "Power Output": "2.5 MW",
      "Efficiency": "22.5%",
      "Dimensions": "2.0m x 1.0m",
      "Weight": "25kg",
      "Operating Temperature": "-40°C to 85°C",
      "Warranty": "25 years"
    }
  },
  blockchainTxId: "0x1234...5678",
  verificationUrl: "https://explorer.example.com/tx/0x1234...5678"
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">TRUFA Certificate Viewer Demo</h1>
        
        <div className="space-y-12">
          {/* Full Mode */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Full Mode</h2>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <TrufaCertificateViewer
                projectId="solar-farm-alpha"
                certificateId="CERT-2024-001"
                mode="full"
                theme="light"
              />
            </div>
          </section>

          {/* Compact Mode */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Compact Mode</h2>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <TrufaCertificateViewer
                projectId="solar-farm-alpha"
                certificateId="CERT-2024-001"
                mode="compact"
                theme="light"
              />
            </div>
          </section>

          {/* Dark Theme */}
          <section className="dark">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Dark Theme</h2>
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
              <TrufaCertificateViewer
                projectId="solar-farm-alpha"
                certificateId="CERT-2024-001"
                mode="full"
                theme="dark"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App; 