"use client";

import React from "react";
import { Mail, Lock } from "lucide-react";
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
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/reducers/auth";

// 定义表单验证规则
const loginSchema = z.object({
  email: z.string()
    .email("请输入有效的邮箱地址")
    .min(5, "邮箱地址太短")
    .max(50, "邮箱地址太长"),
  password: z.string()
    .min(6, "密码至少需要6位字符")
    .max(20, "密码不能超过20位字符"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);

  // 初始化表单
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);

    try {
      const response = await apiClient.login({ email: data.email, password: data.password });
      
      // 保存token和用户信息到localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_info', JSON.stringify(response.user));
      
      // 更新Redux store状态
      dispatch(loginSuccess({
        user: response.user,
        token: response.token
      }));
      
      // 跳转到首页
      router.push('/home');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || '登录失败，请检查手机号和密码'
        : '登录失败，请检查手机号和密码';
      
      // 设置表单错误
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    setIsLogin(false);
  };

  React.useEffect(() => {
    if (!isLogin) {
      router.push('/register');
    }
  }, [isLogin, router]);

  if (!isLogin) {
    return null;
  }

  return (
    <div className="w-full max-w-sm mx-auto min-h-screen bg-page relative flex flex-col items-center px-6">
      {/* Logo和标题 */}
      <div className="mt-16 mb-8 text-center">
        <div className="font-['Pacifico'] text-4xl text-primary mb-2">回忆小卖部</div>
        <p className="text-muted-foreground text-sm">如果记忆有声音</p>
      </div>

      {/* 登录表单 */}
      <div className="w-full glass-container-primary rounded-xl p-6 mb-6">
        {/* 切换按钮 */}
        <div className="flex mb-6 bg-secondary/20 rounded-lg p-1">
          <Button 
            variant="default"
            className="flex-1 py-2 text-center rounded-lg"
            onClick={() => setIsLogin(true)}
          >
            登录
          </Button>
          <Button 
            variant="ghost"
            className="flex-1 py-2 text-center text-muted-foreground"
            onClick={handleRegister}
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
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">邮箱</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入邮箱地址"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background/50 backdrop-filter backdrop-blur-sm text-foreground placeholder:text-muted-foreground border-border"
                        {...field}
                      />
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
                  <FormLabel className="sr-only">密码</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码"
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
              {loading ? "登录中..." : "登录"}
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
        <Button variant="link" className="text-primary text-sm">忘记密码？</Button>
        <p className="text-muted-foreground text-xs mt-2">
          登录即代表同意{" "}
          <a href="#" className="text-primary">用户协议</a>
          {" "}和{" "}
          <a href="#" className="text-primary">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
