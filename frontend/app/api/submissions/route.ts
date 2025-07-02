import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'list';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'list':
        const { data: submissions, error: listError } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('Error fetching submissions:', listError);
          return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
        }

        return NextResponse.json({ submissions });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Submissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, submissionData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!submissionData) {
      return NextResponse.json({ error: 'Submission data is required' }, { status: 400 });
    }

    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        data: submissionData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Submissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 