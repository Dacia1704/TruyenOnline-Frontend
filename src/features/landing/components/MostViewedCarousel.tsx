"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getStories } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400 border border-sky-500/30" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
};

export function FeaturedCarousel() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const stepWidthRef = useRef(0);
  const halfLengthRef = useRef(0);
  const isPaused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStories({ isPublished: true, size: 20, sortType: "VIEW" });
        const data = result.data ?? [];
        setStories([...data, ...data]);
      } catch {
        setError("Không tải được truyện đề cử.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loading || stories.length === 0) return;

    const halfLength = stories.length / 2;
    const gap = 16;
    const containerWidth = track.parentElement?.offsetWidth ?? 800;
    const itemWidth = Math.floor((containerWidth - gap * 4) / 5);
    const stepWidth = itemWidth + gap;

    halfLengthRef.current = halfLength;
    stepWidthRef.current = stepWidth;

    const goTo = (index: number) => {
      track.style.transition = "transform 0.5s ease-in-out";
      track.style.transform = `translateX(-${index * stepWidthRef.current}px)`;
      currentIndexRef.current = index;
    };

    const scheduleNext = () => {
      timerRef.current = setTimeout(() => {
        if (!isPaused.current) {
          let next = currentIndexRef.current + 1;
          if (next >= halfLength) {
            next = 0;
            track.style.transition = "none";
            track.style.transform = `translateX(0px)`;
            void track.offsetHeight;
          }
          goTo(next);
        }
        scheduleNext();
      }, 3000);
    };

    const onMouseEnter = () => { isPaused.current = true; };
    const onMouseLeave = () => { isPaused.current = false; };

    const container = containerRef.current;
    container?.addEventListener("mouseenter", onMouseEnter);
    container?.addEventListener("mouseleave", onMouseLeave);

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      container?.removeEventListener("mouseenter", onMouseEnter);
      container?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [loading, stories.length]);

  const scrollRight = () => {
    const track = trackRef.current;
    if (!track || stories.length === 0) return;

    let next = currentIndexRef.current + 1;
    if (next >= halfLengthRef.current) {
      next = 0;
      track.style.transition = "none";
      track.style.transform = `translateX(0px)`;
      void track.offsetHeight;
    }
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${next * stepWidthRef.current}px)`;
    currentIndexRef.current = next;
  };

  const scrollLeft = () => {
    const track = trackRef.current;
    if (!track || stories.length === 0) return;

    const stepWidth = stepWidthRef.current;
    const halfLength = halfLengthRef.current;

    let prev = currentIndexRef.current - 1;
    if (prev < 0) prev = halfLength - 1;
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${prev * stepWidth}px)`;
    currentIndexRef.current = prev;
  };

  return (
    <section className="py-8 px-6 bg-background dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground dark:text-white">Truyện đề cử</h2>
            <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">Những bộ truyện nổi bật được đề cử</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full border border-border dark:border-white/20 bg-background dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition"
              aria-label="Cuộn trái"
            >
              <svg className="w-5 h-5 text-foreground dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full border border-border dark:border-white/20 bg-background dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition"
              aria-label="Cuộn phải"
            >
              <svg className="w-5 h-5 text-foreground dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400 mx-4">
            {error}
          </div>
        )}

        <div ref={containerRef} className="relative group/carousel">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-4 pb-4 px-2"
              style={{ willChange: "transform" }}
            >
              {loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[calc((100%-64px)/5)] rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden"
                  >
                    <div className="h-[280px] bg-muted dark:bg-slate-700 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 bg-muted dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}

              {!loading &&
                stories.map((story, index) => (
                  <Link
                    key={`${story.id}-${index}`}
                    href={`/stories/${story.slug}`}
                    className="flex-shrink-0 w-[calc((100%-64px)/5)] snap-start rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
                  >
                    <div className="relative h-[280px]">
                      {story.coverImageUrl ? (
                        <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <img src="/images/icon/main.png" alt="placeholder" className="w-12 h-12 object-contain opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground dark:text-white line-clamp-1">
                        {story.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusConfig[story.status]?.className ??
                            "bg-muted dark:bg-slate-700 text-foreground dark:text-slate-300"
                          }`}
                        >
                          {statusConfig[story.status]?.text ?? story.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{story.viewCount.toLocaleString()} lượt</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background dark:from-slate-900/80 to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background dark:from-slate-900/80 to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
        </div>
      </div>
    </section>
  );
}
