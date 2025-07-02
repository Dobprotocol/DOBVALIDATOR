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
        const { data: drafts, error: listError } = await supabase
          .from('drafts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('Error fetching drafts:', listError);
          return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
        }

        return NextResponse.json({ drafts });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, draftData, draftId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'create':
        if (!draftData) {
          return NextResponse.json({ error: 'Draft data is required' }, { status: 400 });
        }

        const { data: newDraft, error: createError } = await supabase
          .from('drafts')
          .insert({
            user_id: userId,
            data: draftData,
            status: 'draft'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating draft:', createError);
          return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
        }

        return NextResponse.json({ draft: newDraft });

      case 'update':
        if (!draftId || !draftData) {
          return NextResponse.json({ error: 'Draft ID and data are required' }, { status: 400 });
        }

        const { data: updatedDraft, error: updateError } = await supabase
          .from('drafts')
          .update({
            data: draftData,
            updated_at: new Date().toISOString()
          })
          .eq('id', draftId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating draft:', updateError);
          return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
        }

        return NextResponse.json({ draft: updatedDraft });

      case 'submit':
        if (!draftId) {
          return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        // First get the draft data
        const { data: draftToSubmit, error: fetchError } = await supabase
          .from('drafts')
          .select('*')
          .eq('id', draftId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !draftToSubmit) {
          console.error('Error fetching draft for submission:', fetchError);
          return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        // Create submission from draft
        const { data: submission, error: submitError } = await supabase
          .from('submissions')
          .insert({
            user_id: userId,
            data: draftToSubmit.data,
            status: 'pending'
          })
          .select()
          .single();

        if (submitError) {
          console.error('Error creating submission:', submitError);
          return NextResponse.json({ error: 'Failed to submit draft' }, { status: 500 });
        }

        // Delete the draft after successful submission
        const { error: deleteError } = await supabase
          .from('drafts')
          .delete()
          .eq('id', draftId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting draft after submission:', deleteError);
          // Don't fail the request if deletion fails
        }

        return NextResponse.json({ submission });

      case 'delete':
        if (!draftId) {
          return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        const { error: deleteDraftError } = await supabase
          .from('drafts')
          .delete()
          .eq('id', draftId)
          .eq('user_id', userId);

        if (deleteDraftError) {
          console.error('Error deleting draft:', deleteDraftError);
          return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Draft deleted successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 