"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Play, RotateCcw, User, Eye, Bookmark, X } from "lucide-react"
import type { Mood, Reason, Intention } from "@/app/page"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"
import AuthModal from "./auth-modal"
import SocialShareButton from "./social-share-button"

import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

// Interface definitions
interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}
interface WatchProvider {
  flatrate?: StreamingProvider[];
  rent?: StreamingProvider[];
  buy?: StreamingProvider[];
  link?: string;
}
interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  watch_providers?: WatchProvider;
}
interface MovieRecommendationsProps {
  mood: Mood;
  reason: Reason;
  intention: Intention;
}

const getMoodColors = (mood: Mood) => {
  if (mood.energy === "high" && mood.pleasantness === "pleasant") {
    return {
      border: "border-orange-400/60 hover:border-orange-400/80",
      shadow: "shadow-orange-500/20",
      glow: "shadow-lg shadow-orange-500/25",
    };
  }
  if (mood.energy === "high" && mood.pleasantness === "unpleasant") {
    return {
      border: "border-red-400/60 hover:border-red-400/80",
      shadow: "shadow-red-500/20",
      glow: "shadow-lg shadow-red-500/25",
    };
  }
  if (mood.energy === "low" && mood.pleasantness === "pleasant") {
    return {
      border: "border-blue-400/60 hover:border-blue-400/80",
      shadow: "shadow-blue-500/20",
      glow: "shadow-lg shadow-blue-500/25",
    };
  }
  if (mood.energy === "low" && mood.pleasantness === "unpleasant") {
    return {
      border: "border-purple-400/60 hover:border-purple-400/80",
      shadow: "shadow-purple-500/20",
      glow: "shadow-lg shadow-purple-500/25",
    };
  }
  return {
    border: "border-white/20 hover:border-white/40",
    shadow: "shadow-white/10",
    glow: "shadow-lg shadow-white/20",
  };
};

