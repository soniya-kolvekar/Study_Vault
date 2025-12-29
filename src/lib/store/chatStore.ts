import { create } from 'zustand';

export interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    currentResource: { url: string; type: 'pdf' | 'image' | null } | null;
    resourceList: string[]; // List of file names/info in current view
    toggleOpen: () => void;
    addMessage: (msg: Message) => void;
    setLoading: (loading: boolean) => void;
    setCurrentResource: (url: string | null, type: 'pdf' | 'image' | null) => void;
    setResourceList: (list: string[]) => void;
    setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    messages: [{ role: 'model', text: 'Hi! I can help you find notes, summarize documents, or answer questions about StudyVault. How can I assist?' }],
    isLoading: false,
    currentResource: null,
    resourceList: [],
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    setMessages: (messages) => set({ messages }),
    setLoading: (loading) => set({ isLoading: loading }),
    setCurrentResource: (url, type) => set({ currentResource: url ? { url, type } : null }),
    setResourceList: (list) => set({ resourceList: list }),
}));
