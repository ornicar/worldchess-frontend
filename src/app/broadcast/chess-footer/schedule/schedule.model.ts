export interface ISchedule {
  id?: number;
  title?: string;
  description: string;
  start: string;
  tournament: number;
  is_rest_day?: boolean;
}
