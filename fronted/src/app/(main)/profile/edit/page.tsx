"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Camera, Check, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import BottomNavigation from "@/components/BottomNavigation";

// 表单验证模式
const profileSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(20, "昵称不能超过20个字符"),
  signature: z.string().max(100, "个性签名不能超过100个字符").optional(),
  avatar_url: z.string().url("头像链接格式不正确").optional().or(z.literal("")),
  language: z.enum(["zh", "en", "ja", "ko"]).optional(),
  font_size: z.enum(["small", "medium", "large"]).optional(),
  dark_mode: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      signature: "",
      avatar_url: "",
      language: "zh",
      font_size: "medium",
      dark_mode: false,
    },
  });

  const watchedValues = watch();

  // 加载用户数据
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await apiClient.getUserProfile();
        const formData = {
          nickname: userData.nickname || "",
          signature: userData.signature || "",
          avatar_url: userData.avatar_url || "",
          language: (userData.language as "zh" | "en" | "ja" | "ko") || "zh",
          font_size: (userData.font_size as "small" | "medium" | "large") || "medium",
          dark_mode: userData.dark_mode || false,
        };
        setInitialData(formData);
        reset(formData);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        toast.error("加载用户信息失败");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [reset]);

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await apiClient.uploadAvatar(file);
      setValue("avatar_url", response.url, { shouldDirty: true });
      toast.success("头像上传成功");
    } catch (error) {
      toast.error("头像上传失败");
      console.error(error);
    } finally {
      setAvatarLoading(false);
    }
  };

  // 提交表单
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await apiClient.updateUserProfile(data);
      toast.success("资料更新成功");
      router.back();
    } catch (error) {
      toast.error("资料更新失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (isDirty) {
      if (confirm("您有未保存的更改，确定要离开吗？")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (loading && !initialData) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-page">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-page font-base pb-20">
        {/* 顶部导航栏 */}
        <nav className="fixed top-0 w-full z-50 glass-container-primary px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={handleCancel} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 color-text-primary" />
            </button>
            <h1 className="text-lg font-semibold color-text-primary">编辑资料</h1>
            <button 
              type="submit" 
              form="profile-form"
              className="w-8 h-8 flex items-center justify-center"
              disabled={loading || !isDirty}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin color-text-primary" />
              ) : (
                <Check className="w-5 h-5 color-text-primary" />
              )}
            </button>
          </div>
        </nav>

        <main className="pt-[60px] pb-[80px] px-6">
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="settings">偏好设置</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>个人信息</CardTitle>
                    <CardDescription>编辑您的基本信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 头像上传 */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden mb-4">
                        <Avatar className="w-full h-full">
                          <AvatarImage src={watchedValues.avatar_url || "/default-avatar.png"} />
                          <AvatarFallback>
                            <User className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                        {avatarLoading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={avatarLoading || loading}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        点击相机图标上传头像<br />
                        支持 JPG、PNG 格式，大小不超过 5MB
                      </p>
                    </div>

                    {/* 昵称 */}
                    <div className="space-y-2">
                      <Label htmlFor="nickname">昵称 *</Label>
                      <Input
                        id="nickname"
                        {...register("nickname")}
                        placeholder="请输入昵称"
                        disabled={loading}
                        className={errors.nickname ? "border-destructive" : ""}
                      />
                      {errors.nickname && (
                        <p className="text-sm text-destructive">{errors.nickname.message}</p>
                      )}
                    </div>

                    {/* 个性签名 */}
                    <div className="space-y-2">
                      <Label htmlFor="signature">个性签名</Label>
                      <Textarea
                        id="signature"
                        {...register("signature")}
                        placeholder="请输入个性签名"
                        rows={3}
                        disabled={loading}
                        className={errors.signature ? "border-destructive" : ""}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{errors.signature?.message}</span>
                        <span>{watchedValues.signature?.length || 0}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>偏好设置</CardTitle>
                    <CardDescription>自定义您的使用偏好</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 语言设置 */}
                    <div className="space-y-2">
                      <Label htmlFor="language">界面语言</Label>
                      <Select
                        value={watchedValues.language}
                        onValueChange={(value) => setValue("language", value as any, { shouldDirty: true })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 字体大小 */}
                    <div className="space-y-2">
                      <Label htmlFor="font_size">字体大小</Label>
                      <Select
                        value={watchedValues.font_size}
                        onValueChange={(value) => setValue("font_size", value as any, { shouldDirty: true })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择字体大小" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">小</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="large">大</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 深色模式 */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark_mode">深色模式</Label>
                        <p className="text-sm text-muted-foreground">
                          启用深色主题以保护您的眼睛
                        </p>
                      </div>
                      <Switch
                        id="dark_mode"
                        checked={watchedValues.dark_mode}
                        onCheckedChange={(checked) => setValue("dark_mode", checked, { shouldDirty: true })}
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 错误提示 */}
            {Object.keys(errors).length > 0 && (
              <div className="relative w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    请检查并修正表单中的错误
                  </p>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
                disabled={loading}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading || !isDirty}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存修改"
                )}
              </Button>
            </div>
          </form>
        </main>

        {/* 底部导航 */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
