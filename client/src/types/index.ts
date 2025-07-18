// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  avatar?: File;
}

// Chat Types
export interface Chat {
  _id: string;
  name?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  members: User[];
  groupChat: boolean;
  admin?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  chat: string;
  content?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  publicId: string;
  filename: string;
  mimeType: string;
  size: number;
}

// Friend Request Types
export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  payload: {
    data: T[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
  };
}

// Notification Types
export interface MessageNotification {
  chatId: string;
  count: number;
}

export interface CallInfo {
  chatId: string;
  caller: User;
  type: 'audio' | 'video';
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  chat: ChatState;
  other: OtherState;
}

export interface ChatState {
  requestNotification: number;
  messageNotification: MessageNotification[];
}

export interface OtherState {
  notificationDrawer: boolean;
  members: User[];
  makeGroupDrawer: boolean;
  groupInfoDrawer: boolean;
  groupId: string;
  theme: 'light' | 'dark';
  editGroup: boolean;
  chatId: string;
  isRinging: boolean;
  callInfo: CallInfo | null;
  isCallStarted: boolean;
  incomingOffer: any;
  callerDetails: User | null;
  selectedChat: Chat | null;
  search: boolean;
}

// Socket Event Types
export interface SocketEvents {
  NEW_MESSAGE: string;
  NEW_MESSAGE_ALERT: string;
  TYPING_START: string;
  TYPING_STOP: string;
  ONLINE_USERS: string;
  USER_JOINED: string;
  USER_LEFT: string;
}

// Component Props Types
export interface ProtectedRouteProps {
  user: User | null;
  isLoading: boolean;
  children: React.ReactNode;
}

export interface MessageProps {
  message: Message;
  user: User;
}

export interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}