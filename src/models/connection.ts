enum ConnectionRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled'
};

interface Connection {
  connectionId: number;
  userId1: string;
  userId1Username?: string | null;
  userId1FirstName?: string | null;
  userId1LastName?: string | null;
  userId1ImageUrl?: string | null;
  userId2: string;
  userId2Username?: string | null;
  userId2FirstName?: string | null;
  userId2LastName?: string | null;
  userId2ImageUrl?: string | null;
  connectedAt: number;
};

interface ConnectionRequest {
  requestId: number;
  requesterId: string;
  requesterUsername?: string | null;
  requesterFirstName?: string | null;
  requesterLastName?: string | null;
  requesterImageUrl?: string | null;
  receiverId: string;
  receiverUsername?: string | null;
  receiverFirstName?: string | null;
  receiverLastName?: string | null;
  receiverImageUrl?: string | null;
  greetingText?: string | null;
  status: ConnectionRequestStatus;
  createdAt: number;
  respondedAt?: number | null;
};

export {
  ConnectionRequestStatus,
  Connection,
  ConnectionRequest
};