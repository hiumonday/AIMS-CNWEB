import { useState, type KeyboardEvent } from 'react';
import coverImage from '../assets/cover.jpg';
import './InteractiveNewspaper.css';

const InteractiveNewspaper = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="newspaper-scene">
      <div
        className={`newspaper-object ${isOpen ? 'is-open' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-pressed={isOpen}
        title={isOpen ? 'Click để đóng' : 'Click để đọc báo'}
      >
        <div className="right-page-static inner-page-style">
          <div className="paper-texture"></div>
          <h3>Xã hội & Đời sống (Trang 3)</h3>
          <p>Các tin tức nổi bật khác trong ngày.</p>
          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=500&q=80"
            alt="News"
            className="inner-news-img"
          />
          <div className="dummy-text-block"></div>
          <p>
            Tiếp tục cập nhật các thông tin về thị trường, kinh tế và các vấn đề
            dân sinh nóng hổi...
          </p>
        </div>

        <div className="flipping-cover-sheet">
          <div
            className="cover-face front-face"
            aria-hidden="true"
          >
            <img
              src={coverImage}
              alt="Bìa báo"
              className="front-cover-image"
              draggable={false}
            />
            <div className="front-shadow-overlay"></div>
          </div>

          <div className="cover-face back-face inner-page-style">
            <div className="paper-texture"></div>
            <h3>Tiêu điểm hôm nay (Trang 2)</h3>
            <p className="date">Thứ Năm, 09/12/2021</p>
            <hr />
            <h4>Nghịch lý giao thông Hà Nội</h4>
            <p>
              Phân tích sâu về đề xuất thu phí vào nội đô trong khi phương tiện
              công cộng chưa đáp ứng đủ nhu cầu.
            </p>
            <div className="dummy-text-block"></div>
            <div className="dummy-text-block short"></div>
            <p>Ý kiến chuyên gia và người dân về vấn đề này.</p>
          </div>
        </div>
      </div>

      <div className="newspaper-hint">
        {isOpen ? 'Click để gấp báo lại' : 'Click vào báo để lật mở'}
      </div>
    </div>
  );
};

export default InteractiveNewspaper;
