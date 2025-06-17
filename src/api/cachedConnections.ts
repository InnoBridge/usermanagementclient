import { cacheClient } from "@/api/cache";
import { Connection, ConnectionRequest, ConnectionRequestStatus } from "@/models/connection";

const getAllConnectionRequests = async (userId: string, status?: ConnectionRequestStatus): Promise<ConnectionRequest[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getAllConnectionRequests(userId, status);
};

const upsertConnectionRequest = async (request: ConnectionRequest): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.upsertConnectionRequest(request);
};

const upsertConnectionRequests = async (requests: ConnectionRequest[]): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.upsertConnectionRequests(requests);
};

const deleteAllConnectionRequests = async (): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteAllConnectionRequests();
};

const getConnectionById = async (connectionId: number): Promise<Connection | null> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getConnectionById(connectionId);
};

const getConnectionsByUserId = async (userId: string): Promise<Connection[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getConnectionsByUserId(userId);
};

const upsertConnections = async (connections: Connection[]): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.upsertConnections(connections);
};

const deleteConnectionById = async (connectionId: number): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteConnectionById(connectionId);
};

const deleteAllConnections = async (): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteAllConnections();
};

export {
    getAllConnectionRequests,
    upsertConnectionRequest,
    upsertConnectionRequests,
    deleteAllConnectionRequests,
    getConnectionById,
    getConnectionsByUserId,
    upsertConnections,
    deleteConnectionById,
    deleteAllConnections
};