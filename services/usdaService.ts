export interface USDAConfig {
  apiKey: string;
}

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function searchFood(config: USDAConfig, query: string, dataType: string[]): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/foods/search?api_key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        dataType,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getFoodDetails(config: USDAConfig, fdcId: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${config.apiKey}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
