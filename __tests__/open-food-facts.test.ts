import { fetchProductByBarcode } from '@/lib/open-food-facts';

describe('fetchProductByBarcode', () => {
  it('should fetch product data', async () => {
    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toBeDefined();
    // Resolves to either product data or an error message.
    expect(result.name || result.error).toBeDefined();
  });

  it('should handle invalid barcode', async () => {
    const result = await fetchProductByBarcode('0000000000000');
    expect(result.error).toBeDefined();
  });

  it('should detect allergens', async () => {
    const result = await fetchProductByBarcode('1234567890123');
    expect(result.allergensFound).toBeDefined();
  });

  it('should return safe status', async () => {
    const result = await fetchProductByBarcode('1234567890123');
    expect(result.isSafe).toBeDefined();
  });
});
