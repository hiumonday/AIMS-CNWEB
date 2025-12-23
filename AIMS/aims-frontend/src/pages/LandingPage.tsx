import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Interactive 3D Book component
const InteractiveBook = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageNum, setPageNum] = useState(0); // 0: Bìa, 1: Trang 1, 2: Trang 2...

  const handleBookClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pageNum < 3) setPageNum(pageNum + 1);
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pageNum > 0) setPageNum(pageNum - 1);
  };

  const handleCloseBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setPageNum(0);
  };

  return (
    <div className="book-scene">
      <div
        className={`book-object ${isOpen ? 'is-open' : ''}`}
        onClick={handleBookClick}
      >
        {/* --- BÌA SAU (Cố định) --- */}
        <div className="book-cover back"></div>

        {/* --- TRANG 3 --- */}
        <div
          className={`book-page page-3 ${pageNum >= 3 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 3 ? 4 : 1 }}
          onClick={pageNum >= 3 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 3: Kết nối</h4>
              <img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80" alt="Connect" />
              <p>Sách không chỉ là giấy mực, đó là cầu nối giữa những tâm hồn đồng điệu.</p>
              <span className="page-number">3</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

        {/* --- TRANG 2 --- */}
        <div
          className={`book-page page-2 ${pageNum >= 2 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 2 ? 5 : 2 }}
          onClick={pageNum >= 2 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 2: Khám phá</h4>
              <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=300&q=80" alt="Explore" />
              <p>Mỗi trang sách mở ra một chân trời mới, đưa ta đến những miền đất lạ.</p>
              <span className="page-number">2</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

        {/* --- TRANG 1 --- */}
        <div
          className={`book-page page-1 ${pageNum >= 1 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 1 ? 6 : 3 }}
          onClick={pageNum >= 1 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 1: Khởi đầu</h4>
              <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=300&q=80" alt="Start" />
              <p>Chào mừng bạn đến với AIMS. Nơi lưu giữ những giá trị văn hóa vượt thời gian.</p>
              <span className="page-number">1</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

        {/* --- BÌA TRƯỚC (Front Cover) --- */}
        <div
          className={`book-cover front ${isOpen ? 'flipped' : ''}`}
          style={{ zIndex: 10 }}
        >
          <div className="cover-face front-face">
            <div className="cover-design">
              <div className="cover-frame">
                <span className="author">AIMS EDITION</span>
                <h3 className="title">THE<br />AIMS</h3>
                <div className="ornament">✻</div>
                <span className="year">EST. 2025</span>
              </div>
            </div>
            <div className="spine-left"></div>
          </div>
          <div className="cover-face back-face">
            {/* Mặt trong của bìa trước */}
            <div className="ex-libris">
              <span>Thuộc về thư viện:</span>
              <strong>AIMS Member</strong>
            </div>
          </div>
        </div>

      </div>

      {/* --- Nút điều khiển bên ngoài --- */}
      <div className="book-controls">
        {!isOpen ? (
          <span className="hint-text">Click vào sách để mở</span>
        ) : (
          <button className="close-btn" onClick={handleCloseBook}>
            Đóng sách
          </button>
        )}
      </div>
    </div>
  );
};


const themes = [
  {
    key: 'dvd',
    label: 'DVD',
    heroWord: 'Cinema',
    headline: 'DVD kinh điển cho đêm phim tại nhà',
    description:
      'Blu-ray remaster, phụ đề rõ ràng, đóng gói chuẩn hãng để giữ trọn chất lượng.',
    accent: '#d46b4f',
    light: '#f5f1ea',
    dark: '#2c2b29',
    word: 'rgba(255, 255, 255, 0.18)',
    heroImage:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    heroAlt: 'Không gian rạp phim',
    badges: ['Phụ đề song ngữ', 'Boxset giới hạn', 'Đĩa chuẩn hãng'],
    metrics: [
      { value: '180+', label: 'Tựa phim nổi bật' },
      { value: '4K', label: 'Remaster sắc nét' },
      { value: '2-4 ngày', label: 'Giao nhanh toàn quốc' },
    ],
    callouts: [
      {
        title: 'Âm thanh mạnh',
        text: 'Dolby & DTS đầy đủ',
        style: { top: '12%', right: '6%' },
      },
      {
        title: 'Đóng gói kỹ',
        text: 'Bảo vệ mặt đĩa tối ưu',
        style: { bottom: '18%', left: '2%' },
      },
    ],
    featureTitle: 'Điện ảnh sắc nét, cảm giác như rạp',
    featureCopy:
      'Chọn nhanh theo chủ đề, diễn viên hoặc nhà sản xuất. Mỗi bộ đều có mô tả chi tiết.',
    features: [
      {
        title: 'Hình ảnh remaster',
        text: 'Tăng độ tương phản và màu sắc tự nhiên.',
        image:
          'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Phụ đề chuẩn',
        text: 'Đầy đủ phụ đề, dễ theo dõi nội dung.',
        image:
          'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Tuyển tập theo gu',
        text: 'Gợi ý các bộ sưu tập theo mùa.',
        image:
          'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    key: 'cd',
    label: 'CD',
    heroWord: 'Sound',
    headline: 'CD tuyển tập cho mọi khoảnh khắc nghe',
    description:
      'Album jazz, pop, classical được chọn lọc kỹ. Tracklist rõ ràng, chất âm ổn định.',
    accent: '#59b79b',
    light: '#eef4f2',
    dark: '#163e3a',
    word: 'rgba(255, 255, 255, 0.2)',
    heroImage:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    heroAlt: 'Bàn phối nhạc và tai nghe',
    badges: ['Album chọn lọc', 'Chất âm sạch', 'Gói quà miễn phí'],
    metrics: [
      { value: '150+', label: 'Album nổi bật' },
      { value: 'Hi-Fi', label: 'Âm thanh chi tiết' },
      { value: '15%', label: 'Ưu đãi combo' },
    ],
    callouts: [
      {
        title: 'Playlist mùa lễ',
        text: 'Jazz & pop nhẹ nhàng',
        style: { top: '8%', left: '8%' },
      },
      {
        title: 'Tracklist rõ ràng',
        text: 'Mỗi bài đều có thời lượng',
        style: { bottom: '16%', right: '4%' },
      },
    ],

    features: [
    ],
  },
  {
    key: 'book',
    label: 'Book',
    heroWord: 'Books',
    headline: 'Sách tuyển chọn cho người yêu chữ',
    description:
      'Bìa đẹp, giấy in chuẩn, thông tin phát hành rõ ràng. Từ sách mới đến sưu tầm.',
    accent: '#c7995d',
    light: '#f7f1e8',
    dark: '#3a2f28',
    word: 'rgba(255, 255, 255, 0.2)',
    heroImage:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    heroAlt: 'Chồng sách dưới ánh đèn',
    badges: ['Bìa cứng & mềm', 'Ngôn ngữ đa dạng', 'Phân loại rõ ràng'],
    metrics: [
      { value: '200+', label: 'Tựa sách chọn lọc' },
      { value: '4 thể loại', label: 'Đa dạng chủ đề' },
      { value: '24h', label: 'Xác nhận đơn nhanh' },
    ],
    callouts: [

    ],
    featureTitle: 'Tập trung vào trải nghiệm đọc',
    featureCopy:
      'Chọn nhanh theo tác giả, nhà xuất bản và ngôn ngữ. Thông tin đầy đủ, dễ kiểm.',
    features: [
      {
        title: 'Sách kinh điển',
        text: 'Danh mục văn học, triết học, lịch sử.',
        image:
          'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Ấn phẩm báo',
        text: 'Lưu giữ số báo theo từng kỳ.',
        image:
          'https://images.unsplash.com/photo-1455885660973-9f3f90e2d1de?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Sách mới mỗi tuần',
        text: 'Liên tục cập nhật theo kho hàng.',
        image:
          'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

const LandingPage = () => {
  const scrollyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const applySnap = (value: number) => {
      const nearest = Math.round(value);
      const distance = Math.abs(value - nearest);
      const threshold = 0.25;
      if (distance >= threshold) {
        return value;
      }
      const eased = (distance / threshold) ** 2;
      return nearest + (value - nearest) * eased;
    };

    const updateProgress = () => {
      frameId = 0;
      if (!scrollyRef.current) {
        return;
      }
      const container = scrollyRef.current;
      const start = container.offsetTop;
      const total = container.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const raw = (window.scrollY - start) / total;
      const clamped = Math.min(Math.max(raw, 0), 1);
      const next = applySnap(clamped * (themes.length - 1));
      setProgress((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const getPanelMotion = (index: number) => {
    const offset = progress - index;
    const clamped = Math.max(-1, Math.min(1, offset));
    const translateX = clamped < 0 ? -clamped * 100 : -clamped * 30;
    const opacity = clamped < 0 ? 1 + clamped : 1 - clamped;
    const depth = Math.min(1, Math.abs(clamped));
    return { offset, clamped, translateX, opacity: Math.max(0, opacity), depth };
  };

  return (
    <main className="landing landing--scrolly">
      <div
        ref={scrollyRef}
        className="scrolly"
        style={{ '--scrolly-panels': themes.length } as CSSProperties}
      >
        <div className="scrolly__stage">
          {themes.map((theme, index) => {
            const motion = getPanelMotion(index);
            const themeStyle = {
              '--theme-light': theme.light,
              '--theme-dark': theme.dark,
              '--theme-accent': theme.accent,
              '--theme-word': theme.word,
              transform: `translateX(${motion.translateX}%)`,
              opacity: motion.opacity,
              zIndex: 100 - Math.round(Math.abs(motion.offset) * 10) + (motion.offset < 0 ? 1 : 0),
              pointerEvents: Math.abs(motion.offset) < 0.6 ? 'auto' : 'none',
            } as CSSProperties;
            const heroStyle = {
              transform: `translateX(${motion.clamped * 16}px)`,
              opacity: 1 - motion.depth * 0.2,
            };
            const contentStyle = {
              transform: `translateX(${motion.clamped * 10}px)`,
              opacity: 1 - motion.depth * 0.25,
            };
            const wordShift = motion.clamped * 30;
            const wordStyle = {
              transform:
                theme.key === 'cd'
                  ? `translateX(-50%) translateX(${wordShift}px)`
                  : `translateX(${wordShift}px)`,
            };

            return (
              <section
                key={theme.key}
                className={`theme theme--${theme.key}`}
                style={themeStyle}
              >
                <div className="theme__hero" style={heroStyle}>
                  <div className="theme__hero-left">
                    <div className="theme__eyebrow">AIMS MEDIA · {theme.label}</div>
                    <h1>{theme.headline}</h1>
                    <p>{theme.description}</p>
                    <div className="theme__actions">
                      <Link className="btn primary" to={`/products?query=${theme.label}`}>
                        Khám phá {theme.label}
                      </Link>
                      <Link className="btn light" to="/products">
                        Xem tất cả
                      </Link>
                    </div>
                    <div className="theme__badges">
                      {theme.badges.map((badge) => (
                        <span key={badge} className="theme__badge">
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="theme__metrics">
                      {theme.metrics.map((metric) => (
                        <div key={metric.label} className="theme__metric">
                          <strong>{metric.value}</strong>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="theme__hero-right">
                    <div className="theme__hero-word" style={wordStyle}>
                      {theme.heroWord}
                    </div>
                    <div
                      className={`theme__hero-figure theme__hero-figure--${theme.key}`}
                      style={{ '--hero-image': `url(${theme.heroImage})` } as CSSProperties}
                      aria-hidden="true"
                    >
                      {theme.key === 'book' ? (
                        <InteractiveBook />
                      ) : (
                        <div className={`theme__disc theme__disc--${theme.key}`}>
                          <span className="theme__disc-highlight" aria-hidden="true"></span>
                          <span className="theme__disc-label"></span>
                        </div>
                      )}
                    </div>
                    {theme.callouts.map((callout) => (
                      <div
                        key={callout.title}
                        className="theme__callout"
                        style={callout.style}
                      >
                        <strong>{callout.title}</strong>
                        <span>{callout.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="theme__content" style={contentStyle}>
                  <div className="theme__content-head">
                    <h2>{theme.featureTitle}</h2>
                    <p>{theme.featureCopy}</p>
                  </div>
                  <div className="theme__content-grid">
                    {theme.features.map((feature) => (
                      <article key={feature.title} className="theme__feature-card">
                        <div className="theme__feature-media">
                          <img src={feature.image} alt={feature.title} loading="lazy" />
                        </div>
                        <div className="theme__feature-body">
                          <h3>{feature.title}</h3>
                          <p>{feature.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="theme__scroll-hint">
                  <span>
                    {index < themes.length - 1
                      ? 'Cuộn để xem chủ đề tiếp theo'
                      : 'Cuộn xuống phần email'}
                  </span>
                  <div className="theme__scroll-indicator">
                    <span></span>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section className="landing__newsletter">
        <div className="landing__newsletter-inner">
          <div>
            <p className="landing__newsletter-eyebrow">AIMS MEDIA</p>
            <h2>Nhận email cập nhật ưu đãi mới</h2>
            <p>
              Gửi cho bạn các bộ sưu tập mới, ưu đãi theo mùa và gợi ý phù hợp gu
              nghe, gu đọc.
            </p>
          </div>
          <form
            className="landing__newsletter-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <input type="email" placeholder="Email của bạn" required />
            <button className="btn primary" type="submit">
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
