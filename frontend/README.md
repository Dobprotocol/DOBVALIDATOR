# DOB Validator Frontend

## File Upload Naming Convention

All uploaded files are automatically renamed using a convention to ensure uniqueness and traceability. The format is:

```
{timestamp}-{operatorId}-{documentType}.{ext}
```

- **timestamp**: ISO timestamp (YYYYMMDDHHMMSS)
- **operatorId**: The wallet address of the user submitting the form
- **documentType**: The type of document (e.g., technicalCertification, purchaseProof, etc.)
- **ext**: The original file extension

This logic is implemented in `lib/fileNaming.ts` and integrated into the file upload logic in the form. The operator ID is always the connected wallet address.

---

## Backend Integration: Form Submission

### Endpoint

- **URL:** `/api/submit` (to be implemented in the backend)
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### Payload Structure

- All form fields are sent as part of a `FormData` object.
- File fields are included as files (with the naming convention above).
- Array fields (e.g., `additionalDocuments`) are sent as multiple files: `additionalDocuments[0]`, `additionalDocuments[1]`, etc.

#### Example Fields

- `deviceName`: string
- `deviceType`: string
- `serialNumber`: string
- `manufacturer`: string
- `model`: string
- `yearOfManufacture`: string
- `condition`: string
- `specifications`: string
- `purchasePrice`: string
- `currentValue`: string
- `expectedRevenue`: string
- `operationalCosts`: string
- `technicalCertification`: file (PDF)
- `purchaseProof`: file (PDF)
- `maintenanceRecords`: file (PDF)
- `additionalDocuments[0]`, `additionalDocuments[1]`, ...: file (PDF/JPG/PNG/DOC/XLS)

### Example Request (pseudo-code)

```
POST /api/submit
Content-Type: multipart/form-data

FormData:
  deviceName: "Solar Panel"
  deviceType: "Solar Panel"
  serialNumber: "SN123456"
  manufacturer: "Acme Corp"
  ...
  technicalCertification: <File: 20240607-GABC1234-technicalCertification.pdf>
  purchaseProof: <File: 20240607-GABC1234-purchaseProof.pdf>
  maintenanceRecords: <File: 20240607-GABC1234-maintenanceRecords.pdf>
  additionalDocuments[0]: <File: 20240607-GABC1234-additionalDocument.pdf>
```

### Expected Backend Response

- **Success:**
  - Status: `200 OK`
  - Body: `{ "success": true, "message": "Submission received." }`
- **Error:**
  - Status: `400` or `500`
  - Body: `{ "success": false, "message": "Error message here." }`

### Integration Notes

- The backend should parse `multipart/form-data` and handle file uploads.
- File names will already be in the correct convention.
- The backend should validate all fields and files (type, size, etc.) for security.
- The backend can use the wallet address (operatorId) for authentication/authorization if needed.
- On success, store the submission and return a success response.
- On error, return a clear error message for the frontend to display.
