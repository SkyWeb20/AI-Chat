
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}
