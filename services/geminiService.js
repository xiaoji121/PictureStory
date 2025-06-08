import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT, API_KEY_ERROR_MESSAGE } from '../constants';

const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(API_KEY_ERROR_MESSAGE);
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  return apiKey;
};

let ai = null;

const getGenAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return ai;
};

export const analyzeImagesAndGenerateNarratives = async (images) => {
  if (images.length === 0) {
    return { narratives: { child: "", reminiscent: "" } };
  }

  const genAI = getGenAIClient();

  const imageParts = images.map(image => ({
    inlineData: {
      mimeType: image.type,
      data: image.base64.split(',')[1] 
    } 
  }));

  const prompt = `
    您是一名人工智能助手，帮助从一组图像中制作个性化纪念品。
    分析所提供的图像。
    根据所有图像，生成一篇可配合这些图像的草稿叙述（最多 100 字）。
    提供该叙述的两个版本：
    1. 一种"童真喜悦风格"（比如：纯真、活泼、天真、用词简单、充满童趣）。
    2. 一种"温馨怀旧风格"（例如：温柔、怀旧、略带感伤、引人深思）。

    仅以以下结构的有效 JSON 对象形式返回您的响应：
    {
      "generalDescription": "对图像集合的简要总体描述（例如，'一组来自阳光明媚假日出游的家庭照片，展示了快乐的孩子和风景如画的景观。'）",
            "narratives": {
              "child": "以孩子口吻叙述的内容...",
              "reminiscent": "以回忆口吻叙述的内容..."
      }
    }
    确保 JSON 格式正确。不要在 JSON 对象外包含任何文本。
  `;

  try {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: { parts: [...imageParts, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.7
      } 
    });

    let jsonStr = response?.text?.trim() ?? '';
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    // Validate structure slightly
    if (!parsedData.narratives || typeof parsedData.narratives.child !== 'string' || typeof parsedData.narratives.reminiscent !== 'string') {
      throw new Error("从Gemini API收到的叙事JSON结构无效。");
    }
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const defaultNarratives = {
        child: 'AI暂时无法生成故事。试试这个怎么样："从前，有一些充满乐趣的可爱照片！"',
        reminiscent: 'AI暂时无法生成故事。或许您可以写："这些照片承载了太多珍贵的记忆。"'
    };
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error;
    }
    // Fallback with placeholder text if API fails for other reasons
    return { 
        generalDescription: "目前无法分析图像。",
        narratives: defaultNarratives
    };
  }
};