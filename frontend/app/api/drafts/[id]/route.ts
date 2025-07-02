import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const draftId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const { data: draft, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching draft:', error);
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Draft API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, draftData } = body;
    const draftId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    if (!draftData) {
      return NextResponse.json({ error: 'Draft data is required' }, { status: 400 });
    }

    const { data: updatedDraft, error } = await supabase
      .from('drafts')
      .update({
        data: draftData,
        updated_at: new Date().toISOString()
      })
      .eq('id', draftId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating draft:', error);
      return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
    }

    return NextResponse.json({ draft: updatedDraft });
  } catch (error) {
    console.error('Draft API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const draftId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting draft:', error);
      return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Draft API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 