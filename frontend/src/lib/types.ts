
export type User = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type Organization = {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  created_at: string;
};

export type Project = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  status: string;
  created_by: number;
  created_at: string;
};

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type Task = {
  id: number;
  organization_id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_by: number;
  created_at: string;
};
