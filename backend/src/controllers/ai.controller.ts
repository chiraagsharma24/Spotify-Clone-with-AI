import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getAIRecommendations = async (req: Request, res: Response) => {
  try {
    const { category, option, songs } = req.body;
    
    if (!category || !option || !songs || !Array.isArray(songs)) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Create a prompt for the AI
    const prompt = `
      I have a list of songs and I want recommendations based on ${category}: "${option}".
      
      Here are the songs I have:
      ${songs.map((song: any, index: number) => `${index + 1}. ${song.title} by ${song.artist}`).join('\n')}
      
      Please recommend 5 songs from this list that would be good for ${option} ${category}.
      For each song, provide a brief reason why it's a good fit.
      
      Format your response as a JSON array with objects containing:
      - songId: the ID of the song (use the index+1 as the ID)
      - reason: a short explanation of why this song fits the ${category}
      
      Example format:
      [
        {
          "songId": "1",
          "reason": "Upbeat tempo and positive lyrics perfect for morning energy"
        },
        ...
      ]
      
      Only return the JSON array, nothing else.
    `;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let recommendations;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return res.status(500).json({ message: "Error processing AI recommendations" });
    }

    // Map the recommendations to the actual song IDs
    const mappedRecommendations = recommendations.map((rec: any) => {
      const songIndex = parseInt(rec.songId) - 1;
      if (songIndex >= 0 && songIndex < songs.length) {
        return {
          songId: songs[songIndex].id,
          reason: rec.reason
        };
      }
      return null;
    }).filter(Boolean);

    return res.status(200).json({ recommendations: mappedRecommendations });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return res.status(500).json({ message: "Error generating recommendations" });
  }
}; 