import { AuthLayout, LoginForm } from "@/features/auth";

export const metadata = {
  title: "Đăng nhập | Truyện Online",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục đọc truyện yêu thích"
    >
      <LoginForm />
    </AuthLayout>
  );
}
