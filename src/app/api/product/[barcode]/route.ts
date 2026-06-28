import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ barcode: string }> }
) {
    const { barcode } = await params;
    const searchParams = request.nextUrl.searchParams;
    const allergies = searchParams.get('allergies')?.split(',') || [];

    try {
        // Removed unused imports of ProductResult, OpenFoodFactsResponse and logError
        const response = await fetch(`https://world.openfoodfacts.org/api/v3.6/product/${barcode}`, {
            headers: {
                'User-Agent': process.env.NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT || 'AllergyScout/1.0 (contact@example.com)'
            }
        });

        if (!response.ok) {
            throw new Error("Network error");
        }

        const data = await response.json();
        const product = data.product;

        if (data.status === "failure" || !product) {
            return NextResponse.json({
                name: "Unknown Product",
                brand: "Unknown",
                isSafe: true,
                allergensFound: [],
                error: "I can't find that product. Ask a grown-up for help",
            });
        }

        const productName = product.product_name || "Unknown Product";
        const brandName = product.brands || "Unknown Brand";
        const foundAllergens: string[] = [];
        const labeledText = product.allergens_lc || "";
        const ingredientsText = product.ingredients_text || "";
        const rawAllergensText = product.allergens || "";
        const textToScan = `${labeledText} ${ingredientsText} ${rawAllergensText}`.toLowerCase();

        for (const allergy of allergies) {
            if (textToScan.includes(allergy.toLowerCase())) {
                foundAllergens.push(allergy);
            }
        }

        return NextResponse.json({
            name: productName,
            brand: brandName,
            isSafe: foundAllergens.length === 0,
            allergensFound: foundAllergens,
        });
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
