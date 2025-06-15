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
