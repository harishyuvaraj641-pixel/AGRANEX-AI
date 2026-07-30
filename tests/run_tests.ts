import path from 'path';

// Define the global test environment
const tests: { name: string; fn: () => Promise<void> | void }[] = [];
let currentSuite = '';

(globalThis as any).describe = (name: string, fn: () => void) => {
  currentSuite = name;
  fn();
};

(globalThis as any).test = (name: string, fn: () => Promise<void> | void) => {
  tests.push({ name: `${currentSuite} > ${name}`, fn });
};

(globalThis as any).fail = (message: string) => {
  throw new Error(message);
};

(globalThis as any).expect = (actual: any) => {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toContain: (expected: string) => {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan: (expected: number) => {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan: (expected: number) => {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined, but it was undefined`);
      }
    }
  };
};

async function run() {
  console.log('🚀 Starting AGRANEX AI Custom Integration Test Runner...\n');
  
  // Import the test file
  require('./unit_integration_tests.spec');

  let passed = 0;
  let failed = 0;

  for (const testItem of tests) {
    try {
      console.log(`⏳ Running: ${testItem.name}`);
      await testItem.fn();
      console.log(`✅ Passed: ${testItem.name}\n`);
      passed++;
    } catch (err: any) {
      console.error(`❌ Failed: ${testItem.name}`);
      console.error(`   Error: ${err.message || err}\n`);
      failed++;
    }
  }

  console.log('--------------------------------------------------');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('--------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
