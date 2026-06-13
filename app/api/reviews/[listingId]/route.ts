import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const formData = await req.formData();

    const author_name = formData.get('author_name') as string;
    const rating = parseInt(formData.get('rating') as string, 10);
    const title = formData.get('title') as string | null;
    const body = formData.get('body') as string | null;

    if (!author_name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const { error } = await supabase.from('reviews').insert({
      listing_id: listingId,
      author_name,
      rating,
      title: title || null,
      body: body || null,
      is_approved: false,
    });

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Redirect back to the listing page with a success message
    const referer = req.headers.get('referer') || '/';
    const redirectUrl = `${referer}?review=submitted`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
