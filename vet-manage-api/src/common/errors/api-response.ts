export type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  code?: string;
  traceId?: string;
};

export function success<T>(data: T, message = 'Operación realizada correctamente', statusCode = 200): ApiResponse<T> {
  return { statusCode, success: true, message, data };
}

export function failure(
  message: string,
  statusCode: number,
  options: Pick<ApiResponse<never>, 'errors' | 'code' | 'traceId'> = {},
): ApiResponse<never> {
  return { statusCode, success: false, message, ...options };
}
