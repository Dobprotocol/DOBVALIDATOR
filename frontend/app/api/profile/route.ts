import { NextResponse } from 'next/server';

// TODO: Replace with actual database implementation
const profiles = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return new NextResponse('Missing wallet address', { status: 400 });
  }

  const profile = profiles.get(address);
  if (!profile) {
    return new NextResponse('Profile not found', { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, name, company, email } = body;

    if (!walletAddress || !name || !company || !email) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // TODO: Add proper validation and sanitization
    // TODO: Add encryption for sensitive data
    // TODO: Implement actual database storage

    const profile = {
      walletAddress,
      name,
      company,
      email,
      createdAt: new Date().toISOString(),
    };

    profiles.set(walletAddress, profile);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 