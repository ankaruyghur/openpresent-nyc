import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encodePhotoId, decodePhotoId } from './photo-id'

describe('Photo ID Encoding/Decoding', () => {
    beforeEach(() => {
        // Reset environment and mocks
        vi.clearAllMocks();
        process.env.PHOTO_ENCODE_KEY = 'test_encryption_key_123';
    });

    describe('encodePhotoId', () => {
        it('should generate encoded photo ID with valid inputs', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
            
            expect(encodedId).toBeDefined();
            expect(typeof encodedId).toBe('string');
            expect(encodedId.length).toBeGreaterThan(0);
            // Should be URL-safe base64url
            expect(encodedId).toMatch(/^[A-Za-z0-9_-]+$/);
        });

        it('should generate different IDs for different inputs', () => {
            const timestamp = '20241220143052';
            const id1 = encodePhotoId('brand1', 'session1', timestamp);
            const id2 = encodePhotoId('brand2', 'session2', timestamp);
            
            expect(id1).not.toBe(id2);
        });

        it('should generate different IDs each time (due to random IV)', () => {
            const timestamp = '20241220143052';
            const id1 = encodePhotoId('op_test', 'event_2024', timestamp);
            const id2 = encodePhotoId('op_test', 'event_2024', timestamp);
            
            // Same inputs but different IDs due to random IV
            expect(id1).not.toBe(id2);
        });

        it('should handle special characters in brand and session', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('brand-with_special.chars', 'session@2024!', timestamp);
            
            expect(encodedId).toBeDefined();
            expect(typeof encodedId).toBe('string');
        });

        it('should handle empty strings', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('', '', timestamp);
            
            expect(encodedId).toBeDefined();
            expect(typeof encodedId).toBe('string');
        });

        it('should handle different timestamp formats', () => {
            const timestamps = [
                '20241220143052',
                '20250101000000',
                '19991231235959'
            ];
            
            timestamps.forEach(timestamp => {
                const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
                expect(encodedId).toBeDefined();
                expect(typeof encodedId).toBe('string');
            });
        });

        it('should throw error when encryption key is missing', () => {
            delete process.env.PHOTO_ENCODE_KEY;
            
            expect(() => {
                encodePhotoId('op_test', 'event_2024', '20241220143052');
            }).toThrow();
        });
    });

    describe('decodePhotoId', () => {
        it('should decode encoded photo ID back to original data', () => {
            const brand = 'op_test';
            const session = 'event_2024';
            const timestamp = '20241220143052';
            
            const encodedId = encodePhotoId(brand, session, timestamp);
            const decoded = decodePhotoId(encodedId);
            
            expect(decoded.brand).toBe(brand);
            expect(decoded.session).toBe(session);
            expect(decoded.filename).toBe(timestamp);
            expect(decoded.timestampDir).toBe('2024-12-20');
        });

        it('should handle different brand/session combinations', () => {
            const testCases = [
                { brand: 'op_test', session: 'event_2024' },
                { brand: 'brand_name', session: 'session_123' },
                { brand: 'a', session: 'b' },
                { brand: 'very_long_brand_name_here', session: 'super_long_session_name_2024' }
            ];

            testCases.forEach(({ brand, session }) => {
                const timestamp = '20241220143052';
                const encodedId = encodePhotoId(brand, session, timestamp);
                const decoded = decodePhotoId(encodedId);
                
                expect(decoded.brand).toBe(brand);
                expect(decoded.session).toBe(session);
                expect(decoded.filename).toBe(timestamp);
                expect(decoded.timestampDir).toBe('2024-12-20');
            });
        });

        it('should handle special characters correctly', () => {
            const brand = 'brand-with_special.chars';
            const session = 'session@2024!';
            const timestamp = '20241220143052';
            
            const encodedId = encodePhotoId(brand, session, timestamp);
            const decoded = decodePhotoId(encodedId);
            
            expect(decoded.brand).toBe(brand);
            expect(decoded.session).toBe(session);
            expect(decoded.filename).toBe(timestamp);
        });

        it('should handle empty strings', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('', '', timestamp);
            const decoded = decodePhotoId(encodedId);
            
            expect(decoded.brand).toBe('');
            expect(decoded.session).toBe('');
            expect(decoded.filename).toBe(timestamp);
        });

        it('should correctly format different timestamp dates', () => {
            const testCases = [
                { timestamp: '20241220143052', expectedDir: '2024-12-20' },
                { timestamp: '20250101000000', expectedDir: '2025-01-01' },
                { timestamp: '19991231235959', expectedDir: '1999-12-31' },
                { timestamp: '20240229120000', expectedDir: '2024-02-29' } // Leap year
            ];

            testCases.forEach(({ timestamp, expectedDir }) => {
                const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
                const decoded = decodePhotoId(encodedId);
                
                expect(decoded.filename).toBe(timestamp);
                expect(decoded.timestampDir).toBe(expectedDir);
            });
        });

        it('should throw error for invalid encoded ID', () => {
            expect(() => {
                decodePhotoId('invalid_encoded_id');
            }).toThrow('Failed to decode photo ID - invalid or corrupted data');
        });

        it('should throw error for corrupted base64url', () => {
            expect(() => {
                decodePhotoId('not@valid#base64url!');
            }).toThrow('Failed to decode photo ID - invalid or corrupted data');
        });

        it('should throw error for too short encoded ID', () => {
            expect(() => {
                decodePhotoId('abc');
            }).toThrow('Failed to decode photo ID - invalid or corrupted data');
        });

        it('should throw error when encryption key is missing during decode', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
            delete process.env.PHOTO_ENCODE_KEY;
            
            expect(() => {
                decodePhotoId(encodedId);
            }).toThrow();
        });

        it('should fail when trying to decode with wrong key', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
            
            // Change the key
            process.env.PHOTO_ENCODE_KEY = 'different_key_123';
            
            expect(() => {
                decodePhotoId(encodedId);
            }).toThrow('Failed to decode photo ID - invalid or corrupted data');
        });
    });

    describe('Round-trip encoding/decoding', () => {
        it('should successfully encode and decode multiple times', () => {
            const brand = 'op_test';
            const session = 'event_2024';
            const timestamp1 = '20241220143052';
            const timestamp2 = '20241220143053';
            
            // First round
            const encoded1 = encodePhotoId(brand, session, timestamp1);
            const decoded1 = decodePhotoId(encoded1);
            
            expect(decoded1.brand).toBe(brand);
            expect(decoded1.session).toBe(session);
            expect(decoded1.filename).toBe(timestamp1);
            expect(decoded1.timestampDir).toBe('2024-12-20');
            
            // Second round with different timestamp
            const encoded2 = encodePhotoId(brand, session, timestamp2);
            const decoded2 = decodePhotoId(encoded2);
            
            expect(decoded2.brand).toBe(brand);
            expect(decoded2.session).toBe(session);
            expect(decoded2.filename).toBe(timestamp2);
            expect(decoded2.timestampDir).toBe('2024-12-20');
        });

        it('should handle different timestamps correctly', () => {
            const brand = 'op_test';
            const session = 'event_2024';
            
            const timestamps = [
                '20241220143052',
                '20241220143053', 
                '20241220143054'
            ];
            
            const results = timestamps.map(timestamp => {
                const encoded = encodePhotoId(brand, session, timestamp);
                return decodePhotoId(encoded);
            });
            
            expect(results[0].filename).toBe('20241220143052');
            expect(results[1].filename).toBe('20241220143053');
            expect(results[2].filename).toBe('20241220143054');
            
            // All should have same directory (same date)
            results.forEach(result => {
                expect(result.timestampDir).toBe('2024-12-20');
            });
        });

        it('should handle cross-date timestamps', () => {
            const brand = 'op_test';
            const session = 'event_2024';
            
            const crossDateTests = [
                { timestamp: '20241220235959', expectedDir: '2024-12-20' },
                { timestamp: '20241221000000', expectedDir: '2024-12-21' },
                { timestamp: '20241231235959', expectedDir: '2024-12-31' },
                { timestamp: '20250101000000', expectedDir: '2025-01-01' }
            ];
            
            crossDateTests.forEach(({ timestamp, expectedDir }) => {
                const encoded = encodePhotoId(brand, session, timestamp);
                const decoded = decodePhotoId(encoded);
                
                expect(decoded.filename).toBe(timestamp);
                expect(decoded.timestampDir).toBe(expectedDir);
            });
        });
    });

    describe('URL length validation', () => {
        it('should generate reasonably short encoded IDs for QR codes', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
            
            // Should be around 64 characters or less for good QR code scanning
            expect(encodedId.length).toBeLessThanOrEqual(70);
            expect(encodedId.length).toBeGreaterThan(40);
        });

        it('should generate consistent length for similar inputs', () => {
            const timestamp = '20241220143052';
            const id1 = encodePhotoId('op_test', 'event_2024', timestamp);
            const id2 = encodePhotoId('brand_x', 'session_y', timestamp);
            
            // Should be similar lengths (within a few characters due to padding)
            expect(Math.abs(id1.length - id2.length)).toBeLessThanOrEqual(4);
        });

        it('should work well with shortened URL structure', () => {
            const timestamp = '20241220143052';
            const encodedId = encodePhotoId('op_test', 'event_2024', timestamp);
            
            // Full URL: openpresent.nyc/p/[encodedId]
            const baseUrl = 'openpresent.nyc/p/';
            const fullUrl = baseUrl + encodedId;
            
            // Should be reasonable for QR codes (under 100 chars total)
            expect(fullUrl.length).toBeLessThan(100);
            expect(fullUrl.length).toBeGreaterThan(50);
        });
    });
});