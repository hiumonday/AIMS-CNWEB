import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router-dom';
import InteractiveNewspaper from '../../components/InteractiveNewspaper';
import type { LandingSectionProps } from './types';
import './NewspaperSection.css';

export const newspaperTheme = {
  key: 'newspaper',
  label: 'Tạp chí',
  searchKey: 'Newspaper',
  heroWord: 'Press',
  headline: 'Tạp chí năng động, cập nhật mỗi ngày',
  description: 'Bố cục nhanh, điểm tin rõ, chuyên mục trending, đọc lướt dễ.',
  accent: '#1e7fbf',
  light: '#f6f1e8',
  dark: '#16233a',
  word: 'rgba(0, 0, 0, 0.08)',
  heroImage:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  badges: ['Tin nhanh', 'Phóng sự', 'Ảnh đặc tả'],
  metrics: [
    { value: '24h', label: 'Tin mới mỗi ngày' },
    { value: '50+', label: 'Chuyên mục trend' },
    { value: '15k', label: 'Giá từ 15.000' },
  ],
  callouts: [
    {
      title: 'Breaking',
      text: 'Tin nóng 24h',
      style: { top: '12%', right: '8%' },
    },
    {
      title: 'Chuyên đề ảnh',
      text: 'Visual storytelling',
      style: { bottom: '14%', left: '4%' },
    },
  ],
  featureTitle: 'Đọc nhanh, bắt trend nhanh',
  featureCopy: 'Highlight chủ đề, bố cục theo nhịp đọc, giữ cảm giác báo giấy.',
  features: [
    {
      title: 'Headline nổi bật',
      text: 'Điểm tin chính cô đọng.',
      image:
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Chuyên mục tuần',
      text: 'Kinh tế, văn hóa, đời sống.',
      image:
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Ảnh phóng sự',
      text: 'Bố cục mạnh, dễ lưu trữ.',
      image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

const NewspaperSection: FC<LandingSectionProps> = ({
  style,
  heroStyle,
  contentStyle,
  scrollHint,
  wordStyle,
}) => {
  return (
    <section className="theme theme--newspaper" style={style}>
      <div className="theme__hero" style={heroStyle}>
        <div className="theme__hero-left">
          <div className="theme__eyebrow">AIMS MEDIA · {newspaperTheme.label}</div>
          <h1>{newspaperTheme.headline}</h1>
          <p>{newspaperTheme.description}</p>
          <div className="theme__actions">
            <Link
              className="btn primary"
              to={`/products?query=${newspaperTheme.searchKey ?? newspaperTheme.label}`}
            >
              Khám phá {newspaperTheme.label}
            </Link>
            <Link className="btn light" to="/products">
              Xem tất cả
            </Link>
          </div>
          <div className="theme__badges">
            {newspaperTheme.badges.map((badge) => (
              <span key={badge} className="theme__badge">
                {badge}
              </span>
            ))}
          </div>
          <div className="theme__metrics">
            {newspaperTheme.metrics.map((metric) => (
              <div key={metric.label} className="theme__metric">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="theme__hero-right">
          <div className="theme__hero-word" style={wordStyle}>
            {newspaperTheme.heroWord}
          </div>
          <div
            className="theme__hero-figure theme__hero-figure--newspaper"
            style={{ '--hero-image': `url(${newspaperTheme.heroImage})` } as CSSProperties}
            aria-hidden="true"
          >
            <InteractiveNewspaper />
          </div>
          {newspaperTheme.callouts.map((callout) => (
            <div key={callout.title} className="theme__callout" style={callout.style}>
              <strong>{callout.title}</strong>
              <span>{callout.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="theme__content" style={contentStyle}>
        <div className="theme__content-head">
          <h2>{newspaperTheme.featureTitle}</h2>
          <p>{newspaperTheme.featureCopy}</p>
        </div>
        <div className="theme__content-grid">
          {newspaperTheme.features.map((feature) => (
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

export default NewspaperSection;
