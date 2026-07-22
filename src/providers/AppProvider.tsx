"use client"; // Bắt buộc phải có vì Provider chạy ở Client Side

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import ThemeProvider from "./ThemeProvider";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  // Đảm bảo mỗi request có 1 QueryClient riêng biệt, không bị leak data giữa các user
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Dữ liệu cũ sau 1 phút
            refetchOnWindowFocus: false, // Không tự re-fetch khi chuyển tab
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
