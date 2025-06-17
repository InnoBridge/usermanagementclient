import { CachedBaseClient } from '@/storage/cached_base_client';
import { 
    Connection, 
    ConnectionRequest, 
    ConnectionRequestStatus 
} from '@/models/connection';

interface CachedConnectionsClient extends CachedBaseClient {
    getAllConnectionRequests(userId: string, status?: ConnectionRequestStatus): Promise<ConnectionRequest[]>;
    upsertConnectionRequest(request: ConnectionRequest): Promise<void>;
    upsertConnectionRequests(requests: ConnectionRequest[]): Promise<void>;
    deleteAllConnectionRequests(): Promise<void>;
    getConnectionsByUserId(userId: string): Promise<Connection[]>;
    upsertConnections(connections: Connection[]): Promise<void>;
    deleteConnectionById(connectionId: number): Promise<void>;
    deleteAllConnections(): Promise<void>;
};

export {
    CachedConnectionsClient,
};