import { useMutation } from '@tanstack/react-query';

type VerifyResetOtpData = {
  email: string;
  otp: string;
};

type VerifyResetOtpConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const verifyResetOtp = async (data: VerifyResetOtpData) => {
  const response = await fetch('/api/auth/VerifyResetOtp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to verify OTP');
  }

  return response.json();
};

export const useVerifyResetOtpMutation = (config?: VerifyResetOtpConfig) => {
  return useMutation({
    mutationFn: verifyResetOtp,
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
