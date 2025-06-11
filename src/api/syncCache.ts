import { ExpoSQLiteAdapter } from "@/storage/database_client";
import { connectionsApi } from '@innobridge/trpcmessengerclient';
import { Connection, ConnectionRequest } from '@/models/connection';
import { 
    beginTransaction, 
    commitTransaction, 
    initializeCache, 
    rollbackTransaction 
} from '@/api/cache';
import { 
    deleteAllConnectionRequests,
    upsertConnectionRequests,
    deleteAllConnections,
    upsertConnections
} from '@/api/cachedConnections';

const { getConnectionRequests, getConnectionsByUserId } = connectionsApi;

let isCacheInitialized = false;
let syncInterval: NodeJS.Timeout | null = null;

/**
 * 
 * @param db - SQLite database instance for local caching
 * @param userId - Unique identifier for the authenticated user
 * @param syncInterval - Interval for periodic syncing between the cache and backend database (in seconds, default: 60)
 * @param registerMigrations - Optional map of migration functions to register for cache initialization
 * @param jwt - Optional JWT token for authenticated API requests
 * 
 * @example
 * ```typescript
 * await onLogin(
 *   database,
 *   'user_123',
 *   900, // 15 minutes
 *   'jwt_token'
 * );
 * ```
 */
const onLogin = async (
    db: any, 
    userId: string,
    syncInterval: number = 60,
    registerMigrations?: Map<number, () => Promise<void>>,
    jwt?: string,
) => {
    const dbAdapter = new ExpoSQLiteAdapter(db);

    try {
        await initializeCache(dbAdapter, registerMigrations);
        isCacheInitialized = true;
        await syncConnections(userId);
        await syncConnectionRequests(userId);
        periodicSync(userId, syncInterval);
    } catch (error) {
        console.error("Error during login synchronization:", error);
        throw error;
    }
};

const periodicSync = (userId: string, intervalSeconds: number, jwt?: string) => {
    if (!isCacheInitialized) {
        console.warn("Cache not initialized. Skipping periodic sync.");
        return;
    }
    stopPeriodicSync();

    syncInterval = setInterval(async () => {
        try {
            await syncConnections(userId, jwt);
            await syncConnectionRequests(userId, jwt);
        } catch (error) {
            console.error("Error during periodic sync:", error);
        }
    }, intervalSeconds * 1000);
};

const onLogout = async (userId: string) => {
    if (isCacheInitialized) {
        try {
            stopPeriodicSync();
            await beginTransaction();
            await deleteAllConnections();
            await deleteAllConnectionRequests();
            await commitTransaction();
        } catch (error) {
            console.error("Error during logout cleanup:", error);
            await rollbackTransaction();
        }
    }
};

const syncConnections = async (userId: string, jwt?: string) => {
    await beginTransaction();
    try {
        const connections: Connection[] = await getConnectionsByUserId(userId);
        await deleteAllConnections();
        await upsertConnections(connections);
        await commitTransaction();
    } catch (error) {
        console.error("Error syncing connections:", error);
        await rollbackTransaction();
        throw error;
    }
};

const syncConnectionRequests = async (userId: string, jwt?: string) => {
    await beginTransaction();
    try {
        const connectionRequests: ConnectionRequest[] = await getConnectionRequests(userId);
        await deleteAllConnectionRequests();
        await upsertConnectionRequests(connectionRequests);
        await commitTransaction();
    } catch (error) {
        console.error("Error syncing connection requests:", error);
        await rollbackTransaction();
        throw error;
    }
};

const stopPeriodicSync = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Stopped periodic sync');
    }
};

export {
    onLogin,
    onLogout
};