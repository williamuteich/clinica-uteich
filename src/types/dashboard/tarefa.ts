export interface PatientTask {
  id: string;
  patientId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  patientId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
}

export interface PatientTasksResponse {
  tasks: PatientTask[];
  total: number;
}

export interface TasksModalProps {
  patientId: string;
  patientName: string;
}

export interface TaskItemProps {
  task: PatientTask;
  onUpdate: (id: string, data: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
}

export interface TaskFormProps {
  patientId: string;
  initialTask?: PatientTask | null;
  onSuccess: (task: PatientTask) => void;
  onCancel: () => void;
}
