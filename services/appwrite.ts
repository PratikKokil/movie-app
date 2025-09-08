import { Client, Databases, ID, Query } from "react-native-appwrite";

// ✅ Use your environment variables
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "metrics"; // your collection/table ID

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // from .env
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

/**
 * Updates search count for a movie query.
 * If the movie already exists, increment its count.
 * Otherwise, create a new document.
 */
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("movie_id", Number(movie.id)), // ✅ track by movie_id
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: Number(existingMovie.count) + 1, // ✅ ensure integer
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: Number(movie.id), // ✅ integer
        title: movie.title,
        count: 1, // ✅ integer
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("❌ Error updating search count:", error);
    throw error;
  }
};

/**
 * Get top 5 trending movies from Appwrite DB (sorted by count).
 */
export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error("❌ Error fetching trending movies:", error);
    return undefined;
  }
};
