import React from 'react';
import { TrufaCertificateViewerProps, CertificateData } from '../types';

// Mock data for demonstration
const mockCertificateData: CertificateData = {
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
    // Simulate API call with mock data
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setCertificateData(mockCertificateData);
      } catch (err) {
        setError('Failed to load certificate data');
        console.error('Error fetching certificate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [certificateId]);

  if (loading) {
    return (
      <div className={`trufa-certificate-loading ${theme} ${className}`}>
        <div className="loading-spinner"></div>
        <p>Loading certificate...</p>
      </div>
    );
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

  return (
    <div className={`trufa-certificate-viewer ${theme} ${mode} ${className}`}>
      <div className="certificate-header">
        <h1>TRUFA Certificate</h1>
        <div className="certificate-id">ID: {certificateId}</div>
      </div>

      <div className="certificate-content">
        <div className="project-info">
          <h2>{certificateData.projectName}</h2>
          <p>Operator: {certificateData.operatorName}</p>
        </div>

        <div className="validation-details">
          <div className="validation-date">
            Validated: {new Date(certificateData.validationDate).toLocaleDateString()}
          </div>
          <div className="expiry-date">
            Expires: {new Date(certificateData.expiryDate).toLocaleDateString()}
          </div>
          <div className="trufa-score">
            TRUFA Score: {certificateData.trufaScore}
          </div>
        </div>

        {mode === 'full' && (
          <>
            <div className="device-specifications">
              <h3>Device Specifications</h3>
              <p>Type: {certificateData.deviceSpecifications.type}</p>
              <p>Model: {certificateData.deviceSpecifications.model}</p>
              <p>Manufacturer: {certificateData.deviceSpecifications.manufacturer}</p>
              <div className="specs-grid">
                {Object.entries(certificateData.deviceSpecifications.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="blockchain-info">
              <h3>Blockchain Verification</h3>
              <p>Transaction ID: {certificateData.blockchainTxId}</p>
              <a href={certificateData.verificationUrl} target="_blank" rel="noopener noreferrer">
                Verify on Explorer
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 