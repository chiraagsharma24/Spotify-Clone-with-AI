import { useState, useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";
import PlayButton from "./PlayButton";
import { axiosInstance } from "@/lib/axios";

type RecommendationCategory = "mood" | "time" | "activity";

const AIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [category, setCategory] = useState<RecommendationCategory>("mood");
  const [error, setError] = useState<string | null>(null);
  const { songs } = useMusicStore();

  const categories = [
    { id: "mood", label: "Mood", options: ["Happy", "Sad", "Energetic", "Relaxed", "Focused"] },
    { id: "time", label: "Time of Day", options: ["Morning", "Afternoon", "Evening", "Night"] },
    { id: "activity", label: "Activity", options: ["Working", "Exercise", "Studying", "Party", "Sleep"] },
  ];

  const fetchRecommendations = async (selectedCategory: RecommendationCategory, option: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post("/ai/recommendations", {
        category: selectedCategory,
        option: option,
        songs: songs.map(song => ({
          id: song._id,
          title: song.title,
          artist: song.artist
        }))
      });
      
      setRecommendations(response.data.recommendations);
    } catch (err: any) {
      setError("Failed to get AI recommendations. Please try again.");
      console.error("AI recommendation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: RecommendationCategory) => {
    setCategory(newCategory);
    setRecommendations([]);
  };

  const handleOptionSelect = (option: string) => {
    fetchRecommendations(category, option);
  };

  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.id as RecommendationCategory)}
                className={category === cat.id ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
        <CardDescription>
          Get personalized song recommendations based on your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recommendations.length && !isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
            {categories
              .find((cat) => cat.id === category)
              ?.options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </Button>
              ))}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
            <p className="text-zinc-400">Analyzing your preferences...</p>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-center py-4">{error}</div>
        )}

        {recommendations.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">
                Recommended for your {category}: {recommendations[0]?.reason}
              </h3>
              <p className="text-sm text-zinc-400">
                Based on your listening patterns and preferences
              </p>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {recommendations.map((rec) => {
                  const song = songs.find((s) => s._id === rec.songId);
                  if (!song) return null;
                  
                  return (
                    <div
                      key={song._id}
                      className="flex items-center bg-zinc-800/50 rounded-md overflow-hidden
                      hover:bg-zinc-700/50 transition-colors group cursor-pointer relative"
                    >
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-16 h-16 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 p-4">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                        <p className="text-xs text-purple-400 mt-1">{rec.reason}</p>
                      </div>
                      <PlayButton song={song} />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setRecommendations([])}
              >
                Try another {category}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations; 