export interface Job {
  id?: string;
  name: string;
  lang: string;
  application: string;
  area?:number;
  token: string;
  email: string;
  datetime: Date;
  status: JobStatus;
  acceptTerms: boolean;
}

export enum JobStatus {
  pending = 'PENDING',
  running = 'RUNNING',
  done = 'DONE',
  failed = 'FAILED'
}
