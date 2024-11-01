import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
});

export const analyzeImage = async (base64Image: string) => {
  try {
    const prompt = `Analyze this receipt image and extract all food items with their quantities. Format the response as a JSON array with objects containing 'name' (normalized product name), 'quantity', and 'unit'. Only include food items. If the image is not a food receipt, return an error message. The response should look like: [{"name": "apple", "quantity": 1, "unit": "kg"}]`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image",
              image: base64Image
            }
          ]
        }
      ],
      model: "mixtral-8x7b-32768",
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};