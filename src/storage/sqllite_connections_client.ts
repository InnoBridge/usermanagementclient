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
    UPSERT_CONNECTIONS_QUERY,
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
        return result.map((connectionRequest: any) => {
            return {
                    requestId: connectionRequest.request_id,
                    requesterId: connectionRequest.requester_id,
                    receiverId: connectionRequest.receiver_id,
                    greetingText: connectionRequest.greeting_text,
                    status: connectionRequest.status,
                    createdAt: connectionRequest.created_at,
                    respondedAt: connectionRequest.responded_at
                } as ConnectionRequest
            }
        );
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
            console.log("Upserting connection requests:", JSON.stringify(requests[0], null, 2));
            const params = requests.flatMap(request => [
                request.requestId,
                request.requesterId,
                request.receiverId,
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

    async upsertConnections(connections: Connection[]): Promise<void> {
        if (!connections || connections.length === 0) {
            return;
        }
        try {
            const query = UPSERT_CONNECTIONS_QUERY(connections.length);
            const params = connections.flatMap(connection => [
                connection.connectionId,
                connection.userId1,
                connection.userId2,
                connection.connectedAt
            ]);
            await this.runAsync(query, params);
        } catch (error) {
            console.error("Error upserting connections:", error);
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

export {
    SqlliteConnectionsClient,
};