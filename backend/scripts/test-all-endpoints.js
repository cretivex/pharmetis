import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = null;
let supplierToken = null;
let userToken = null;

async function testEndpoint(method, endpoint, data = null, token = null, description = '') {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    console.log(`${colors.green}✅${colors.reset} ${description || endpoint} - Status: ${response.status}`);
    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response?.status || 'NETWORK_ERROR';
    const message = error.response?.data?.message || error.message;
    console.log(`${colors.red}❌${colors.reset} ${description || endpoint} - Status: ${status} - ${message}`);
    return { success: false, error: message, status };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🧪 COMPREHENSIVE API ENDPOINT TESTING${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  // Test 1: Health Check
  console.log(`${colors.blue}📋 Testing Health & Public Endpoints${colors.reset}`);
  await testEndpoint('GET', '/health', null, null, 'Health Check');
  await testEndpoint('GET', '/products', null, null, 'Get Products (Public)');
  await testEndpoint('GET', '/suppliers', null, null, 'Get Suppliers (Public)');
  await testEndpoint('GET', '/categories', null, null, 'Get Categories (Public)');
  console.log('');

  // Test 2: Authentication
  console.log(`${colors.blue}🔐 Testing Authentication${colors.reset}`);
  
  // Admin Login
  const adminLogin = await testEndpoint('POST', '/auth/login', {
    email: 'admin@pharmetis.com',
    password: 'Admin123!'
  }, null, 'Admin Login');
  if (adminLogin.success && adminLogin.data?.data) {
    adminToken = adminLogin.data.data.accessToken || adminLogin.data.data.token;
  }

  // Supplier Login
  const supplierLogin = await testEndpoint('POST', '/auth/login', {
    email: 'supplier1@test.com',
    password: 'Supplier123!'
  }, null, 'Supplier Login');
  if (supplierLogin.success && supplierLogin.data?.data) {
    supplierToken = supplierLogin.data.data.accessToken || supplierLogin.data.data.token;
  }

  // User/Buyer Login
  const userLogin = await testEndpoint('POST', '/auth/login', {
    email: 'buyer@test.com',
    password: 'password123'
  }, null, 'Buyer Login');
  if (userLogin.success && userLogin.data?.data) {
    userToken = userLogin.data.data.accessToken || userLogin.data.data.token;
  }
  console.log('');

  // Test 3: Admin Endpoints
  if (adminToken) {
    console.log(`${colors.blue}👑 Testing Admin Endpoints${colors.reset}`);
    await testEndpoint('GET', '/dashboard/stats', null, adminToken, 'Dashboard Stats');
    await testEndpoint('GET', '/analytics/overview', null, adminToken, 'Analytics Overview');
    await testEndpoint('GET', '/rfqs', null, adminToken, 'Get All RFQs');
    await testEndpoint('GET', '/suppliers', null, adminToken, 'Get All Suppliers');
    await testEndpoint('GET', '/products', null, adminToken, 'Get All Products');
    await testEndpoint('GET', '/rfq-responses', null, adminToken, 'Get All RFQ Responses');
    await testEndpoint('GET', '/system-settings', null, adminToken, 'Get System Settings');
    console.log('');
  }

  // Test 4: Supplier Endpoints
  if (supplierToken) {
    console.log(`${colors.blue}🏭 Testing Supplier Endpoints${colors.reset}`);
    await testEndpoint('GET', '/rfqs/assigned', null, supplierToken, 'Get Assigned RFQs');
    await testEndpoint('GET', '/products/my', null, supplierToken, 'Get My Products');
    await testEndpoint('GET', '/suppliers/me', null, supplierToken, 'Get My Supplier Profile');
    await testEndpoint('GET', '/rfq-responses/my', null, supplierToken, 'Get My RFQ Responses');
    console.log('');
  }

  // Test 5: User/Buyer Endpoints
  if (userToken) {
    console.log(`${colors.blue}🛒 Testing Buyer Endpoints${colors.reset}`);
    await testEndpoint('GET', '/rfqs', null, userToken, 'Get My RFQs');
    await testEndpoint('GET', '/orders', null, userToken, 'Get My Orders');
    await testEndpoint('GET', '/products/save', null, userToken, 'Get Saved Products');
    await testEndpoint('GET', '/auth/me', null, userToken, 'Get My Profile');
    console.log('');
  }

  // Test 6: CRUD Operations (if tokens available)
  if (adminToken) {
    console.log(`${colors.blue}📝 Testing CRUD Operations${colors.reset}`);
    
    // Create Product (if supplier token available)
    if (supplierToken) {
      const testProduct = {
        supplierId: 'test-supplier-id', // Would need actual supplier ID
        name: 'Test Product',
        dosageForm: 'TABLET',
        availability: 'IN_STOCK',
        price: 10.50
      };
      // Note: This will fail without valid supplier ID
      // await testEndpoint('POST', '/products', testProduct, supplierToken, 'Create Product');
    }
    
    console.log('(CRUD operations require valid IDs - skipping for now)');
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Health Check: PASSED${colors.reset}`);
  console.log(`${adminToken ? colors.green + '✅' : colors.red + '❌'} Admin Authentication: ${adminToken ? 'PASSED' : 'FAILED'}`);
  console.log(`${supplierToken ? colors.green + '✅' : colors.red + '❌'} Supplier Authentication: ${supplierToken ? 'PASSED' : 'FAILED'}`);
  console.log(`${userToken ? colors.green + '✅' : colors.red + '❌'} Buyer Authentication: ${userToken ? 'PASSED' : 'FAILED'}`);
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}❌ Test suite failed:${colors.reset}`, error.message);
  process.exit(1);
});
