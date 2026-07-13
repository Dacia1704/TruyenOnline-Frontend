const features = [
  {
    icon: null,
    title: "Truyện chữ & Manga",
    description: "Đọc truyện chữ, light novel và manga với giao diện tối ưu cho mọi thiết bị.",
  },
  {
    icon: null,
    title: "Tủ truyện cá nhân",
    description: "Lưu bookmark, theo dõi tiến độ đọc và quản lý danh sách yêu thích.",
  },
  {
    icon: null,
    title: "Gói Premium",
    description: "Mở khóa chapter premium, đọc không giới hạn chương truyện với thanh toán VNPay an toàn.",
  },
];

export function Features() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">Tại sao chọn TruyệnOnline?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Nền tảng đọc truyện hiện đại, được thiết kế cho trải nghiệm đọc mượt mà và an toàn.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              {feature?.icon && (
                <span className="text-3xl" role="img" aria-hidden>
                  {feature.icon}
                </span>
              )}
              <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
