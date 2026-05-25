type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  timestamp?: string;
  level?: LogLevel;
  message: string;
  request_id?: string;
  user_id?: string;
  route?: string;
  status_code?: number;
  method?: string;
  duration_ms?: number;
  code?: string;
  [key: string]: unknown;
};

function write(level: LogLevel, payload: LogPayload) {
  const entry = {
    timestamp: payload.timestamp ?? new Date().toISOString(),
    level,
    ...payload,
  };

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = {
  info(payload: LogPayload) {
    write('info', payload);
  },
  warn(payload: LogPayload) {
    write('warn', payload);
  },
  error(payload: LogPayload) {
    write('error', payload);
  },
};
