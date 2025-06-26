import { useMutation } from '@tanstack/react-query';

type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
};

type ResetPasswordConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await fetch('/api/auth/ResetPassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to reset password');
  }

  return response.json();
};

export const useResetPasswordMutation = (config?: ResetPasswordConfig) => {
  return useMutation({
    mutationFn: resetPassword,
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
