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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Course, "id">>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, "id" | "created_at">;
        Update: Partial<Omit<Lesson, "id">>;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Omit<QuizQuestion, "id">;
        Update: Partial<Omit<QuizQuestion, "id">>;
      };
      user_progress: {
        Row: UserProgress;
        Insert: Omit<UserProgress, "id">;
        Update: Partial<Omit<UserProgress, "id">>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, "id">;
        Update: Partial<Omit<QuizAttempt, "id">>;
      };
      certificates: {
        Row: Certificate;
        Insert: Omit<Certificate, "id">;
        Update: Partial<Omit<Certificate, "id">>;
      };
      chat_channels: {
        Row: ChatChannel;
        Insert: Omit<ChatChannel, "id" | "created_at">;
        Update: Partial<Omit<ChatChannel, "id">>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ChatMessage, "id">>;
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: Omit<MessageReaction, "id" | "created_at">;
        Update: Partial<Omit<MessageReaction, "id">>;
      };
    };
  };
}