export default function MovieRecommendations({ mood, reason, intention }: MovieRecommendationsProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<Set<number>>(new Set());
  const [savedMovies, setSavedMovies] = useState<Set<number>>(new Set());
  const [rejectedMovies, setRejectedMovies] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Make refs nullable to avoid dropping swipes that start at coordinate 0
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const savedWatched = localStorage.getItem("mudi-watched-movies");
    if (savedWatched) {
      setWatchedMovies(new Set(JSON.parse(savedWatched)));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedMovies();
    }
  }, [user]);

  const logUserFeedback = async (movie: Movie, action: 'saved' | 'watched' | 'rejected') => {
    if (!user) return;

    const feedbackData = {
      user_id: user.id,
      movie_id: movie.id,
      mood: mood.label,
      reason: reason,
      intention: intention,
      action: action,
    };

    try {
      const { error } = await supabase.from('user_feedback').insert(feedbackData);
      if (error) {
        console.error(`Error logging '${action}' action:`, error);
      }
    } catch (err) {
      console.error('An unexpected error occurred while logging feedback:', err);
    }
  };

  const fetchSavedMovies = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("saved_movies").select("movie_id").eq("user_id", user.id);
      if (error) {
        console.error("Error fetching saved movies:", error);
        return;
      }
      const savedIds = new Set(data.map((item) => item.movie_id));
      setSavedMovies(savedIds);
    } catch (error) {
      console.error("Error fetching saved movies:", error);
    }
  };

  const toggleSavedMovie = async (movie: Movie, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isSaved = savedMovies.has(movie.id);
    try {
      if (isSaved) {
        const { error } = await supabase.from("saved_movies").delete().eq("user_id", user.id).eq("movie_id", movie.id);
        if (error) {
          console.error("Error removing saved movie:", error);
          return;
        }
        setSavedMovies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(movie.id);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("saved_movies").insert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster_path: movie.poster_path,
          movie_overview: movie.overview,
          movie_release_date: movie.release_date,
          mood_when_saved: mood.label,
          reason_when_saved: reason,
        });
        if (error) {
          console.error("Error saving movie:", error);
          return;
        }
        setSavedMovies((prev) => new Set([...prev, movie.id]));
        await logUserFeedback(movie, 'saved');
      }
    } catch (error) {
      console.error("Error toggling saved movie:", error);
    }
  };

  const fetchAdditionalMovie = async () => {
    if (isRefreshing) return null;
    try {
      setIsRefreshing(true);
      const getMoodKey = (mood: Mood): string => {
        return mood.label.toLowerCase();
      };
      const moodKey = getMoodKey(mood);
      const currentMovieIds = movies.map((m) => m.id);
      const rejectedMovieIds = Array.from(rejectedMovies);
      const allExcludedIds = [...new Set([...currentMovieIds, ...rejectedMovieIds])];
      const attempts = [
        { limit: 20, threshold: 0.3 },
        { limit: 50, threshold: 0.1 },
        { limit: 100, threshold: 0.05 },
      ];
      for (const attempt of attempts) {
        const excludeParam = allExcludedIds.length > 0 ? `&exclude=${allExcludedIds.join(",")}` : "";
        const apiUrl = `/api/movies/recommendations?mood=${moodKey}&intention=${intention}&reason=${encodeURIComponent(reason)}&limit=${attempt.limit}&threshold=${attempt.threshold}${excludeParam}`;
        const response = await fetch(apiUrl);
        if (!response.ok) continue;

        const recommendations = await response.json();
        if (recommendations.length > 0) {
          const newMovie = recommendations[0];
          const transformedMovie: Movie = {
            id: newMovie.id,
            title: newMovie.title,
            release_date: newMovie.release_date,
            overview: newMovie.overview,
            poster_path: newMovie.poster_path
              ? newMovie.poster_path.startsWith("http")
                ? newMovie.poster_path
                : `https://image.tmdb.org/t/p/w500${newMovie.poster_path}`
              : "/placeholder.svg?height=300&width=200&text=No+Image",
            watch_providers: newMovie.watch_providers,
          };
          // Avoid accidental duplicates
          setMovies((prev) =>
            prev.some((m) => m.id === transformedMovie.id) ? prev : [...prev, transformedMovie]
          );
          return transformedMovie;
        }
      }
      return null;
    } catch (err) {
      console.error("❌ Error fetching additional movie:", err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleWatched = async (movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation();
    const newWatchedMovies = new Set(watchedMovies);
    const wasWatched = newWatchedMovies.has(movie.id);
    if (wasWatched) {
      newWatchedMovies.delete(movie.id);
    } else {
      newWatchedMovies.add(movie.id);
      await logUserFeedback(movie, 'watched');
      await fetchAdditionalMovie();
    }
    setWatchedMovies(newWatchedMovies);
    localStorage.setItem("mudi-watched-movies", JSON.stringify(Array.from(newWatchedMovies)));
  };

  const rejectMovie = async (movie: Movie, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setRejectedMovies((prev) => new Set(prev).add(movie.id));
    setMovies((prev) => prev.filter((m) => m.id !== movie.id));
    await logUserFeedback(movie, 'rejected');
    await fetchAdditionalMovie();
  };

  const acceptMovie = async (movie: Movie, event?: React.MouseEvent) => {
    event?.stopPropagation();
    await toggleSavedMovie(movie);
    await fetchAdditionalMovie();
  };

  const handleTouchStart = (e: React.TouchEvent, movie: Movie) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, movie: Movie) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        acceptMovie(movie);
      } else {
        rejectMovie(movie);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleCardClick = (index: number) => {
    setShowDetails(showDetails === index ? null : index);
  };

  const handleStreamingClick = (provider: StreamingProvider, movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation();
    const searchQuery = encodeURIComponent(movie.title);
    let url = `https://www.google.com/search?q=${searchQuery}+${provider.provider_name}`;
    switch (provider.provider_name.toLowerCase()) {
      case "netflix": url = `https://www.netflix.com/search?q=${searchQuery}`; break;
      case "hulu": url = `https://www.hulu.com/search?q=${searchQuery}`; break;
      case "amazon prime video": url = `https://www.amazon.com/s?k=${searchQuery}&i=prime-instant-video`; break;
      case "disney plus": url = `https://www.disneyplus.com/search?q=${searchQuery}`; break;
      case "hbo max": url = `https://www.hbomax.com/search?q=${searchQuery}`; break;
    }
    window.open(url, "_blank");
  };

  const renderStreamingOptions = (movie: Movie) => {
    const providers = movie.watch_providers;
    if (!providers) return null;
    const allProviders = [...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])].filter(
      (provider, index, self) => index === self.findIndex((p) => p.provider_id === provider.provider_id)
    );
    if (allProviders.length === 0) return null;
    return (
      <div className="mt-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          {providers.flatrate && providers.flatrate.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Play className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-light">Stream</span>
            </div>
          )}
          {allProviders.slice(0, 6).map((provider) => {
            const isStreaming = providers.flatrate?.some((p) => p.provider_id === provider.provider_id);
            const isRental = providers.rent?.some((p) => p.provider_id === provider.provider_id);
            return (
              <Button
                key={provider.provider_id}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto rounded-md transition-all hover:scale-105 flex-shrink-0 ${
                  isStreaming
                    ? "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
                onClick={(e) => handleStreamingClick(provider, movie, e)}
                title={`${isStreaming ? "Stream" : isRental ? "Rent" : "Buy"} on ${provider.provider_name}`}
              >
                <Image
                  src={
                    provider.logo_path
                      ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
                      : "/placeholder.svg?height=28&width=28&text=Logo"
                  }
                  alt={provider.provider_name}
                  width={28}
                  height={28}
                  className="rounded"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg?height=28&width=28&text=Logo";
                  }}
                />
              </Button>
            );
          })}
          {allProviders.length > 6 && (
            <div className="flex items-center justify-center w-7 h-7 bg-white/10 rounded-md flex-shrink-0">
              <span className="text-xs text-gray-400">+{allProviders.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const getMoodKey = (m: Mood): string => m.label.toLowerCase();
      const moodKey = getMoodKey(mood);
      const apiUrl = `/api/movies/recommendations?mood=${moodKey}&intention=${intention}&reason=${encodeURIComponent(reason)}&limit=5&threshold=0.6`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(`API request failed: ${response.status}. ${errorData.error || ""}`);
      }
      const recommendations = await response.json();
      const transformedMovies: Movie[] = recommendations.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        overview: movie.overview,
        poster_path: movie.poster_path
          ? movie.poster_path.startsWith("http")
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=300&width=200&text=No+Image",
        watch_providers: movie.watch_providers,
      }));
      setMovies(transformedMovies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [mood, reason, intention]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-light">Finding films that match your mood...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400 mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {!authLoading && (
        <div className="flex items-center justify-between border border-white/20 p-3 rounded-lg w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/70" />
            <span className="text-sm text-gray-300">
              {user ? `Signed in as ${user.email?.split('@')[0]}` : "Sign in to save movies"}
            </span>
          </div>
          {!user && (
            <Button
              variant="outline" size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      )}

      <div className="border border-white/20 p-4 rounded-lg mb-6 w-full max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Your selections:</p>
            <p className="font-light">Feeling: <span className="font-normal text-white">{mood.label}</span></p>
            <p className="font-light">Reason: <span className="font-normal text-white">{reason}</span></p>
            <p className="font-light">Intention: <span className="font-normal text-white">{intention === "sit" ? "Sit with this feeling" : "Shift to positive"}</span></p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-serif text-center mb-2">Recommended Films</h2>
      <div className="h-px w-16 bg-white/30 mx-auto mb-6"></div>

      <div className="w-full max-w-4xl mx-auto md:px-6">
        {/* Mobile: Swiper */}
        <div className="md:hidden">
          <Swiper
            modules={[Pagination]} spaceBetween={16} slidesPerView={1.15}
            centeredSlides={true} pagination={{ clickable: true }} className="!pb-10"
          >
            {movies.map((movie, index) => (
              <SwiperSlide key={`${movie.id}-mobile`}>
                <MovieCard
                  movie={movie} index={index} mood={mood}
                  isWatched={watchedMovies.has(movie.id)} isSaved={savedMovies.has(movie.id)}
                  showDetails={showDetails === index} onCardClick={() => handleCardClick(index)}
                  onReject={rejectMovie} onToggleWatched={toggleWatched}
                  onToggleSaved={toggleSavedMovie} reason={reason} intention={intention}
                  renderStreamingOptions={renderStreamingOptions}
                  onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop list */}
        <div className="hidden md:block space-y-4">
          {movies.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-desktop`} movie={movie} index={index} mood={mood}
              isWatched={watchedMovies.has(movie.id)} isSaved={savedMovies.has(movie.id)}
              showDetails={showDetails === index} onCardClick={() => handleCardClick(index)}
              onReject={rejectMovie} onToggleWatched={toggleWatched}
              onToggleSaved={toggleSavedMovie} reason={reason} intention={intention}
              renderStreamingOptions={renderStreamingOptions}
              onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
            />
          ))}
        </div>
      </div>

      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <RotateCcw className="h-5 w-5 animate-spin text-white/70 mr-2" />
          <span className="text-sm text-gray-400 font-light">Finding more films...</span>
        </div>
      )}

      {(watchedMovies.size > 0 || (user && savedMovies.size > 0)) && (
        <div className="text-center pt-4 border-t border-white/10 space-y-1 mx-6">
          {watchedMovies.size > 0 && (
            <p className="text-sm text-gray-400 font-light">
              You've marked {watchedMovies.size} film{watchedMovies.size !== 1 ? "s" : ""} as watched
            </p>
          )}
          {user && savedMovies.size > 0 && (
            <p className="text-sm text-gray-400 font-light">
              {savedMovies.size} film{savedMovies.size !== 1 ? "s" : ""} saved to your collection
            </p>
          )}
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

// Standalone MovieCard component
interface MovieCardProps {
  movie: Movie;
  index: number;
  mood: Mood;
  isWatched: boolean;
  isSaved: boolean;
  showDetails: boolean;
  onCardClick: () => void;
  onReject: (movie: Movie, e?: React.MouseEvent) => void;
  onToggleWatched: (movie: Movie, e: React.MouseEvent) => void;
  onToggleSaved: (movie: Movie, e: React.MouseEvent) => void;
  reason: Reason;
  intention: Intention;
  renderStreamingOptions: (movie: Movie) => React.ReactNode;
  onTouchStart: (e: React.TouchEvent, movie: Movie) => void;
  onTouchEnd: (e: React.TouchEvent, movie: Movie) => void;
}

function MovieCard({
  movie, mood, isWatched, isSaved, showDetails,
  onCardClick, onReject, onToggleWatched, onToggleSaved,
  reason, intention, renderStreamingOptions,
  onTouchStart, onTouchEnd
}: MovieCardProps) {
  const moodColors = getMoodColors(mood);

  const DesktopLayout = () => (
    <div className="flex flex-row h-60">
      <div className="w-44 flex-shrink-0 relative">
        <Image
          src={movie.poster_path || "/placeholder.svg"} alt={movie.title}
          fill sizes="176px" className="object-cover rounded-l-lg"
        />
        {/* Desktop overlay actions (bottom-left over poster) */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center">
          <Button
            variant="ghost" size="sm"
            className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-all backdrop-blur-sm"
            onClick={(e) => onReject(movie, e)} title="Reject this movie"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost" size="sm"
              className={`p-1.5 rounded-full backdrop-blur-sm ${isSaved ? "bg-blue-500/40 text-white" : "bg-black/40 text-white/80 hover:bg-black/60"}`}
              onClick={(e) => onToggleSaved(movie, e)} title={isSaved ? "Remove from saved" : "Save movie"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost" size="sm"
              className={`p-1.5 rounded-full backdrop-blur-sm ${isWatched ? "bg-green-500/40 text-white" : "bg-black/40 text-white/80 hover:bg-black/60"}`}
              onClick={(e) => onToggleWatched(movie, e)} title={isWatched ? "Mark as unwatched" : "Mark as watched"}
            >
              <Eye className={`h-4 w-4 ${isWatched ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-row items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg lg:text-xl tracking-tight text-white leading-tight truncate">
                {movie.title}
              </h3>
              <p className="text-xs lg:text-sm text-gray-400 mt-1 font-light">
                {movie.release_date?.substring(0, 4)}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <SocialShareButton movie={movie} mood={mood} reason={reason} intention={intention} />
            </div>
          </div>
          <div className="mt-2">
            {showDetails ? (
              <>
                <p className="text-sm font-light text-gray-300">{movie.overview}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-gray-400 hover:text-white hover:bg-transparent p-0 text-xs"
                  onClick={(e) => { e.stopPropagation(); onCardClick(); }}
                >
                  Show less
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-light text-gray-300 line-clamp-3">{movie.overview}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-gray-400 hover:text-white hover:bg-transparent p-0 text-xs"
                  onClick={(e) => { e.stopPropagation(); onCardClick(); }}
                >
                  Show more
                </Button>
              </>
            )}
          </div>
        </div>
        {renderStreamingOptions(movie)}
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="relative w-full aspect-[2/3] text-white rounded-lg overflow-hidden">
      <Image
        src={movie.poster_path || "/placeholder.svg"} alt={movie.title}
        fill sizes="100vw" className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
      <div className="absolute top-4 right-4 z-10">
        <SocialShareButton movie={movie} mood={mood} reason={reason} intention={intention} />
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <h3 className="font-serif text-xl tracking-tight leading-tight">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-300 mt-1 font-light">
          {movie.release_date?.substring(0, 4)}
        </p>

        {/* Mobile overview with show more/less parity */}
        <div className="mt-2">
          {showDetails ? (
            <>
              <p className="text-sm font-light text-gray-300">{movie.overview}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-gray-300 hover:text-white hover:bg-transparent p-0 text-xs"
                onClick={(e) => { e.stopPropagation(); onCardClick(); }}
              >
                Show less
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-light text-gray-300 line-clamp-3">{movie.overview}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-gray-300 hover:text-white hover:bg-transparent p-0 text-xs"
                onClick={(e) => { e.stopPropagation(); onCardClick(); }}
              >
                Show more
              </Button>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="ghost" size="sm"
            className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 backdrop-blur-sm"
            onClick={(e) => onReject(movie, e)} title="Reject this movie"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost" size="sm"
              className={`p-2 rounded-full backdrop-blur-sm ${isSaved ? "bg-blue-500/50 text-white" : "bg-black/50 text-white/80 hover:bg-black/70"}`}
              onClick={(e) => onToggleSaved(movie, e)} title={isSaved ? "Remove from saved" : "Save movie"}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost" size="sm"
              className={`p-2 rounded-full backdrop-blur-sm ${isWatched ? "bg-green-500/50 text-white" : "bg-black/50 text-white/80 hover:bg-black/70"}`}
              onClick={(e) => onToggleWatched(movie, e)} title={isWatched ? "Mark as unwatched" : "Mark as watched"}
            >
              <Eye className={`h-5 w-5 ${isWatched ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card
      className={`overflow-hidden bg-black border transition-all duration-300 w-full rounded-lg ${
        isWatched
          ? `${moodColors.border.replace("/60", "/20").replace("/80", "/30")} opacity-60`
          : `${moodColors.border} ${moodColors.glow}`
      }`}
      onTouchStart={(e) => onTouchStart(e, movie)}
      onTouchEnd={(e) => onTouchEnd(e, movie)}
    >
      <div className="hidden md:block" onClick={onCardClick}>
        <DesktopLayout />
      </div>
      <div className="md:hidden">
        <MobileLayout />
      </div>
      {/* Streaming options are already rendered inside each layout beneath text */}
    </Card>
  );
}
