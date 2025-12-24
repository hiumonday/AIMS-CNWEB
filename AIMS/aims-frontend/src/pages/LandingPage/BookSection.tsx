import { useState, type CSSProperties, type FC, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { LandingSectionProps } from './types';
import './BookSection.css';

export const bookTheme = {
  key: 'book',
  label: 'Book',
  searchKey: 'Book',
  heroWord: 'Library',
  headline: 'Sách cổ điển pha hiện đại',
  description: 'Ấn bản đẹp, giấy mịn, typography tinh tế cho trải nghiệm đọc sâu.',
  accent: '#b58b5a',
  light: '#f7efe6',
  dark: '#3b2e26',
  word: 'rgba(0, 0, 0, 0.08)',
  heroImage:
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  badges: ['Bìa cứng & mềm', 'Tác phẩm kinh điển', 'Ấn bản giới hạn'],
  metrics: [
    { value: '200+', label: 'Tựa sách tinh tuyển' },
    { value: '4 chủ đề', label: 'Văn học · kỹ năng' },
    { value: '24h', label: 'Xác nhận nhanh' },
  ],
  callouts: [
    {
      title: 'Ấn bản đặc biệt',
      text: 'Cover dập nổi',
      style: { top: '10%', right: '6%' },
    },
  ],
  featureTitle: 'Trải nghiệm đọc tinh tế',
  featureCopy:
    'Chọn theo tác giả, nhà xuất bản, ngôn ngữ; thông tin rõ ràng.',
  features: [
    {
      title: 'Sách kinh điển',
      text: 'Văn học, triết học, lịch sử.',
      image:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Ấn bản hiện đại',
      text: 'Thiết kế bìa tối giản, đẹp mắt.',
      image:
        'https://images.unsplash.com/photo-1455885661740-29cbf08a42f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Đọc sâu, đọc lâu',
      text: 'Giấy mịn, chữ sắc nét.',
      image:
        'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

const InteractiveBook = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageNum, setPageNum] = useState(0);

  const handleBookClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleNextPage = (event: MouseEvent) => {
    event.stopPropagation();
    if (pageNum < 3) setPageNum(pageNum + 1);
  };

  const handlePrevPage = (event: MouseEvent) => {
    event.stopPropagation();
    if (pageNum > 0) setPageNum(pageNum - 1);
  };

  const handleCloseBook = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    setPageNum(0);
  };

  return (
    <div className="book-scene">
      <div
        className={`book-object ${isOpen ? 'is-open' : ''}`}
        onClick={handleBookClick}
      >
        <div className="book-cover back"></div>

        <div
          className={`book-page page-3 ${pageNum >= 3 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 3 ? 4 : 1 }}
          onClick={pageNum >= 3 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 3: Kết nối</h4>
              <img
                src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80"
                alt="Connect"
              />
              <p>Sách không chỉ là giấy mực, đó là cầu nối giữa những tâm hồn đồng điệu.</p>
              <span className="page-number">3</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

        <div
          className={`book-page page-2 ${pageNum >= 2 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 2 ? 5 : 2 }}
          onClick={pageNum >= 2 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 2: Khám phá</h4>
              <img
                src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=300&q=80"
                alt="Explore"
              />
              <p>Mỗi trang sách mở ra một chân trời mới, đưa ta đến những miền đất lạ.</p>
              <span className="page-number">2</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

        <div
          className={`book-page page-1 ${pageNum >= 1 ? 'flipped' : ''}`}
          style={{ zIndex: pageNum >= 1 ? 6 : 3 }}
          onClick={pageNum >= 1 ? handlePrevPage : handleNextPage}
        >
          <div className="page-front">
            <div className="page-content">
              <h4>Chương 1: Khởi đầu</h4>
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=300&q=80"
                alt="Start"
              />
              <p>Chào mừng bạn đến với AIMS. Nơi lưu giữ những giá trị văn hóa vượt thời gian.</p>
              <span className="page-number">1</span>
            </div>
          </div>
          <div className="page-back"></div>
        </div>

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
            <div className="ex-libris">
              <span>Thuộc về thư viện:</span>
              <strong>AIMS Member</strong>
            </div>
          </div>
        </div>
      </div>

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

const BookSection: FC<LandingSectionProps> = ({
  style,
  heroStyle,
  contentStyle,
  scrollHint,
  wordStyle,
}) => {
  return (
    <section className="theme theme--book" style={style}>
      <div className="theme__hero" style={heroStyle}>
        <div className="theme__hero-left">
          <div className="theme__eyebrow">AIMS MEDIA · {bookTheme.label}</div>
          <h1>{bookTheme.headline}</h1>
          <p>{bookTheme.description}</p>
          <div className="theme__actions">
            <Link
              className="btn primary"
              to={`/products?query=${bookTheme.searchKey ?? bookTheme.label}`}
            >
              Khám phá {bookTheme.label}
            </Link>
            <Link className="btn light" to="/products">
              Xem tất cả
            </Link>
          </div>
          <div className="theme__badges">
            {bookTheme.badges.map((badge) => (
              <span key={badge} className="theme__badge">
                {badge}
              </span>
            ))}
          </div>
          <div className="theme__metrics">
            {bookTheme.metrics.map((metric) => (
              <div key={metric.label} className="theme__metric">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="theme__hero-right">
          <div className="theme__hero-word" style={wordStyle}>
            {bookTheme.heroWord}
          </div>
          <div
            className="theme__hero-figure theme__hero-figure--book"
            style={{ '--hero-image': `url(${bookTheme.heroImage})` } as CSSProperties}
            aria-hidden="true"
          >
            <InteractiveBook />
          </div>
          {bookTheme.callouts.map((callout) => (
            <div key={callout.title} className="theme__callout" style={callout.style}>
              <strong>{callout.title}</strong>
              <span>{callout.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="theme__content" style={contentStyle}>
        <div className="theme__content-head">
          <h2>{bookTheme.featureTitle}</h2>
          <p>{bookTheme.featureCopy}</p>
        </div>
        <div className="theme__content-grid">
          {bookTheme.features.map((feature) => (
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
        <span>{scrollHint}</span>
        <div className="theme__scroll-indicator">
          <span></span>
        </div>
      </div>
    </section>
  );
};

export default BookSection;
