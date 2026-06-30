import { AuthLayout, RegisterForm } from "@/features/auth";

export const metadata = {
  title: "Đăng ký | Truyện Online",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia cộng đồng đọc truyện TruyệnOnline"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
