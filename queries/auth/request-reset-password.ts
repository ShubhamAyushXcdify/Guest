import { useMutation } from '@tanstack/react-query';

type RequestResetPasswordData = {
  email: string;
};

type RequestResetPasswordConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const requestResetPassword = async (data: RequestResetPasswordData) => {
  const response = await fetch('/api/auth/RequestResetPassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to request password reset');
  }

  return response.json();
};

export const useRequestResetPasswordMutation = (config?: RequestResetPasswordConfig) => {
  return useMutation({
    mutationFn: requestResetPassword,
    onSuccess: (data) => {
      if (config?.onSuccess) {
        config.onSuccess(data);
      }
    },
    onError: (error) => {
      if (config?.onError) {
        config.onError(error);
      }
    },
  });
};
