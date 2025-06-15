import React from 'react';
import { TrufaCertificateViewerProps, CertificateData } from '../types';
import SkeletonCertificateViewer from './SkeletonCertificateViewer';
import '../styles.css';

// Mock data for demonstration
const mockCertificateData: CertificateData = {
  projectName: "NextGen Data Center Alpha",
  operatorName: "InfraCore Solutions Ltd.",
  validationDate: "2024-06-01T09:00:00Z",
  expiryDate: "2027-06-01T09:00:00Z",
  trufaScore: 98,
  deviceSpecifications: {
    type: "Data Center Facility",
    model: "Tier IV Modular",
    manufacturer: "InfraCore Solutions Ltd.",
    specifications: {
      "Total Power Capacity": "10 MW",
      "Cooling System": "Liquid Immersion & Chilled Water",
      "Rack Count": "500",
      "Uptime SLA": "99.995%",
      "PUE (Power Usage Effectiveness)": "1.15",
      "Certifications": "ISO 27001, SOC 2, Uptime Tier IV"
    }
  },
  blockchainTxId: "0xDC1234ABCD5678EF",
  verificationUrl: "https://explorer.dobprotocol.org/tx/0xDC1234ABCD5678EF"
};

export const TrufaCertificateViewer: React.FC<TrufaCertificateViewerProps> = ({
  projectId,
  certificateId,
  mode = 'full',
  theme = 'light',
  className = '',
}) => {
  const [certificateData, setCertificateData] = React.useState<CertificateData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setCertificateData(null);
    setError(null);
    // Simulate API delay
    const timer = setTimeout(() => {
      setCertificateData(mockCertificateData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [certificateId]);

  if (loading) {
    return <SkeletonCertificateViewer />;
  }

  if (error) {
    return (
      <div className={`trufa-certificate-error ${theme} ${className}`}>
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className={`trufa-certificate-not-found ${theme} ${className}`}>
        <div className="not-found-icon">🔍</div>
        <p>Certificate not found</p>
      </div>
    );
  }

  // --- Layout: Left (badge/summary), Right (details) ---
  return (
    <div className={`trufa-certificate-viewer ${theme} ${mode} ${className} flex flex-col md:flex-row gap-8`}>
      {/* Left: Badge and summary */}
      <div className="flex flex-col items-center md:w-1/3 w-full gap-4">
        {/* Badge image */}
        <img
          src="/certificate-mockup.png"
          alt="Certificate Badge"
          className="w-40 h-40 rounded-full object-cover shadow mb-4 border-4 border-white"
        />
        <div className="text-xl font-bold text-center">{certificateData.projectName}</div>
        <div className="text-sm text-gray-500 text-center">Issued by: <span className="font-medium">{certificateData.operatorName}</span></div>
        <div className="text-xs text-gray-400 text-center">Issued: {new Date(certificateData.validationDate).toLocaleDateString()} | Expires: {new Date(certificateData.expiryDate).toLocaleDateString()}</div>
        <button className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded shadow">Earn this Badge</button>
      </div>
      {/* Right: Details */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="text-2xl font-bold mb-2">TRUFA Score: {certificateData.trufaScore}</div>
        <div className="text-gray-700 mb-4">This certificate validates the data center's compliance with TRUFA standards and blockchain verification.</div>
        {/* Skills/Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">Benefit Analysis</span>
          <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">Quality Assurance</span>
          <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">Risk Management</span>
        </div>
        {/* Earning Criteria */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Earning Criteria</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Minimum 3 years of project operation</li>
            <li>Meets all TRUFA device and data standards</li>
            <li>Blockchain-verified validation</li>
          </ul>
        </div>
        {/* Standards */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Standards</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li><a href="#" className="text-blue-600 underline">ISO 17024</a></li>
            <li><a href="#" className="text-blue-600 underline">ISO 9001</a></li>
          </ul>
        </div>
        {/* Occupations */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Occupations</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded p-4">
              <div className="font-medium">Project Management Specialist</div>
              <div className="text-xs text-gray-500">Oversees project delivery and compliance.</div>
            </div>
            <div className="bg-gray-100 rounded p-4">
              <div className="font-medium">Data Center Infrastructure Manager</div>
              <div className="text-xs text-gray-500">Manages data center infrastructure and operations.</div>
            </div>
          </div>
        </div>
        {/* Related Badges */}
        <div>
          <div className="font-semibold mb-2">Related</div>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">🏅</div>
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">🏅</div>
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">🏅</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 