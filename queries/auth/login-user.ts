
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
    let message = 'Failed to login user';
    try {
      const errorData = await response.json();
      message = errorData?.error || errorData?.message || message;
    } catch {
      // Ignore JSON parse errors and use fallback message
    }

    const error: any = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const useLoginMutation = (config?: LoginMutationConfig) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    retry: false,
    onSuccess: (data: any) => {
      // Only invalidate specific queries that need to be refreshed after login
      // Avoid invalidating all queries which causes massive refetch cascade
      if (data && typeof data === 'object' && 'user' in data) {
        queryClient.setQueryData(['user'], data.user);
      }
      // Only invalidate permission-related queries, not everything
      queryClient.invalidateQueries({ queryKey: ['permission'] });
      // Clear any stale data that might be user-specific
      queryClient.removeQueries({ queryKey: ['appointment'] });
      queryClient.removeQueries({ queryKey: ['patient'] });
      queryClient.removeQueries({ queryKey: ['client'] });
      
      if (config?.onSuccess) {
        config.onSuccess(data);
      }
    },
    onError: (error: any) => {
      if (config?.onError) {
        config.onError(error);
      }
    }
  });
};

