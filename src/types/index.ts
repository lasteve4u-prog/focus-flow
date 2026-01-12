export interface Event {
  id: string;
  title: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  startedAt: string; // ISO String
  endedAt?: string;  // ISO String
  toiletDoneAt?: string; // ISO String for forced check
  paperDoneAt?: string;  // ISO String for forced check
  description?: string;
  subtasks?: Subtask[];
}

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  events: Event[];
  tasks: Task[];
}
