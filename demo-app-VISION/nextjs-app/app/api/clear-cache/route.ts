import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, value } = body;

    let clearedCount = 0;
    let message = '';

    switch (type) {
      case 'all':
        clearedCount = db.clearAllAnalyses();
        message = `Cleared all ${clearedCount} analyses from server database`;
        break;

      case 'old':
        const days = parseInt(value) || 7;
        clearedCount = db.clearOldAnalyses(days);
        message = `Cleared ${clearedCount} analyses older than ${days} days from server database`;
        break;

      case 'cuisine':
        if (!value) {
          return NextResponse.json({ error: 'Cuisine type required' }, { status: 400 });
        }
        clearedCount = db.clearAnalysesByCuisine(value);
        message = `Cleared ${clearedCount} ${value} analyses from server database`;
        break;

      case 'calories':
        const threshold = parseInt(value);
        if (isNaN(threshold)) {
          return NextResponse.json({ error: 'Valid calorie threshold required' }, { status: 400 });
        }
        clearedCount = db.clearAnalysesByCalories(threshold);
        message = `Cleared ${clearedCount} high-calorie analyses from server database`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid clear type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      clearedCount,
      message
    });

  } catch (error: any) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to get database statistics
export async function GET() {
  try {
    const stats = db.getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
