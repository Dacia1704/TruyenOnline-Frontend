"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getUserInfo } from "@/lib/api/client";
import { getActiveBanners, type Banner } from "@/lib/api/banner";

export function Hero() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = getUserInfo();
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const activeBanners = await getActiveBanners();
        const heroBanners = activeBanners
          .filter((b) => b.position === "HOME_HERO" && b.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        setBanners(heroBanners);
      } catch {
        // Failed to fetch banners
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextBanner = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const interval = setInterval(nextBanner, 4000);
    return () => clearInterval(interval);
  }, [nextBanner]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollToFeatured = () => {
    document.getElementById("featured-stories")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, banner.linkUrl.startsWith("http") ? "_blank" : "_self");
    }
  };

  return (
    <section className="relative">
      <div className="relative h-[680px] sm:h-[760px] md:h-[860px] overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        ) : banners.length === 0 ? (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white/60">
              <p className="text-lg">Không có banner nào</p>
            </div>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                onClick={() => handleBannerClick(banner)}
                className="w-full h-full cursor-pointer"
              >
                <img
                  src={banner.bannerUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>
          ))
        )}

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
            Khám phá thế giới
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              truyện tuyệt vời
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl drop-shadow-lg">
            Đọc truyện chữ, light novel và manga miễn phí. Bookmark, bình luận và trải nghiệm không giới hạn.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={scrollToFeatured}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/40 transition hover:scale-105 hover:shadow-indigo-500/60 cursor-pointer"
            >
              Khám phá ngay
            </button>
            {isLoggedIn ? (
              <Link
                href="/stories"
                className="w-full sm:w-auto rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Kho truyện
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Đăng ký miễn phí
              </Link>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-gradient-to-r from-indigo-400 to-purple-400"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/30 backdrop-blur-sm p-2 text-white/80 hover:bg-black/50 hover:text-white transition"
              aria-label="Previous banner"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/30 backdrop-blur-sm p-2 text-white/80 hover:bg-black/50 hover:text-white transition"
              aria-label="Next banner"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
