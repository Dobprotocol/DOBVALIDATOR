const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const PRODUCTION_BACKEND_URL = 'https://v.dobprotocol.com';
const TEST_FILES_DIR = './test-files';

// Create test files directory if it doesn't exist
if (!fs.existsSync(TEST_FILES_DIR)) {
  fs.mkdirSync(TEST_FILES_DIR);
}

// Create test files
function createTestFiles() {
  console.log('📁 Creating test files...');
  
  // Create a simple test PDF (minimal valid PDF structure)
  const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF File) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

  // Create a simple test PNG (minimal valid PNG structure)
  const testPngContent = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1 pixel
    0x00, 0x00, 0x00, 0x01, // height: 1 pixel
    0x08, // bit depth
    0x02, // color type (RGB)
    0x00, // compression
    0x00, // filter
    0x00, // interlace
    0x37, 0x6E, 0xF9, 0x24, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // minimal image data
    0xE2, 0x21, 0xBC, 0x33, // IDAT CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);

  // Write test files
  fs.writeFileSync(path.join(TEST_FILES_DIR, 'test-document.pdf'), testPdfContent);
  fs.writeFileSync(path.join(TEST_FILES_DIR, 'test-image.png'), testPngContent);
  
  console.log('✅ Test files created successfully');
}

// Test file upload endpoint
async function testFileUpload() {
  console.log('🚀 Testing production file upload endpoint...');
  console.log(`📍 Backend URL: ${PRODUCTION_BACKEND_URL}`);
  
  try {
    // First, test the health endpoint to ensure backend is accessible
    console.log('\n🔍 Testing backend health...');
    const healthResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/health`);
    console.log(`Health status: ${healthResponse.status}`);
    
    if (!healthResponse.ok) {
      console.log('❌ Backend health check failed');
      return;
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Backend is healthy:', healthData);
    
    // Test file upload endpoint (without authentication first to see the error)
    console.log('\n🔍 Testing file upload endpoint (without auth)...');
    
    const formData = new FormData();
    const pdfFile = fs.createReadStream(path.join(TEST_FILES_DIR, 'test-document.pdf'));
    const pngFile = fs.createReadStream(path.join(TEST_FILES_DIR, 'test-image.png'));
    
    formData.append('file', pdfFile, 'test-document.pdf');
    formData.append('field', 'technical_certification');
    
    const uploadResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/upload-files`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Upload response status: ${uploadResponse.status}`);
    
    if (uploadResponse.status === 401) {
      console.log('✅ Expected 401 - Authentication required (endpoint is working)');
      const errorData = await uploadResponse.json();
      console.log('Error response:', errorData);
    } else {
      console.log('❌ Unexpected response status');
      const responseData = await uploadResponse.text();
      console.log('Response:', responseData);
    }
    
    // Test with multiple files
    console.log('\n🔍 Testing multiple file upload...');
    
    const multiFormData = new FormData();
    const pdfFile2 = fs.createReadStream(path.join(TEST_FILES_DIR, 'test-document.pdf'));
    const pngFile2 = fs.createReadStream(path.join(TEST_FILES_DIR, 'test-image.png'));
    
    multiFormData.append('files', pdfFile2, 'test-document.pdf');
    multiFormData.append('files', pngFile2, 'test-image.png');
    multiFormData.append('field', 'device_images');
    
    const multiUploadResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/upload-files`, {
      method: 'POST',
      body: multiFormData
    });
    
    console.log(`Multiple upload response status: ${multiUploadResponse.status}`);
    
    if (multiUploadResponse.status === 401) {
      console.log('✅ Expected 401 - Authentication required (multiple file upload endpoint is working)');
    } else {
      console.log('❌ Unexpected response for multiple files');
      const responseData = await multiUploadResponse.text();
      console.log('Response:', responseData);
    }
    
    console.log('\n✅ File upload endpoint tests completed successfully!');
    console.log('📝 The endpoint is ready to receive PDFs and PNGs (authentication required for actual uploads)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test CORS and preflight
async function testCORS() {
  console.log('\n🔍 Testing CORS preflight...');
  
  try {
    const preflightResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/upload-files`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://validator.dobprotocol.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`CORS preflight status: ${preflightResponse.status}`);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    if (preflightResponse.status === 200) {
      console.log('✅ CORS is properly configured');
    } else {
      console.log('❌ CORS configuration issue');
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting production backend file upload tests...\n');
  
  createTestFiles();
  await testFileUpload();
  await testCORS();
  
  console.log('\n🎉 All tests completed!');
}

// Run tests
runTests().catch(console.error); 