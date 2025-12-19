export type UserRole = "super_admin" | "admin" | "guest";
export type Department = "profesores" | "administracion";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  department: Department;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  created_by: string;
  is_published: boolean;
  passing_score: number;
  sequential_lock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_seconds: number;
  order_index: number;
  resources: Resource[];
  created_at: string;
}

export interface Resource {
  name: string;
  url: string;
}

export interface QuizQuestion {
  id: string;
  course_id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  order_index: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percent: number;
  completed: boolean;
  completed_at: string | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  attempted_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  reactions?: MessageReaction[];
  reply_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Supabase Database type definition
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string; role: UserRole; department: Department };
        Update: Partial<Profile>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { title: string; description: string; created_by: string };
        Update: Partial<Course>;
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson> & { course_id: string; title: string; video_url: string; order_index: number };
        Update: Partial<Lesson>;
        Relationships: [];
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Partial<QuizQuestion> & { course_id: string; question_text: string; options: string[]; correct_answer_index: number; order_index: number };
        Update: Partial<QuizQuestion>;
        Relationships: [];
      };
      user_progress: {
        Row: UserProgress;
        Insert: Partial<UserProgress> & { user_id: string; lesson_id: string };
        Update: Partial<UserProgress>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Partial<QuizAttempt> & { user_id: string; course_id: string; score: number; passed: boolean; answers: Record<string, number> };
        Update: Partial<QuizAttempt>;
        Relationships: [];
      };
      certificates: {
        Row: Certificate;
        Insert: Partial<Certificate> & { user_id: string; course_id: string; certificate_url: string };
        Update: Partial<Certificate>;
        Relationships: [];
      };
      chat_channels: {
        Row: ChatChannel;
        Insert: Partial<ChatChannel> & { name: string; slug: string };
        Update: Partial<ChatChannel>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Partial<ChatMessage> & { channel_id: string; user_id: string; content: string };
        Update: Partial<ChatMessage>;
        Relationships: [];
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: Partial<MessageReaction> & { message_id: string; user_id: string; emoji: string };
        Update: Partial<MessageReaction>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      department: Department;
    };
    CompositeTypes: Record<string, never>;
  };
};
