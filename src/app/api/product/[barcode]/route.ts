import { NextRequest, NextResponse } from 'next/server';
import { fetchProductFromOpenFoodFacts, ProductResult, OpenFoodFactsResponse } from '@/lib/open-food-facts-shared';
import { logError } from '@/lib/errorHandling';

export async function GET(
    request: NextRequest,
    { params }: { params: { barcode: string } }
) {
    const barcode = params.barcode;
    const searchParams = request.nextUrl.searchParams;
    const allergies = searchParams.get('allergies')?.split(',') || [];

    try {
        const result = await fetchProductFromOpenFoodFacts(barcode, allergies);
        return NextResponse.json(result);
    } catch (error) {
        console.error(`Error fetching product ${barcode}:`, error);
        return NextResponse.json({
            name: "Error",
            brand: "Error",
            isSafe: false,
            allergensFound: [],
            error: "I can't find that product. Ask a grown-up for help",
        }, { status: 500 });
    }
}
