import { NextRequest, NextResponse } from 'next/server';
import { fetchProductFromOpenFoodFacts, ProductResult } from '@/lib/open-food-facts-shared';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ barcode: string }> }
) {
    const { barcode } = await params;
    const searchParams = request.nextUrl.searchParams;
    const allergies = searchParams.get('allergies')?.split(',') || [];

    let result: ProductResult;
    let openfoodError: string | undefined;
    let usdaError: string | undefined;

    // 1. Try OpenFoodFacts
    try {
        result = await fetchProductFromOpenFoodFacts(barcode, allergies);
        console.log("PERRO", result)
        
        if (result.name !== "Unknown Product" && result.name !== "Error") {
            (result as ProductResult & { source?: string }).source = "openfooddata";
        }
        
        // If it's a "failure" from OpenFoodFacts but it returned a result object, 
        // we might want to try USDA.
        if (result.name === "Unknown Product" || result.name === "Error") {
            console.log('error test', result)
            openfoodError = result.error;
        }
    } catch (error) {
        openfoodError = error instanceof Error ? error.message : "OpenFoodFacts Network Error";
        result = {
            name: "Error",
            brand: "Error",
            isSafe: false,
            allergensFound: [],
            error: "I can't find that product. Ask a grown-up for help",
        };
    }

    // 2. If OpenFoodFacts failed/no product, try USDA
    if (result.name === "Unknown Product" || result.name === "Error") {
        console.log("asado: Triggering USDA search for barcode:", barcode);
        try {
            const apiKey = process.env.USDA_API_KEY || '';
            const usdaPayload = {
                query: barcode,
                dataType: [],
            };
            console.log("asado: Sending USDA request with body:", JSON.stringify(usdaPayload));
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usdaPayload),
            });

            console.log(`asado: USDA response status: ${response.status}`);

            if (!response.ok) {
                if (response.status === 403) {
                    const errorData = await response.json().catch(() => ({}));
                    usdaError = errorData.error?.message || "Invalid USDA API Key";
                } else if (response.status === 404) {
                    usdaError = "Product not found";
                } else if (response.status === 400) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        try {
                            const errorData = await response.json();
                            usdaError = typeof errorData === 'string' ? errorData : errorData.message;
                        } catch {
                            usdaError = "Bad Request";
                        }
                    } else {
                        usdaError = await response.text();
                    }
                } else {
                    usdaError = `USDA Error: ${response.statusText}`;
                }
                throw new Error(usdaError);
            }

            const usdaData = await response.json();
            console.log("asado: USDA response data:", JSON.stringify(usdaData));
            if (usdaData && usdaData.foods && usdaData.foods.length > 0) {
                const food = usdaData.foods[0];
                result = {
                    name: food.description || "Unknown Product",
                    brand: food.brandName || "Unknown Brand",
                    isSafe: true,
                    allergensFound: [],
                    error: undefined,
                    openfoodError,
                    usdaError: undefined,
                    source: "usda"
                };
            } else {
                usdaError = "USDA returned no results";
            }
        } catch (error) {
            if (!usdaError) {
                usdaError = error instanceof Error ? error.message : "USDA Service Error";
            }
            console.log("asado: USDA catch block error:", usdaError);
        }
    }

    // Final check: if still no result found, return the final error message
    if (result.name === "Error" || result.name === "Unknown Product") {
        return NextResponse.json({
            name: "Unknown Product",
            brand: "Unknown",
            isSafe: true,
            allergensFound: [],
            error: result.error || "I can't find that product. Ask a grown-up for help",
            openfoodError,
            usdaError,
            source: "none"
        });
    }

    return NextResponse.json(result);
}
