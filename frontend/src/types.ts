export interface SchedulerConfig {
  _id: string;
  type: "interval" | "daily";
  time: string;
  id: string;
  name: string;
  status: string;
  date: { start: string; end: string } | false;
}


export interface ReportStatus {
  _id: string;
  status: string;
  message: string;
  type: string;
  scheduleTime: string;
  name: string;
}


export interface ReportData {
  _id: string;
  agentName: string;
  callInitiated: string;
  callEnded: string;
  callDuration: string;
  customerName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface AwsCredentials {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface SftpCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  path: string;
}

export interface SaveSchedulerPayload {
  data: {
    id: string;
    name: string;
    type: "interval" | "daily";
    time: string;
    date: {
      start: string;
      end: string;
    };
  };
  uploadType: "aws" | "sftp";
  credentials: AwsCredentials | SftpCredentials;
  status: string;
}

export interface CreateSchedulesProps {
  onCreated: () => void | Promise<void>;
}

export interface ActiveSchedulesProps {
  schedules: SchedulerConfig[];
  onUpdated: () => void | Promise<void>;
}

export type Actions = 'pause' | 'active' | 'terminate'