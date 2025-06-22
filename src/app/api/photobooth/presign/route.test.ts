import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the getSignedUrl function
vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn()
}))

import { mockClient } from 'aws-sdk-client-mock'
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Create AWS mock
const s3Mock = mockClient(S3Client);
const mockedGetSignedUrl = vi.mocked(getSignedUrl);

function createPresignedUrlRequest(body?: Record<string, any>): NextRequest {
    const defaultBody = {
        auth_token: 'valid_token',
        metadata: {
            brand: 'op_test',
            session: 'test_event'
        }
    };

    const finalBodyContent = { ...defaultBody, ...body };

    return new NextRequest('http://localhost:3000/api/photobooth/presign', {
        method: 'POST',
        body: JSON.stringify(finalBodyContent),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


describe('/api/photobooth/presign', () => {
    beforeEach(() => {
        // Reset all mocks before each test 
        s3Mock.reset();
        vi.clearAllMocks();

        // Set up env var for tests
        process.env.AWS_REGION = 'us-east-1';
        process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
        process.env.PHOTOBOOTH_TOKENS = 'valid_token,another_valid_token';
        process.env.PHOTO_ENCODE_KEY = 'test-secret-key-123';
    })

    it('should return presigned URL with valid token', async () => {
        // Mock successful AWS connection
        s3Mock.on(HeadBucketCommand).resolves({});

        // Mock presigned URL generation
        mockedGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/presigned-url-123');

        // Create test request 
        const request = createPresignedUrlRequest();

        // Call presign api
        const response = await POST(request);
        const data = await response.json();

        // Assertions
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.photoId).toBeDefined();
        expect(data.uploadUrl).toBe('https://test-bucket.s3.amazonaws.com/presigned-url-123');
        expect(data.expiresIn).toBe(600);

        // Verify getSignedUrl was called with correct S3 key
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.any(Object), // S3Client
            expect.objectContaining({
                input: expect.objectContaining({
                    Key: expect.stringMatching(/^photobooth\/op_test\/test_event\/\d{4}-\d{2}-\d{2}\/\d{14}\.jpg$/)
                })
            }),
            expect.any(Object) // options
        );
    })

    it('should reject invalid token', async () => {
        // Mock successful AWS connection
        s3Mock.on(HeadBucketCommand).resolves({});

        // Mock presigned URL generation
        mockedGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/presigned-url-123');

        // Create test request 
        const request = createPresignedUrlRequest({
            auth_token: 'invalid_token'
        });

        // Call presign api
        const response = await POST(request);
        const data = await response.json();

        // Assertions
        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid or missing auth token')
        expect(data.success).toBeUndefined();
        expect(data.photoId).toBeUndefined();
        expect(data.uploadUrl).toBeUndefined();

        // Verify AWS was never called (since auth failed first)
        expect(s3Mock.calls()).toHaveLength(0)
    })

    it('should return 500 when AWS connection is invalid', async () => {
        // Mock unsuccessful AWS connection
        s3Mock.on(HeadBucketCommand).rejects({
            name: 'NetworkingError',
            message: 'Connection timeout'
          });

        // Create test request 
        const request = createPresignedUrlRequest({});

        // Call presign api
        const response = await POST(request);
        const data = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(data.error).toBe('AWS config invalid')
        expect(data.success).toBeUndefined();
        expect(data.photoId).toBeUndefined();
        expect(data.uploadUrl).toBeUndefined();

        // Verify AWS was called just once for validation
        expect(s3Mock.calls()).toHaveLength(1)
    })
        

    it('should use default values when metadata is missing', async () => {
        // Mock successful AWS connection
        s3Mock.on(HeadBucketCommand).resolves({});

        // Mock presigned URL generation
        mockedGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/presigned-url-123');

        // Create test request 
        const request = createPresignedUrlRequest({
            metadata: {
                brand: '   '
            }
        });

        // Call presign api
        const response = await POST(request);
        const data = await response.json();

        // Assertions
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.photoId).toBeDefined();
        expect(data.uploadUrl).toBe('https://test-bucket.s3.amazonaws.com/presigned-url-123');
        expect(data.expiresIn).toBe(600);

        // Verify getSignedUrl was called with correct S3 key
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.any(Object), // S3Client
            expect.objectContaining({
                input: expect.objectContaining({
                    Key: expect.stringMatching(/^photobooth\/OpenPresentTest\/OpenPresentTest-session\/\d{4}-\d{2}-\d{2}\/\d{14}\.jpg$/)
                })
            }),
            expect.any(Object) // options
        );
    })
})