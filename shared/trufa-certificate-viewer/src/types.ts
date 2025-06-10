export interface TrufaCertificateViewerProps {
  /**
   * Unique identifier of the validated project
   */
  projectId: string;
  
  /**
   * Unique identifier of the TRUFA certificate
   */
  certificateId: string;
  
  /**
   * Display mode of the certificate
   * @default "full"
   */
  mode?: 'full' | 'compact';
  
  /**
   * Visual theme of the certificate
   * @default "light"
   */
  theme?: 'light' | 'dark';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface CertificateData {
  projectName: string;
  operatorName: string;
  validationDate: string;
  expiryDate: string;
  trufaScore: number;
  blockchainTxId: string;
  verificationUrl: string;
  deviceSpecifications: {
    type: string;
    model: string;
    manufacturer: string;
    specifications: Record<string, string>;
  };
} 