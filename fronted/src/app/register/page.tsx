"use client";

import React from "react";
import { User, Lock, Mail, Heart } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 定义表单验证规则
const registerSchema = z.object({
  username: z.string()
    .min(2, "用户名至少需要2位字符")
    .max(20, "用户名不能超过20位字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  nickname: z.string()
    .max(20, "昵称不能超过20位字符")
    .optional(),
  email: z.string()
    .email("请输入有效的邮箱地址")
    .min(5, "邮箱地址太短")
    .max(50, "邮箱地址太长"),
  password: z.string()
    .min(6, "密码至少需要6位字符")
    .max(20, "密码不能超过20位字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);

  // 初始化表单
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (data: RegisterFormValues) => {
    setLoading(true);

    try {
      await apiClient.register({
        username: data.username,
        email: data.email,
        password: data.password,
        nickname: data.nickname || undefined
      });
      
      // 注册成功后自动登录
      const loginResponse = await apiClient.login({
        email: data.email,
        password: data.password
      });
      
      localStorage.setItem('auth_token', loginResponse.token);
      localStorage.setItem('user_info', JSON.stringify(loginResponse.user));
      
      router.push('/home');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || '注册失败，请稍后重试'
        : '注册失败，请稍后重试';
      
      // 设置表单错误
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLogin(true);
  };

  React.useEffect(() => {
    if (isLogin) {
      router.push('/login');
    }
  }, [isLogin, router]);

  if (isLogin) {
    return null;
  }

  return (
    <div className="w-full max-w-sm mx-auto min-h-screen bg-page relative flex flex-col items-center px-6">
      {/* Logo和标题 */}
      <div className="mt-16 mb-8 text-center">
        <div className="font-['Pacifico'] text-4xl text-primary mb-2">回忆明信片</div>
        <p className="text-muted-foreground text-sm">如果记忆有声音</p>
      </div>

      {/* 注册表单 */}
      <div className="w-full glass-container-primary rounded-xl p-6 mb-6">
        {/* 切换按钮 */}
        <div className="flex mb-6 bg-secondary/20 rounded-lg p-1">
          <Button 
            variant="ghost"
            className="flex-1 py-2 text-center text-muted-foreground"
            onClick={handleLogin}
          >
            登录
          </Button>
          <Button 
            variant="default"
            className="flex-1 py-2 text-center rounded-lg"
            onClick={() => setIsLogin(false)}
          >
            注册
          </Button>
        </div>

        {/* 根级错误显示 */}
        {form.formState.errors.root && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{form.formState.errors.root.message}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">用户名</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        placeholder="请输入用户名"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">昵称</FormLabel>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        placeholder="请输入昵称（可选）"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">邮箱</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        placeholder="请输入邮箱地址"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">密码</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码（至少6位）"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">确认密码</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请确认密码"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>
        </Form>
      </div>

      {/* 其他登录方式 */}
      <div className="w-full text-center mb-6">
        <p className="text-muted-foreground text-sm mb-4">其他登录方式</p>
        <div className="flex justify-center space-x-8">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full glass-container-secondary">
            <i className="fab fa-weixin text-muted-foreground"></i>
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full glass-container-secondary">
            <i className="fab fa-qq text-muted-foreground"></i>
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full glass-container-secondary">
            <i className="fab fa-weibo text-muted-foreground"></i>
          </Button>
        </div>
      </div>

      {/* 底部链接 */}
      <div className="w-full text-center">
        <p className="text-muted-foreground text-xs">
          注册即代表同意{" "}
          <a href="#" className="text-primary">用户协议</a>
          {" "}和{" "}
          <a href="#" className="text-primary">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
