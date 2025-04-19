import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

// Function to generate default songs
const generateDefaultSongs = (): Song[] => {
	const defaultSongs: Song[] = [];
	for (let i = 1; i <= 18; i++) {
		defaultSongs.push({
			_id: `default-${i}`,
			title: `Song ${i}`,
			artist: "Default Artist",
			albumId: null,
			imageUrl: `/cover-images/${i}.jpg`,
			audioUrl: `/songs/${i}.mp3`,
			duration: 180, // Default duration of 3 minutes
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	}
	return defaultSongs;
};

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
	albums: [],
	songs: generateDefaultSongs(), // Initialize with default songs
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: generateDefaultSongs(), // Initialize with default songs
	featuredSongs: generateDefaultSongs().slice(0, 6), // First 6 songs as featured
	trendingSongs: generateDefaultSongs().slice(6, 12), // Next 6 songs as trending
	stats: {
		totalSongs: 18,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 1,
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			// Combine default songs with fetched songs
			const defaultSongs = generateDefaultSongs();
			const fetchedSongs = response.data;
			set({ songs: [...defaultSongs, ...fetchedSongs] });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			// Use default featured songs if no featured songs from API
			const defaultFeatured = generateDefaultSongs().slice(0, 6);
			set({ featuredSongs: response.data.length > 0 ? response.data : defaultFeatured });
		} catch (error: any) {
			set({ featuredSongs: generateDefaultSongs().slice(0, 6) });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			// Use default songs if no songs from API
			const defaultSongs = generateDefaultSongs();
			set({ madeForYouSongs: response.data.length > 0 ? response.data : defaultSongs });
		} catch (error: any) {
			set({ madeForYouSongs: generateDefaultSongs() });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			// Use default trending songs if no trending songs from API
			const defaultTrending = generateDefaultSongs().slice(6, 12);
			set({ trendingSongs: response.data.length > 0 ? response.data : defaultTrending });
		} catch (error: any) {
			set({ trendingSongs: generateDefaultSongs().slice(6, 12) });
		} finally {
			set({ isLoading: false });
		}
	},
}));
