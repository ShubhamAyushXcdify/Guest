
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LoginMutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

type UserFormData = {
  email: string;
  password: string;
}


export const loginUser = async (data: UserFormData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to login user');
  }

  return response.json();
};

export const useLoginMutation = (config?: LoginMutationConfig) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries(); 
      if (data && typeof data === 'object' && 'user' in data) {
        queryClient.setQueryData(['user'], data.user);
      }
      if (config?.onSuccess) {
        config.onSuccess(data);
      }
      queryClient.invalidateQueries({ queryKey: ['permission'] });
    },
    onError: (error: any) => {
      if (config?.onError) {
        config.onError(error);
      }
    }
  });
};


