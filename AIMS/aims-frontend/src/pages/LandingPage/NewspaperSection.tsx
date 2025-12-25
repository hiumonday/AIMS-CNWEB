import { useState, type CSSProperties, type FC, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { LandingSectionProps } from './types';
import './NewspaperSection.css';

export const newspaperTheme = {
  key: 'newspaper',
  label: 'Newsstand',
  searchKey: 'Newspaper',
  heroWord: 'EXTRA',
  headline: 'The Daily Stories',
  description: 'Cập nhật dòng chảy tin tức mỗi sáng với phong cách tối giản.',
  accent: '#1e7fbf',
  light: '#f4f4f4',
  dark: '#111',
  word: '#e2e2e2',
};

const NewspaperSection: FC<LandingSectionProps> = ({
  style,
  heroStyle,
  wordStyle,
  isActive,
}) => {
  const papers = Array.from({ length: 6 });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handlePaperClick = (index: number, e: MouseEvent) => {
    e.stopPropagation();
    if (expandedIndex === index) return;
    setExpandedIndex(index);
  };

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    setExpandedIndex(null);
  };

  return (
    <section className="theme theme--newspaper" style={style}>
      <div className="np-bg-word" style={wordStyle}>
        {newspaperTheme.heroWord}
      </div>

      <div className="np-stage" style={heroStyle}>

        {/* Header ẩn đi khi đọc báo */}
        <div className={`np-header ${expandedIndex !== null ? 'fade-out' : ''}`}>
          <div className="np-eyebrow">AIMS MEDIA · {newspaperTheme.label}</div>
          <h1 className="np-headline">{newspaperTheme.headline}</h1>
          <p className="np-subhead">{newspaperTheme.description}</p>
        </div>

        <div className={`np-fan-wrapper ${isActive ? 'is-fanned' : ''}`}>
          {papers.map((_, index) => {
            const isExpanded = expandedIndex === index;
            const isHidden = expandedIndex !== null && !isExpanded;

            return (
              <div
                key={index}
                className={`np-card ${isExpanded ? 'is-expanded' : ''} ${isHidden ? 'is-hidden' : ''}`}
                style={{ '--i': index } as CSSProperties}
                onClick={(e) => handlePaperClick(index, e)}
              >
                {isExpanded && (
                  <button className="np-close-btn" onClick={handleClose}>
                    ✕ Đóng
                  </button>
                )}

                {/* --- BÌA BÁO (Hiện khi chưa mở) --- */}
                <div className="np-cover">
                  <div className="np-paper-head">
                    <span className="np-paper-name">THE DAILY</span>
                    <span className="np-paper-date">VOL.{index + 1}</span>
                  </div>
                  <div className="np-hero-img"></div>
                  <div className="np-headline-text">
                    GLOBAL MARKETS RALLY AS TECH STOCKS SOAR
                  </div>
                  <div className="np-lines">
                    <span className="np-line" style={{ width: '100%' }}></span>
                    <span className="np-line" style={{ width: '92%' }}></span>
                    <span className="np-line" style={{ width: '96%' }}></span>
                    <span className="np-line" style={{ width: '65%' }}></span>
                  </div>
                </div>

                {/* --- NỘI DUNG ĐỌC (Hiện khi mở) --- */}
                <div className="np-inner">
                  <div className="np-page left">
                    <h2>The Morning Brief</h2>
                    <h3>Tin Nổi Bật</h3>
                    <p>
                      Thị trường công nghệ đang chứng kiến sự bùng nổ mạnh mẽ với hàng loạt sản phẩm AI mới ra mắt.
                      Các chuyên gia dự báo xu hướng này sẽ tiếp tục kéo dài trong thập kỷ tới, thay đổi hoàn toàn cách chúng ta làm việc.
                    </p>
                    <div className="np-inner-img"></div>
                    <div className="np-cols">
                      <p>
                        Trong khi đó, mảng văn hóa giải trí cũng không kém phần sôi động với sự trở lại của đĩa than và văn hóa đọc tạp chí in.
                      </p>
                      <p>
                        Giới trẻ đang tìm về những giá trị xưa cũ (retro) như một cách để cân bằng lại cuộc sống số hối hả.
                      </p>
                    </div>
                  </div>

                  <div className="np-page right">
                    <h3>Góc Nhìn Biên Tập</h3>

                    <div className="np-article-mini">
                      <h4>Nghệ Thuật & Đời Sống</h4>
                      <p>Khám phá những triển lãm nghệ thuật đương đại đang diễn ra tại thành phố, nơi giao thoa giữa truyền thống và hiện đại.</p>
                    </div>

                    <div className="np-article-mini">
                      <h4>Du Lịch: Kyoto Mùa Thu</h4>
                      <p>Một hành trình qua những con phố cổ, đắm mình trong sắc đỏ của lá phong và hương trà xanh thoang thoảng.</p>
                    </div>

                    <div className="np-ad-box">
                      <span>DÀNH RIÊNG CHO BẠN</span>
                      <strong>GIẢM 50% GÓI HỘI VIÊN</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`np-actions ${expandedIndex !== null ? 'fade-out' : ''}`}>
          <Link className="np-btn-read" to={`/products?category=Newspaper`}>
            Đọc báo ngay
          </Link>
        </div>

      </div>

      <div
        className={`np-overlay ${expandedIndex !== null ? 'active' : ''}`}
        onClick={() => handleClose()}
      ></div>

      <div className="np-scroll-hint">
        <span>Cuộn xuống để xem sách</span>
        <div className="np-line-ind"></div>
      </div>
    </section>
  );
};

export default NewspaperSection;