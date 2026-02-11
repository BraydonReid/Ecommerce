import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmissionsMetrics {
  totalCO2e: number;
  shippingCO2e: number;
  packagingCO2e: number;
  orderCount: number;
  period: string;
  topEmittingProducts?: Array<{
    name: string;
    emissions: number;
  }>;
  monthOverMonthChange?: number;
}

/**
 * Generate AI insights and recommendations based on emissions data
 */
export async function generateAIInsights(
  metrics: EmissionsMetrics
): Promise<{ summary: string; recommendations: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: 'AI insights are not available. Please configure OpenAI API key.',
      recommendations: 'Enable AI insights in your subscription plan.',
    };
  }

  try {
    const prompt = `You are an environmental sustainability analyst for e-commerce businesses.

Analyze the following carbon emissions data for an online store:

Period: ${metrics.period}
Total Orders: ${metrics.orderCount}
Total CO2 Emissions: ${metrics.totalCO2e.toFixed(2)} kg CO2e
- Shipping Emissions: ${metrics.shippingCO2e.toFixed(2)} kg CO2e (${((metrics.shippingCO2e / metrics.totalCO2e) * 100).toFixed(1)}%)
- Packaging Emissions: ${metrics.packagingCO2e.toFixed(2)} kg CO2e (${((metrics.packagingCO2e / metrics.totalCO2e) * 100).toFixed(1)}%)
${metrics.monthOverMonthChange ? `Month-over-month change: ${metrics.monthOverMonthChange > 0 ? '+' : ''}${metrics.monthOverMonthChange.toFixed(1)}%` : ''}

${metrics.topEmittingProducts ? `Top Emitting Products:\n${metrics.topEmittingProducts.map((p, i) => `${i + 1}. ${p.name}: ${p.emissions.toFixed(2)} kg CO2e`).join('\n')}` : ''}

Please provide:
1. A concise executive summary (2-3 sentences) highlighting the key insights
2. Three specific, actionable recommendations to reduce carbon emissions

Keep the tone professional but accessible. Focus on practical steps the merchant can take.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a sustainability consultant specializing in e-commerce carbon footprint reduction.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content || '';

    // Parse the response to separate summary and recommendations
    const parts = response.split(/\n\n(?=.*:)/);
    const summary =
      parts.find((p) => p.toLowerCase().includes('summary'))?.replace(/.*summary:?\s*/i, '') ||
      response.substring(0, 200);
    const recommendations =
      parts.find((p) => p.toLowerCase().includes('recommendation'))?.replace(/.*recommendations?:?\s*/i, '') ||
      'Consider reviewing your shipping methods and packaging choices.';

    return {
      summary: summary.trim(),
      recommendations: recommendations.trim(),
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      summary: 'Unable to generate AI insights at this time.',
      recommendations: 'Please try again later or contact support.',
    };
  }
}
