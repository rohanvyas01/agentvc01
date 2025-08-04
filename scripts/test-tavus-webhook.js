#!/usr/bin/env node

/**
 * Test script for Tavus Webhook functionality
 * This script tests the webhook endpoint with various payloads
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:54321/functions/v1/tavus-webhook';

// Mock webhook payloads
const testPayloads = {
  conversationStarted: {
    event_type: 'conversation.started',
    conversation_id: 'test-conversation-123',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    data: {
      started_at: new Date().toISOString()
    }
  },
  
  transcriptUpdate: {
    event_type: 'conversation.transcript',
    conversation_id: 'test-conversation-123',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    data: {
      speaker: 'user',
      content: 'Hello, I would like to pitch my startup idea to you.',
      timestamp_ms: 1500,
      segment_id: 'segment-001',
      confidence: 0.95,
      is_final: true
    }
  },
  
  conversationEnded: {
    event_type: 'conversation.ended',
    conversation_id: 'test-conversation-123',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    data: {
      duration_seconds: 300,
      end_reason: 'completed'
    }
  },
  
  conversationError: {
    event_type: 'conversation.error',
    conversation_id: 'test-conversation-123',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    data: {
      error_type: 'connection_failed',
      message: 'Connection to Tavus service failed',
      code: 'TAVUS_CONNECTION_ERROR'
    }
  }
};

async function testWebhook(eventName, payload) {
  console.log(`\n🧪 Testing ${eventName}...`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, responseData);
    
    if (response.status === 200 && responseData.success) {
      console.log(`✅ ${eventName} test passed`);
      return true;
    } else {
      console.log(`❌ ${eventName} test failed`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ${eventName} test error:`, error.message);
    return false;
  }
}

async function testInvalidPayload() {
  console.log(`\n🧪 Testing invalid payload...`);
  
  const invalidPayload = {
    event_type: 'conversation.started',
    // Missing conversation_id
    timestamp: Math.floor(Date.now() / 1000).toString(),
    data: {}
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload)
    });
    
    const responseData = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, responseData);
    
    if (response.status >= 400 && !responseData.success) {
      console.log(`✅ Invalid payload rejection test passed`);
      return true;
    } else {
      console.log(`❌ Invalid payload should have been rejected`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Invalid payload test error:`, error.message);
    return false;
  }
}

async function testCorsOptions() {
  console.log(`\n🧪 Testing CORS OPTIONS...`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tavus.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`CORS Headers:`, {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });
    
    if (response.status === 200) {
      console.log(`✅ CORS OPTIONS test passed`);
      return true;
    } else {
      console.log(`❌ CORS OPTIONS test failed`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ CORS OPTIONS test error:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Tavus Webhook Tests');
  console.log(`Testing webhook at: ${WEBHOOK_URL}`);
  console.log('Note: These tests will fail if no test session exists in the database');
  
  const results = [];
  
  // Test CORS first
  results.push(await testCorsOptions());
  
  // Test all webhook events
  for (const [eventName, payload] of Object.entries(testPayloads)) {
    results.push(await testWebhook(eventName, payload));
  }
  
  // Test invalid payload handling
  results.push(await testInvalidPayload());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  testWebhook,
  testInvalidPayload,
  testCorsOptions,
  runAllTests
};