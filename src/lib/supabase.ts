/**
 * Mock Supabase client for local development without real Supabase credentials.
 * All auth operations use localStorage. Replace with real Supabase when ready.
 */

const STORAGE_KEY = 'medicai_mock_users';
const SESSION_KEY = 'medicai_mock_session';

interface MockUser {
    id: string;
    email: string;
    password: string;
    user_metadata: Record<string, any>;
    created_at: string;
}

function getUsers(): MockUser[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveUsers(users: MockUser[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function generateId(): string {
    return 'mock-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function createSession(user: MockUser) {
    const session = {
        access_token: 'mock-token-' + user.id,
        user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            created_at: user.created_at,
        },
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

function getSession() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const mockAuth = {
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any> } }) => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            return { data: { user: null, session: null }, error: { message: 'User already registered' } };
        }
        const newUser: MockUser = {
            id: generateId(),
            email,
            password,
            user_metadata: options?.data || {},
            created_at: new Date().toISOString(),
        };
        users.push(newUser);
        saveUsers(users);
        const session = createSession(newUser);
        return { data: { user: session.user, session }, error: null };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user || user.password !== password) {
            return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
        }
        const session = createSession(user);
        return { data: { user: session.user, session }, error: null };
    },

    getSession: async () => {
        const session = getSession();
        return { data: { session }, error: null };
    },

    updateUser: async ({ email, data: metadata }: { email?: string; data?: Record<string, any> }) => {
        const session = getSession();
        if (!session) return { data: { user: null }, error: { message: 'Not authenticated' } };

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === session.user.id);
        if (userIndex === -1) return { data: { user: null }, error: { message: 'User not found' } };

        if (email) users[userIndex].email = email;
        if (metadata) users[userIndex].user_metadata = { ...users[userIndex].user_metadata, ...metadata };
        saveUsers(users);

        const updatedSession = createSession(users[userIndex]);
        return { data: { user: updatedSession.user }, error: null };
    },

    signOut: async () => {
        localStorage.removeItem(SESSION_KEY);
        return { error: null };
    },
};

const mockFrom = (_table: string) => ({
    update: (data: any) => ({
        eq: (_col: string, val: any) => {
            if (_table === 'profiles' && data) {
                mockAuth.updateUser({ data });
            }
            return Promise.resolve({ data: null, error: null });
        },
    }),
    select: (_cols?: string) => ({
        eq: (_col: string, _val: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
        }),
    }),
});

export const supabase = {
    auth: mockAuth,
    from: mockFrom,
} as any;
