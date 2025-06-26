"use client";
import React from 'react';
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLoginMutation } from "@/queries/auth/login-user";
import { useRouter } from "next/navigation";
import { setJwtToken, setUserId, setClientId } from '@/utils/clientCookie';
import { Loader2 } from 'lucide-react';
// import { useQueryState } from 'nuqs';
import { useToast } from '@/hooks/use-toast';
import { useRootContext } from '@/context/RootContext';

const loginSchema = z.object({
  email: z.string().min(2, {
    message: "Email is required.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 8 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setUser, fetchUser } = useRootContext();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation({
    onSuccess: (data: any) => {
      setJwtToken(data.token);
      setUserId(data.user.id);

      if(data.user.roleName === "Client"){
        setClientId(data.user.id);
      }
      fetchUser(data, data.user.roleName); 
      router.push(data.redirectUrl ? data.redirectUrl : "/dashboard");
    },
    onError: (error: any) => {
      toast({
        description: error.message,
        variant: 'destructive',
        duration: 3000,
      })
    }
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values as any);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl mx-auto">Login</CardTitle>
        <CardDescription className="mx-auto text-center">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} data-testid="email-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline theme-text-accent hover:text-primary/80"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} data-testid="password-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="login-submit">
              {loginMutation.isPending ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
          </form>
        </Form>
        {/* <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline" data-testid="register-link">
            Register here
          </Link>
        </div> */}
      </CardContent>
    </Card>
  );
}
