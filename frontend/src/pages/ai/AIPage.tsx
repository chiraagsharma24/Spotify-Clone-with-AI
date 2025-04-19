import { useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Music, Clock, Activity } from "lucide-react";
import PlayButton from "../home/components/PlayButton";
import { axiosInstance } from "@/lib/axios";
import Topbar from "@/components/Topbar";

type RecommendationCategory = "mood" | "time" | "activity";

const AIPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [category, setCategory] = useState<RecommendationCategory>("mood");
  const [error, setError] = useState<string | null>(null);
  const { songs } = useMusicStore();

  const categories = [
    { 
      id: "mood", 
      label: "Mood", 
      icon: Music,
      options: ["Happy", "Sad", "Energetic", "Relaxed", "Focused", "Romantic", "Nostalgic", "Inspired"] 
    },
    { 
      id: "time", 
      label: "Time of Day", 
      icon: Clock,
      options: ["Morning", "Afternoon", "Evening", "Night", "Sunrise", "Sunset", "Midnight"] 
    },
    { 
      id: "activity", 
      label: "Activity", 
      icon: Activity,
      options: ["Working", "Exercise", "Studying", "Party", "Sleep", "Meditation", "Cooking", "Driving"] 
    },
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

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const Icon = category.icon;
      return <Icon className="h-5 w-5 mr-2" />;
    }
    return null;
  };

  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold">AI Music Recommendations</h1>
          </div>
          
          <p className="text-zinc-400 mb-8 max-w-2xl">
            Get personalized song recommendations based on your mood, time of day, or current activity. 
            Our AI analyzes your preferences to suggest the perfect soundtrack for any moment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categories.map((cat) => (
              <Card 
                key={cat.id} 
                className={`bg-zinc-800/50 border-zinc-700 cursor-pointer transition-all hover:bg-zinc-700/50 ${
                  category === cat.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => handleCategoryChange(cat.id as RecommendationCategory)}
              >
                <CardHeader>
                  <div className="flex items-center">
                    {getCategoryIcon(cat.id)}
                    <CardTitle>{cat.label}</CardTitle>
                  </div>
                  <CardDescription>
                    Find songs that match your {cat.label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          {!recommendations.length && !isLoading && (
            <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
              <CardHeader>
                <CardTitle>Select an option for {categories.find(cat => cat.id === category)?.label}</CardTitle>
                <CardDescription>
                  Choose from the options below to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories
                    .find((cat) => cat.id === category)
                    ?.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className="text-sm h-auto py-3"
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-zinc-400 text-lg">Analyzing your preferences...</p>
              <p className="text-zinc-500 text-sm mt-2">This may take a few moments</p>
            </div>
          )}

          {error && (
            <Card className="bg-red-900/20 border-red-800">
              <CardContent className="py-6">
                <div className="text-red-400 text-center">{error}</div>
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setError(null)}
                    className="border-red-800 text-red-400 hover:bg-red-900/20"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <CardTitle>
                    Recommended for {categories.find(cat => cat.id === category)?.label}: {recommendations[0]?.reason}
                  </CardTitle>
                </div>
                <CardDescription>
                  Based on your preferences and listening patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
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
                            className="w-20 h-20 object-cover flex-shrink-0"
                          />
                          <div className="flex-1 p-4">
                            <p className="font-medium truncate text-lg">{song.title}</p>
                            <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                            <p className="text-sm text-purple-400 mt-2">{rec.reason}</p>
                          </div>
                          <PlayButton song={song} />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setRecommendations([])}
                    className="mr-2"
                  >
                    Try another {categories.find(cat => cat.id === category)?.label}
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => {
                      const allSongs = recommendations.map(rec => {
                        const song = songs.find(s => s._id === rec.songId);
                        return song;
                      }).filter(Boolean);
                      
                      // Add to queue logic here
                      console.log("Adding to queue:", allSongs);
                    }}
                  >
                    Play All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default AIPage; 