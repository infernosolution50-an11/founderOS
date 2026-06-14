import type {
  DocumentRecord,
  EmberMessage,
  Opportunity,
  OpportunityNotes,
  RiskAssessment,
  Task
} from "@/types";

type Insert<T, Generated extends keyof T = never> = Omit<T, Generated>;
type Update<T> = Partial<T>;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          plan?: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          plan?: string;
          created_at?: string;
        };
      };
      opportunities: {
        Row: Opportunity;
        Insert: Partial<Insert<Opportunity, "id" | "created_at" | "updated_at">> & { user_id: string };
        Update: Update<Opportunity>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Insert<Task, "id" | "created_at">> & {
          opportunity_id: string;
          user_id: string;
          text: string;
          category: Task["category"];
        };
        Update: Update<Task>;
      };
      ember_messages: {
        Row: EmberMessage;
        Insert: Partial<Insert<EmberMessage, "id" | "created_at">> & {
          opportunity_id: string;
          user_id: string;
          role: EmberMessage["role"];
          content: string;
        };
        Update: Update<EmberMessage>;
      };
      documents: {
        Row: DocumentRecord;
        Insert: Partial<Insert<DocumentRecord, "id" | "created_at">> & {
          opportunity_id: string;
          user_id: string;
          filename: string;
          storage_path: string;
        };
        Update: Update<DocumentRecord>;
      };
      opportunity_notes: {
        Row: OpportunityNotes;
        Insert: Partial<Insert<OpportunityNotes, "id" | "updated_at">> & {
          opportunity_id: string;
          user_id: string;
        };
        Update: Update<OpportunityNotes>;
      };
      risk_assessments: {
        Row: RiskAssessment;
        Insert: Partial<Insert<RiskAssessment, "id" | "created_at">> & {
          opportunity_id: string;
          user_id: string;
          risk_label: string;
        };
        Update: Update<RiskAssessment>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
