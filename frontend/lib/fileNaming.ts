export function generateFileName({
  operatorId,
  documentType,
  originalName
}: {
  operatorId: string,
  documentType: string,
  originalName: string
}): string {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
  const ext = originalName.split('.').pop() || 'pdf'
  return `${timestamp}-${operatorId}-${documentType}.${ext}`
} 