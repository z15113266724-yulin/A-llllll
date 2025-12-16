import { GoogleGenAI, Type } from "@google/genai";
import { ProductAnalysis, StyleOption } from "../types";

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("未设置 API_KEY 环境变量。");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeProductImage = async (file: File): Promise<ProductAnalysis> => {
  const ai = getClient();
  const base64Data = await fileToGenerativePart(file);

  const prompt = `
    Analyze this product image for Amazon A+ content creation.
    
    Output the result in JSON format with the following specifications:
    1. "productName": Identify the product name and type in Simplified Chinese (简体中文).
    2. "keyFeatures": List 3-4 visible key features (materials, color, design) in Simplified Chinese (简体中文).
    3. "visualDescription": A concise visual description of the object in English (to be used for image generation prompts).
    4. "suggestedStyles": Suggest 4 distinct, professional visual styles suitable for marketing this specific product on Amazon.
       - "id": unique id (e.g. 'style_1')
       - "name": Style name in Simplified Chinese (e.g., '简约现代', '户外探险').
       - "description": Short description of the vibe in Simplified Chinese.
       - "promptModifier": Descriptive keywords in English to append to a generation prompt (e.g., 'soft lighting, clean white background, podium').

    Return the result in JSON format with the following schema:
    {
      "productName": "string",
      "keyFeatures": ["string"],
      "visualDescription": "string",
      "suggestedStyles": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "promptModifier": "string"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualDescription: { type: Type.STRING },
          suggestedStyles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                promptModifier: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("分析图片失败");
  }

  return JSON.parse(response.text) as ProductAnalysis;
};

export const generateAPlusImage = async (
  file: File,
  analysis: ProductAnalysis,
  style: StyleOption,
  ratio: string,
  customInstructions?: string
): Promise<string> => {
  const ai = getClient();
  const base64Data = await fileToGenerativePart(file);

  // Construct a strong prompt for A+ content
  // We use English for the prompt structure to ensure best adherence by the model, even if the inputs are mixed.
  const prompt = `
    Create a professional Amazon A+ marketing image.
    
    Product Description (Visuals): ${analysis.visualDescription}.
    
    Target Style: ${style.name} (Style keywords: ${style.promptModifier}).
    ${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}
    
    The image should be high-resolution, photorealistic, and commercially focused. 
    Make the product the central focus. Ensure high quality lighting and composition suitable for e-commerce.
    Do not include any text or logos on the image.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        // Providing the image as reference for the product look
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: ratio as any,
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("未生成内容");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("响应中未找到图片数据");
};
