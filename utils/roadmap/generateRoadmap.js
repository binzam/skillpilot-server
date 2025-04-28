import { CohereClientV2 } from 'cohere-ai';
import { cleanAndParseJson, generatePrompt, isAIResponse } from '../utils.js';
import saveRoadmapToDB from './saveRoadmapToDb.js';

const client = new CohereClientV2({ token: process.env.CO_API_KEY });

export const generateRoadmap = async (message, userId) => {
  const prompt = generatePrompt(message);
  try {
    const response = await client.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    const content = response.message?.content?.[0]?.text;
    if (!content) return { success: false, roadmap: null };

    // console.log('Response content>>>', content);

    const parsed = cleanAndParseJson(content);
    if (!isAIResponse(parsed)) return { success: false, roadmap: null };

    // console.log('parsedResponse>>>', parsed);

    const roadmapToSave = {
      roadmapTitle: parsed.roadmap_title,
      modules: parsed.modules.map((module) => ({
        module: module.module,
        submodules: module.submodules.map((submodule) => ({
          submodule: submodule.submodule,
          topics: submodule.topics,
          estimated_time: submodule.estimated_time || 'unavailable',
          resources: submodule.resources || [],
        })),
      })),
    };
    const { roadmap } = await saveRoadmapToDB(roadmapToSave, userId);
    return { success: true, roadmap };
  } catch (error) {
    console.error('Error generating response:', error);
    return { success: false, roadmap: null };
  }
};

export default generateRoadmap;
