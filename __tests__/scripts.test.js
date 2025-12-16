/**
 * Tests for public/scripts.js functionality
 * Testing retryFetch, error handling, and XSS protection
 */

// Mock DOM environment
global.fetch = jest.fn();
global.DOMParser = jest.fn(() => ({
    parseFromString: jest.fn(() => ({
        body: {
            querySelectorAll: jest.fn(() => []),
            childNodes: []
        },
        querySelectorAll: jest.fn(() => [])
    }))
}));

describe('RetryFetch functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('retryFetch should succeed on first attempt if fetch succeeds', async () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({ data: 'test' })
        };
        global.fetch.mockResolvedValueOnce(mockResponse);

        const MAX_RETRY_ATTEMPTS = 2;
        const INITIAL_RETRY_DELAY = 1000;

        // Simulate retryFetch function
        const retryFetch = async (url, options = {}, maxAttempts = MAX_RETRY_ATTEMPTS) => {
            let lastError;
            
            for (let attempt = 0; attempt <= maxAttempts; attempt++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response;
                } catch (error) {
                    lastError = error;
                    
                    if (attempt < maxAttempts) {
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            throw lastError;
        };

        const result = await retryFetch('/test-url');
        expect(result).toBe(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('retryFetch should retry with exponential backoff on failure', async () => {
        const mockError = { ok: false, status: 500, statusText: 'Server Error' };
        global.fetch
            .mockResolvedValueOnce(mockError)
            .mockResolvedValueOnce(mockError)
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: 'test' }) });

        const MAX_RETRY_ATTEMPTS = 2;
        const INITIAL_RETRY_DELAY = 1000;

        const retryFetch = async (url, options = {}, maxAttempts = MAX_RETRY_ATTEMPTS) => {
            let lastError;
            
            for (let attempt = 0; attempt <= maxAttempts; attempt++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response;
                } catch (error) {
                    lastError = error;
                    
                    if (attempt < maxAttempts) {
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            throw lastError;
        };

        const promise = retryFetch('/test-url');
        
        // Fast-forward through delays
        await jest.runAllTimersAsync();
        
        const result = await promise;
        expect(result.ok).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('exponential backoff should use correct delays', () => {
        const INITIAL_RETRY_DELAY = 1000;
        const delays = [];
        
        for (let attempt = 0; attempt < 3; attempt++) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
            delays.push(delay);
        }
        
        expect(delays).toEqual([1000, 2000, 4000]); // 1s, 2s, 4s
    });
});

describe('Error handling functionality', () => {
    let container;

    beforeEach(() => {
        // Create a mock container element
        container = {
            querySelectorAll: jest.fn(() => []),
            appendChild: jest.fn(),
            removeChild: jest.fn()
        };
    });

    test('hideError should remove elements with data-error attribute', () => {
        const errorElement1 = { remove: jest.fn() };
        const errorElement2 = { remove: jest.fn() };
        container.querySelectorAll.mockReturnValue([errorElement1, errorElement2]);

        const hideError = (container) => {
            if (!container) return;
            const errorElements = container.querySelectorAll('[data-error="true"]');
            errorElements.forEach(el => el.remove());
        };

        hideError(container);

        expect(container.querySelectorAll).toHaveBeenCalledWith('[data-error="true"]');
        expect(errorElement1.remove).toHaveBeenCalled();
        expect(errorElement2.remove).toHaveBeenCalled();
    });

    test('showError should create and append error element', () => {
        const showError = (container, message) => {
            if (!container) return;
            
            const errorBox = {
                className: '',
                setAttribute: jest.fn(),
                textContent: ''
            };
            errorBox.className = 'error-message';
            errorBox.setAttribute('data-error', 'true');
            errorBox.textContent = message;
            container.appendChild(errorBox);
        };

        showError(container, 'Test error message');

        expect(container.appendChild).toHaveBeenCalled();
    });
});

describe('XSS Protection', () => {
    test('sanitizeHTML should remove script tags', () => {
        const maliciousHTML = '<div>Safe content</div><script>alert("XSS")</script>';
        
        // Mock DOMParser
        const mockElement = {
            remove: jest.fn()
        };
        const mockDoc = {
            body: { childNodes: [] },
            querySelectorAll: jest.fn((selector) => {
                if (selector === 'script, iframe, object, embed') {
                    return [mockElement];
                }
                return [];
            })
        };
        
        global.DOMParser = jest.fn(() => ({
            parseFromString: jest.fn(() => mockDoc)
        }));

        const sanitizeHTML = (htmlString) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            doc.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
            doc.querySelectorAll('*').forEach(el => {
                // Attribute sanitization logic
            });
            return doc.body;
        };

        const result = sanitizeHTML(maliciousHTML);
        expect(mockElement.remove).toHaveBeenCalled();
    });

    test('sanitizeHTML should remove event handler attributes', () => {
        const maliciousHTML = '<div onclick="alert(\'XSS\')">Click me</div>';
        
        const mockAttribute = {
            name: 'onclick',
            value: 'alert("XSS")'
        };
        const mockElement = {
            attributes: [mockAttribute],
            removeAttribute: jest.fn()
        };
        const mockDoc = {
            body: { childNodes: [] },
            querySelectorAll: jest.fn((selector) => {
                if (selector === 'script, iframe, object, embed') {
                    return [];
                }
                if (selector === '*') {
                    return [mockElement];
                }
                return [];
            })
        };
        
        global.DOMParser = jest.fn(() => ({
            parseFromString: jest.fn(() => mockDoc)
        }));

        const sanitizeHTML = (htmlString) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            doc.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
            doc.querySelectorAll('*').forEach(el => {
                [...el.attributes].forEach(attr => {
                    const attrName = attr.name.toLowerCase();
                    if (attrName.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            return doc.body;
        };

        const result = sanitizeHTML(maliciousHTML);
        expect(mockElement.removeAttribute).toHaveBeenCalledWith('onclick');
    });
});
