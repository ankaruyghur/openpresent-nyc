import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION || 'us-east-1'
});

async function validateAWSConnection() {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        return true;
    } catch (error) {
        return false;
    }
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
    try {

        // Extract request data
        const body = await request.json();
        const { auth_token, metadata = {} } = body;

        // Quick & dirty token validation
        // TODO: Build up token robustness later
        const validTokens = process.env.PHOTOBOOTH_TOKENS?.split(',') || [];

        if (!auth_token || !validTokens.includes(auth_token)) {
            return NextResponse.json(
                { error: 'Invalid or missing auth token' },
                { status: 401 }
            );
        }

        // Validate aws creds
        const isAWSValid = await validateAWSConnection();
        if (!isAWSValid) {
            return NextResponse.json(
                { error: 'AWS config invalid' },
                { status: 500}
            )
        }

        // Generate unique photo ID
        const photoId = randomUUID();
        const timestamp = new Date().toISOString().split('T')[0]; // YYY-MM-DD
        const brandDir = (metadata.brand || '').trim() || 'OpenPresentTest';
        const session = (metadata.session || '').trim() || `${brandDir}-session`;
        const sanitizedBrand = brandDir.replace(/[^\w-]/g, '_');
        const sanitizedSession = session.replace(/[^\w-]/g, '_');
        const s3Key = `photobooth/${sanitizedBrand}/${sanitizedSession}/${timestamp}/${photoId}.jpg`;

        // Create presigned URL for upload
        const putCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ContentType: 'image/jpeg',
        })

        const uploadUrl = await getSignedUrl(s3Client, putCommand, {
            expiresIn: 600, // 10 minutes
        });

        return NextResponse.json({
            success: true,
            photoId,
            uploadUrl,
            expiresIn:600
        })

    } catch (error) {

        return NextResponse.json(
            { error: 'Request failed' },
            { status: 500}
        );
    }
}