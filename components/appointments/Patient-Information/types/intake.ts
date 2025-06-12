export interface IntakeDetail {
  id?: string;
  weightKg: number;
  imagePaths: string[];
  visitId: string;
  notes: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIntakeDetailRequest {
  visitId: string;
  weightKg: number;
  notes: string;
  isCompleted: boolean;
  imagePaths: string[];
}

export interface UpdateIntakeDetailRequest {
  id: string;
  visitId?: string;
  weightKg?: number;
  imagePaths?: string[];
  notes?: string;
  isCompleted?: boolean;
} 