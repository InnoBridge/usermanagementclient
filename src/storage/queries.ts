enum Transaction {
    BEGIN = 'BEGIN',
    COMMIT = 'COMMIT',
    ROLLBACK = 'ROLLBACK'
};

enum ConnectionRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELED = 'canceled'
}

// CREATE TABLE queries
const CREATE_CONNECTIONS_TABLE_QUERY =
    `CREATE TABLE IF NOT EXISTS connections (
        connection_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id1 TEXT NOT NULL,
        user_id1_username TEXT,
        user_id1_first_name TEXT,
        user_id1_last_name TEXT,
        user_id1_image_url TEXT,
        user_id2 TEXT NOT NULL,
        user_id2_username TEXT,
        user_id2_first_name TEXT,
        user_id2_last_name TEXT,
        user_id2_image_url TEXT,
        connected_at INTEGER NOT NULL,
        UNIQUE(user_id1, user_id2),
        CHECK(user_id1 < user_id2));`;

const CREATE_CONNECTION_REQUESTS_TABLE_QUERY =
    `CREATE TABLE IF NOT EXISTS connection_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id TEXT NOT NULL,
        requester_username TEXT,
        requester_first_name TEXT,
        requester_last_name TEXT,
        requester_image_url TEXT,
        receiver_id TEXT NOT NULL,
        receiver_username TEXT,
        receiver_first_name TEXT,
        receiver_last_name TEXT,
        receiver_image_url TEXT,
        greeting_text TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        responded_at INTEGER,
        CHECK(requester_id != receiver_id),
        CHECK(status IN ('pending', 'accepted', 'rejected', 'canceled')));`;

// CREATE INDEX queries for performance
const CREATE_CONNECTIONS_INDEXES_QUERY = 
    `CREATE INDEX IF NOT EXISTS idx_connections_user_id1 ON connections(user_id1);
    CREATE INDEX IF NOT EXISTS idx_connections_user_id2 ON connections(user_id2);
    CREATE INDEX IF NOT EXISTS idx_connections_connected_at ON connections(connected_at);`;

const CREATE_CONNECTION_REQUESTS_INDEXES_QUERY = 
    `CREATE INDEX IF NOT EXISTS idx_connection_requests_requester_id ON connection_requests(requester_id);
    CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_id ON connection_requests(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);
    CREATE INDEX IF NOT EXISTS idx_connection_requests_created_at ON connection_requests(created_at);`;

const GET_USER_CONNECTION_REQUESTS_QUERY = 
    `SELECT * FROM connection_requests 
    WHERE (requester_id = ? OR receiver_id = ?)
    AND (? IS NULL OR status = ?)
    ORDER BY 
        CASE WHEN responded_at IS NOT NULL THEN responded_at ELSE created_at END DESC,
        created_at DESC;`;

const UPSERT_CONNECTION_REQUESTS_QUERY = (requestCount: number): string => {
    const valuesParts = Array(requestCount).fill('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    return `
        INSERT INTO connection_requests (
            request_id, requester_id, requester_username, requester_first_name, requester_last_name, requester_image_url,
            receiver_id, receiver_username, receiver_first_name, receiver_last_name, receiver_image_url, greeting_text, 
            status, created_at, responded_at
        )
        VALUES ${valuesParts}
        ON CONFLICT(request_id) DO UPDATE SET
            status = excluded.status,
            responded_at = excluded.responded_at,
            greeting_text = excluded.greeting_text;`;
};

const DELETE_ALL_CONNECTION_REQUESTS_QUERY = 
    `DELETE FROM connection_requests;`;

const GET_CONNECTION_BY_ID_QUERY =
    `SELECT * FROM connections 
    WHERE connection_id = ?;`;

const GET_CONNECTIONS_BY_USER_ID_QUERY = 
    `SELECT * FROM connections 
    WHERE user_id1 = ? OR user_id2 = ?
    ORDER BY connected_at DESC;`;

const UPSERT_CONNECTIONS_QUERY = (connectionCount: number): string => {
    const valuesParts = Array(connectionCount).fill('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    return `
        INSERT INTO connections (
            connection_id, user_id1, user_id1_username, user_id1_first_name, user_id1_last_name, user_id1_image_url,
            user_id2, user_id2_username, user_id2_first_name, user_id2_last_name, user_id2_image_url, connected_at
        )
        VALUES ${valuesParts}
        ON CONFLICT(connection_id) DO UPDATE SET
            user_id1 = excluded.user_id1,
            user_id2 = excluded.user_id2,
            connected_at = excluded.connected_at;
    `;
};

const DELETE_CONNECTION_BY_ID_QUERY =
    `DELETE FROM connections 
    WHERE connection_id = ?;`;

const DELETE_ALL_CONNECTIONS_QUERY = 
    `DELETE FROM connections;`;

export {
    Transaction,
    ConnectionRequestStatus,
    CREATE_CONNECTIONS_TABLE_QUERY,
    CREATE_CONNECTION_REQUESTS_TABLE_QUERY,
    CREATE_CONNECTIONS_INDEXES_QUERY,
    CREATE_CONNECTION_REQUESTS_INDEXES_QUERY,
    GET_USER_CONNECTION_REQUESTS_QUERY,
    UPSERT_CONNECTION_REQUESTS_QUERY,
    DELETE_ALL_CONNECTION_REQUESTS_QUERY,
    GET_CONNECTION_BY_ID_QUERY,
    GET_CONNECTIONS_BY_USER_ID_QUERY,
    UPSERT_CONNECTIONS_QUERY,
    DELETE_CONNECTION_BY_ID_QUERY,
    DELETE_ALL_CONNECTIONS_QUERY
}