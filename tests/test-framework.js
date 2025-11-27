/**
 * test-framework.js
 * Simple zero-dependency test framework
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.currentSuite = null;
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Define a test suite
     * @param {string} name - Suite name
     * @param {Function} fn - Suite function
     */
    describe(name, fn) {
        this.currentSuite = name;
        fn();
        this.currentSuite = null;
    }

    /**
     * Define a test
     * @param {string} description - Test description
     * @param {Function} fn - Test function
     */
    it(description, fn) {
        this.tests.push({
            suite: this.currentSuite,
            description,
            fn
        });
    }

    /**
     * Run all tests
     * @returns {Object} Test results
     */
    async run() {
        console.log('🧪 Running tests...\n');
        this.results = { passed: 0, failed: 0, total: 0 };

        for (const test of this.tests) {
            this.results.total++;
            const fullName = test.suite ? `${test.suite} > ${test.description}` : test.description;

            try {
                await test.fn();
                this.results.passed++;
                console.log(`✓ ${fullName}`);
            } catch (error) {
                this.results.failed++;
                console.error(`✗ ${fullName}`);
                console.error(`  ${error.message}`);
                if (error.stack) {
                    console.error(`  ${error.stack.split('\n')[1]}`);
                }
            }
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`Total: ${this.results.total} | Passed: ${this.results.passed} | Failed: ${this.results.failed}`);

        if (this.results.failed === 0) {
            console.log('✅ All tests passed!');
        } else {
            console.log(`❌ ${this.results.failed} test(s) failed`);
        }

        return this.results;
    }
}

/**
 * Assertion functions
 */
const assert = {
    equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} but got ${actual}`);
        }
    },

    notEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(message || `Expected ${actual} to not equal ${expected}`);
        }
    },

    strictEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} (${typeof expected}) but got ${actual} (${typeof actual})`);
        }
    },

    deepEqual(actual, expected, message = '') {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new Error(message || `Expected ${expectedStr} but got ${actualStr}`);
        }
    },

    ok(value, message = '') {
        if (!value) {
            throw new Error(message || `Expected truthy value but got ${value}`);
        }
    },

    notOk(value, message = '') {
        if (value) {
            throw new Error(message || `Expected falsy value but got ${value}`);
        }
    },

    throws(fn, expectedError, message = '') {
        try {
            fn();
            throw new Error(message || 'Expected function to throw an error');
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(message || `Expected ${expectedError.name} but got ${error.constructor.name}`);
            }
        }
    },

    async rejects(promise, expectedError, message = '') {
        try {
            await promise;
            throw new Error(message || 'Expected promise to reject');
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(message || `Expected ${expectedError.name} but got ${error.constructor.name}`);
            }
        }
    },

    isArray(value, message = '') {
        if (!Array.isArray(value)) {
            throw new Error(message || `Expected array but got ${typeof value}`);
        }
    },

    isNull(value, message = '') {
        if (value !== null) {
            throw new Error(message || `Expected null but got ${value}`);
        }
    },

    isNotNull(value, message = '') {
        if (value === null) {
            throw new Error(message || 'Expected non-null value');
        }
    },

    isUndefined(value, message = '') {
        if (value !== undefined) {
            throw new Error(message || `Expected undefined but got ${value}`);
        }
    },

    isDefined(value, message = '') {
        if (value === undefined) {
            throw new Error(message || 'Expected defined value');
        }
    },

    includes(array, value, message = '') {
        if (!array.includes(value)) {
            throw new Error(message || `Expected array to include ${value}`);
        }
    },

    notIncludes(array, value, message = '') {
        if (array.includes(value)) {
            throw new Error(message || `Expected array to not include ${value}`);
        }
    },

    lengthOf(array, length, message = '') {
        if (array.length !== length) {
            throw new Error(message || `Expected length ${length} but got ${array.length}`);
        }
    }
};

// Create global test instance
const test = new TestFramework();
const { describe, it } = test;

// Export for use in tests
export { test, describe, it, assert };
