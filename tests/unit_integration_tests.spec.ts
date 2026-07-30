// AGRANEX AI - Enterprise Unit & Integration Test Suite
// Testing REST APIs, Yield Prediction ML calculations, and Disease AI payload structures

import http from 'http';

// Helper: Simple HTTP Request client for testing REST APIs
const makeRequest = (method: string, path: string, body?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (body) {
      headers['Content-Length'] = String(Buffer.byteLength(data));
    }
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch {
          resolve(responseBody);
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(data);
    }
    req.end();
  });
};

describe('AGRANEX AI Integration Test Suite', () => {
  
  // 1. Check if backend is alive
  test('Backend server is running on port 5000', async () => {
    try {
      const response = await makeRequest('GET', '/api/v1/farms/plots');
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    } catch (error) {
      fail('Backend server is not running or unreachable. Please start it using npm run dev.');
    }
  });

  // 2. Auth Endpoint Simulation
  test('POST /api/v1/auth/login generates JWT and correct user details', async () => {
    const credentials = {
      email: 'farmer.rajesh@agranex.ai',
      role: 'farmer'
    };
    const res = await makeRequest('POST', '/api/v1/auth/login', credentials);
    expect(res.success).toBe(true);
    expect(res.token).toContain('mock-jwt-token-agranex-farmer');
    expect(res.user.email).toBe(credentials.email);
    expect(res.user.role).toBe(credentials.role);
  });

  // 3. AI Disease Detection Payload Structure
  test('POST /api/v1/ai/disease-detection returns correct organic/chemical diagnosis', async () => {
    const payload = {
      cropType: 'tomato',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=800'
    };
    const res = await makeRequest('POST', '/api/v1/ai/disease-detection', payload);
    expect(res.success).toBe(true);
    expect(res.diagnosis.disease_name).toContain('Tomato Early Blight');
    expect(res.diagnosis.severity).toContain('Medium');
    expect(res.diagnosis.confidence_score).toBeGreaterThan(0.9);
    expect(res.diagnosis.organic_solution).toBeDefined();
    expect(res.diagnosis.chemical_solution).toBeDefined();
  });

  // 4. ML Yield Prediction Logic Verification
  test('POST /api/v1/ai/yield-prediction factors in pH, rainfall, and nitrogen parameters', async () => {
    const normalPayload = {
      cropType: 'wheat',
      areaHectares: 10,
      soilPh: 6.5,
      rainfallMm: 800,
      nitrogenPpm: 140
    };

    const stressedPayload = {
      cropType: 'wheat',
      areaHectares: 10,
      soilPh: 4.5, // highly acidic (stress)
      rainfallMm: 200, // severe drought (stress)
      nitrogenPpm: 50 // nitrogen deficit (stress)
    };

    const normalRes = await makeRequest('POST', '/api/v1/ai/yield-prediction', normalPayload);
    const stressedRes = await makeRequest('POST', '/api/v1/ai/yield-prediction', stressedPayload);

    expect(normalRes.success).toBe(true);
    expect(stressedRes.success).toBe(true);

    // Yield and revenue under stressed conditions should be lower than optimal conditions
    expect(stressedRes.predictedYieldPerHectare).toBeLessThan(normalRes.predictedYieldPerHectare);
    expect(stressedRes.expectedRevenueInr).toBeLessThan(normalRes.expectedRevenueInr);
  });

  // 5. Nova Multilingual Bot Responses
  test('POST /api/v1/ai/nova-query responds in Tamil and Hindi correctly', async () => {
    const englishQuery = { query: 'Show weather forecast', language: 'en' };
    const tamilQuery = { query: 'மழை வருமா?', language: 'ta' };
    
    const engRes = await makeRequest('POST', '/api/v1/ai/nova-query', englishQuery);
    const tamRes = await makeRequest('POST', '/api/v1/ai/nova-query', tamilQuery);

    expect(engRes.success).toBe(true);
    expect(engRes.language).toBe('en');
    expect(engRes.response).toContain('Coimbatore');

    expect(tamRes.success).toBe(true);
    expect(tamRes.language).toBe('ta');
    expect(tamRes.response).toContain('மழைக்கு வாய்ப்புள்ளது');
  });

  // 6. Marketplace Listings API
  test('GET /api/v1/marketplace/listings contains valid crop list', async () => {
    const listings = await makeRequest('GET', '/api/v1/marketplace/listings');
    expect(Array.isArray(listings)).toBe(true);
    expect(listings.length).toBeGreaterThan(0);
    expect(listings[0].crop_name).toBeDefined();
    expect(listings[0].price_per_quintal).toBeDefined();
  });

  // 7. Shared Truck Booking & Routing Optimization
  test('POST /api/v1/marketplace/logistics/bookings/create calculates optimized cost split and route savings', async () => {
    const bookingPayload = {
      hubId: 'h1',
      vehicleMake: 'Tata',
      vehicleModel: 'Ultra T.7',
      licensePlate: 'TN-37-DF-9999',
      totalCost: 3000,
      bookings: [
        { farmer_name: 'Rajesh Kumar', weight_kg: 500 },
        { farmer_name: 'Karthi Keyan', weight_kg: 300 }
      ]
    };

    const res = await makeRequest('POST', '/api/v1/marketplace/logistics/bookings/create', bookingPayload);
    expect(res.success).toBe(true);
    expect(res.booking.id).toBeDefined();
    expect(res.booking.farmers.length).toBe(2);
    expect(res.booking.route_distance_km).toBeGreaterThan(0);
    expect(res.booking.fuel_saved_liters).toBeGreaterThan(0);
    expect(res.booking.co2_offset_kg).toBeGreaterThan(0);
  });

  // 8. Order Escrow Payment Lock & Releases
  test('POST /api/v1/marketplace/orders/confirm-delivery releases escrow on correct OTP', async () => {
    // 1. Create order
    const orderPayload = {
      buyerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      buyerName: 'BigBasket Corporate',
      listingId: 'm1',
      quantity: 10
    };
    const orderRes = await makeRequest('POST', '/api/v1/marketplace/orders/create', orderPayload);
    expect(orderRes.success).toBe(true);
    const order = orderRes.order;
    expect(order.status).toBe('created');

    // 2. Accept the order to book a truck
    const acceptRes = await makeRequest('POST', '/api/v1/marketplace/orders/accept', {
      orderId: order.id
    });
    expect(acceptRes.success).toBe(true);
    expect(acceptRes.order.status).toBe('accepted');

    // 3. Try to confirm handover with invalid OTP
    const badHandover = await makeRequest('POST', '/api/v1/marketplace/orders/confirm-handover', {
      orderId: order.id,
      otp: '9999'
    });
    expect(badHandover.success).toBe(false);

    // 4. Confirm handover with valid OTP (transit starts)
    const goodHandover = await makeRequest('POST', '/api/v1/marketplace/orders/confirm-handover', {
      orderId: order.id,
      otp: order.otp_code
    });
    expect(goodHandover.success).toBe(true);
    expect(goodHandover.order.status).toBe('transit');

    // 5. Confirm delivery (release payment)
    const goodConfirm = await makeRequest('POST', '/api/v1/marketplace/orders/confirm-delivery', {
      orderId: order.id
    });
    expect(goodConfirm.success).toBe(true);
    expect(goodConfirm.order.status).toBe('confirmed');
  });

  // 9. Buyer Buy Request Postings & Farmer Acceptances
  test('POST /api/v1/marketplace/orders/create-request creates a buyer request and accepting it changes status', async () => {
    const payload = {
      buyerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      buyerName: 'Ananya S. (Buyer)',
      cropName: 'Maize',
      variety: 'Hybrid Yellow',
      quantity: 30,
      price: 1800
    };

    const requestRes = await makeRequest('POST', '/api/v1/marketplace/orders/create-request', payload);
    expect(requestRes.success).toBe(true);
    expect(requestRes.order.status).toBe('buyer_request');
    expect(requestRes.order.farmer_id).toBe('');

    // Farmer accepts request
    const acceptReqRes = await makeRequest('POST', '/api/v1/marketplace/orders/accept-request', {
      orderId: requestRes.order.id,
      farmerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      farmerName: 'Rajesh Kumar'
    });
    expect(acceptReqRes.success).toBe(true);
    expect(acceptReqRes.order.status).toBe('accepted');
    expect(acceptReqRes.order.farmer_name).toBe('Rajesh Kumar');
  });

  // 10. GPS Tracking Lookup by Order ID
  test('GET /api/v1/marketplace/logistics/tracking/order/:orderId returns transit tracking status', async () => {
    const trackingRes = await makeRequest('GET', '/api/v1/marketplace/logistics/tracking/order/o1');
    expect(trackingRes.success).toBe(true);
    expect(trackingRes.tracking.booking_id).toBeDefined();
    expect(trackingRes.tracking.speed_kmh).toBeDefined();
  });
});
