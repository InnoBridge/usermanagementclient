import { SqlliteBaseClient } from "@/storage/sqllite_base_client";
import { CachedConnectionsClient } from "@/storage/cached_connections_client";
import { SqlLiteClient } from "@/storage/database_client";
import { Connection, ConnectionRequest, ConnectionRequestStatus } from "@/models/connection";
import {
    CREATE_CONNECTIONS_INDEXES_QUERY,
    CREATE_CONNECTION_REQUESTS_INDEXES_QUERY,
    CREATE_CONNECTIONS_TABLE_QUERY,
    CREATE_CONNECTION_REQUESTS_TABLE_QUERY,
    GET_USER_CONNECTION_REQUESTS_QUERY,
    UPSERT_CONNECTION_REQUESTS_QUERY,
    DELETE_ALL_CONNECTIONS_QUERY,
    GET_CONNECTIONS_BY_USER_ID_QUERY,
    UPSERT_CONNECTIONS_QUERY,
    DELETE_CONNECTION_BY_ID_QUERY,
    DELETE_ALL_CONNECTION_REQUESTS_QUERY
} from "@/storage/queries"

class SqlliteConnectionsClient extends SqlliteBaseClient implements CachedConnectionsClient {
    constructor(db: SqlLiteClient) {
        super(db);

        this.registerMigration(0, async () => {
            // Create connections table
            await this.createConnectionTable();
            // Create connection requests table
            await this.createConnectionRequestTable();

            // Create indexes and constraints
            await this.execAsync(CREATE_CONNECTIONS_INDEXES_QUERY);
            await this.execAsync(CREATE_CONNECTION_REQUESTS_INDEXES_QUERY);
        });
    }

    async createConnectionTable(): Promise<void> {
        return await this.execAsync(CREATE_CONNECTIONS_TABLE_QUERY);
    }

    async createConnectionRequestTable(): Promise<void> {
        return await this.execAsync(CREATE_CONNECTION_REQUESTS_TABLE_QUERY);
    }

    async getAllConnectionRequests(userId: string, status?: ConnectionRequestStatus): Promise<ConnectionRequest[]> {
        const result = await this.getAllAsync(
            GET_USER_CONNECTION_REQUESTS_QUERY,
            [userId, userId, status || null, status || null]
        );
        return result.map(toConnectionRequests);
    }

    async upsertConnectionRequest(request: ConnectionRequest): Promise<void> {
        await this.upsertConnectionRequests([request]);
    }

    async upsertConnectionRequests(requests: ConnectionRequest[]): Promise<void> {
        if (!requests || requests.length === 0) {
            return;
        }
        try {
            const query = UPSERT_CONNECTION_REQUESTS_QUERY(requests.length);
            const params = requests.flatMap(request => [
                request.requestId,
                request.requesterId,
                request.requesterUsername || null,
                request.requesterFirstName || null,
                request.requesterLastName || null,
                request.requesterImageUrl || null,
                request.receiverId,
                request.receiverUsername || null,
                request.receiverFirstName || null,
                request.receiverLastName || null,
                request.receiverImageUrl || null,
                request.greetingText || null,
                request.status.toString(),
                request.createdAt,
                request.respondedAt || null
            ]);
            await this.runAsync(query, params);
        } catch (error) {
            console.error("Error upserting connection requests:", error);
            throw error;
        }
    };

    async deleteAllConnectionRequests(): Promise<void> {
        try {
            await this.execAsync(DELETE_ALL_CONNECTION_REQUESTS_QUERY);
        } catch (error) {
            console.error("Error deleting all connection requests:", error);
            throw error;
        }
    }

    async getConnectionsByUserId(userId: string): Promise<Connection[]> {
        try {
            const result = await this.getAllAsync(GET_CONNECTIONS_BY_USER_ID_QUERY, [userId, userId]);
            return result.map(toConnections);
        } catch (error: any) {
            console.error("Error fetching connections by user ID:", error.message);
            throw error;
        }
    }

    async upsertConnections(connections: Connection[]): Promise<void> {
        if (!connections || connections.length === 0) {
            return;
        }
        try {
            const query = UPSERT_CONNECTIONS_QUERY(connections.length);
            const params = connections.flatMap(connection => [
                connection.connectionId,
                connection.userId1,
                connection.userId1Username || null,
                connection.userId1FirstName || null,
                connection.userId1LastName || null,
                connection.userId1ImageUrl || null,
                connection.userId2,
                connection.userId2Username || null,
                connection.userId2FirstName || null,
                connection.userId2LastName || null,
                connection.userId2ImageUrl || null,
                connection.connectedAt
            ]);
            await this.runAsync(query, params);
        } catch (error) {
            console.error("Error upserting connections:", error);
            throw error;
        }
    }

    async deleteConnectionById(connectionId: number): Promise<void> {
        try {
            await this.runAsync(DELETE_CONNECTION_BY_ID_QUERY, [connectionId]);
        } catch (error) {
            console.error("Error deleting connection by ID:", error);
            throw error;
        }
    }

    async deleteAllConnections(): Promise<void> {
        try {
            await this.execAsync(DELETE_ALL_CONNECTIONS_QUERY);
        } catch (error) {
            console.error("Error deleting all connections:", error);
            throw error;
        }
    }
}

const toConnectionRequests = (row: any): ConnectionRequest => {
    return {
        requestId: row.request_id,
        requesterId: row.requester_id,
        requesterFirstName: row.requester_first_name || null,
        requesterLastName: row.requester_last_name || null,
        requesterUsername: row.requester_username || null,
        requesterImageUrl: row.requester_image_url || null,
        receiverId: row.receiver_id,
        receiverFirstName: row.receiver_first_name || null,
        receiverLastName: row.receiver_last_name || null,
        receiverUsername: row.receiver_username || null,
        receiverImageUrl: row.receiver_image_url || null,
        greetingText: row.greeting_text,
        status: row.status,
        createdAt: row.created_at,
        respondedAt: row.responded_at
    } as ConnectionRequest;
};

const toConnections = (row: any): Connection => {
    return {
        connectionId: row.connection_id,
        userId1: row.user_id1,
        userId1Username: row.user_id1_username || null,
        userId1FirstName: row.user_id1_first_name || null,
        userId1LastName: row.user_id1_last_name || null,
        userId1ImageUrl: row.user_id1_image_url || null,
        userId2: row.user_id2,
        userId2Username: row.user_id2_username || null,
        userId2FirstName: row.user_id2_first_name || null,
        userId2LastName: row.user_id2_last_name || null,
        userId2ImageUrl: row.user_id2_image_url || null,
        connectedAt: row.connected_at
    } as Connection;
}

export {
    SqlliteConnectionsClient,
};