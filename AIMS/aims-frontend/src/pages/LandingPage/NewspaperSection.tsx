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
  const papers = [
    {
      paperName: 'THE DAILY',
      issue: 'CHAPTER I',
      coverHeadline: 'CINEMA REBORN AT HOME',
      coverImage:
        'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'The Morning Brief',
        subtitle: 'Chuong I - Man anh tai gia',
        lead:
          'Chon tung tua DVD chuan mau, tung cap canh am thanh de tai tao trai nghiem rap phim ngay tai nha.',
        image:
          'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Tu phim kinh dien den nhung bo suu tap gioi han, moi tua sach hinh va am deu duoc kiem dinh ky.',
          'Am thanh am ap, phu de ro rang va chat luong tai tao giup tung khoanh khac song dong hon.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Suat chieu cua tuan',
            body: 'Goi y 5 bo phim kinh dien cho buoi toi cuoi tuan, co kem thong tin nhac nen.',
          },
          {
            title: 'Bao quan dia',
            body: 'Meo nho de giu be mat dia sach va ben mau, tranh tray xuoc khong dang co.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Giam 20% bo suu tap phim moi',
        },
      },
    },
    {
      paperName: 'CITY EDITION',
      issue: 'CHAPTER II',
      coverHeadline: 'CITY LIGHTS, MORNING PULSE',
      coverImage:
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'Urban Dispatch',
        subtitle: 'Chuong II - Nhip song thanh pho',
        lead:
          'Khi thanh pho bat dau thuc giac, nhung diem hen van hoa va am nhac tao nen mot ngay moi song dong.',
        image:
          'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Cac su kien ngoai troi, trien lam nghe thuat va lich chieu dac biet dang duoc cap nhat lien tuc.',
          'Nhung quan ca phe nho giua long pho co tro thanh noi hut ban doc de doc va ghi chu.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Dem nhac duong pho',
            body: 'Chuong trinh am nhac trinh dien tren cac tuyen pho cu, mo cua tu 19:00.',
          },
          {
            title: 'Thuc don sang tao',
            body: 'Nhung mon an moi toi gian nhung day cam hung, hop voi tuan nang dong.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Tang ve tham quan trien lam',
        },
      },
    },
    {
      paperName: 'THE PRINT REVIEW',
      issue: 'CHAPTER III',
      coverHeadline: 'INK, PAPER, OLD TASTE',
      coverImage:
        'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'Ink & Memory',
        subtitle: 'Chuong III - Vi giay co',
        lead:
          'Van hoa doc bao giay quay tro lai nhu mot nghi thuc cham, giu cho tam tri biet tam nghi.',
        image:
          'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Nhieu ban doc tim lai cam giac lat trang va ghi chu truc tiep tren mat giay.',
          'Tu nhung trang tin kinh dien, ta thay lai net dep cua kieu chu va layout thu cong.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Bo suu tap co',
            body: 'Gioi thieu nhung an ban gioi han, mo ta chuyen va ky uc.',
          },
          {
            title: 'Phong vien ke chuyen',
            body: 'Mot ngay tac nghiep cua phong vien tren pho, ghi lai bang but muc.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Mua 2 tang 1 an ban co',
        },
      },
    },
    {
      paperName: 'STUDIO NOTES',
      issue: 'CHAPTER IV',
      coverHeadline: 'DESIGNERS AT WORK',
      coverImage:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'Studio Journal',
        subtitle: 'Chuong IV - Nguon cam hung',
        lead:
          'Phong lam viec cua nhung nha thiet ke day ap anh sang va nhung ghi chu toi gian.',
        image:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Cau chuyen ve cach ho phac hoa y tuong, tu giay nhap den san pham hoan chinh.',
          'Xu huong toi gian dang dinh hinh cac bo suu tap moi trong nam nay.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Phong cach toi gian',
            body: 'Giang luoc toi da de tap trung vao trai nghiem doc va nhin.',
          },
          {
            title: 'Bo cuc tu do',
            body: 'Cach sap xep noi dung de giu nhip doc tu nhien.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Tai mien phi bo template thiet ke',
        },
      },
    },
    {
      paperName: 'WEEKEND JOURNAL',
      issue: 'CHAPTER V',
      coverHeadline: 'WEEKEND JOURNEYS',
      coverImage:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'Travel Notes',
        subtitle: 'Chuong V - Chuyen di ngan',
        lead:
          'Mot cuoc doi nho moi cuoi tuan la du de nap lai nang luong va ghi them ky uc.',
        image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Diem dung chan gan thanh pho, du lich cham, kham pha nhung quan ca phe nho.',
          'Mang theo mot to bao va mot chiec but, ghi lai nhung dieu nho nhat.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Balo toi gian',
            body: 'Chi can 5 mon do co ban de bat dau chuyen di nhe nhang.',
          },
          {
            title: 'Lich trinh 48h',
            body: 'Goi y lich trinh tu sang thu bay den chieu chu nhat.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Giam 15% goi thanh vien',
        },
      },
    },
    {
      paperName: 'THE COMMUNITY',
      issue: 'CHAPTER VI',
      coverHeadline: 'READERS & COMMUNITY',
      coverImage:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      inner: {
        title: 'Readers Corner',
        subtitle: 'Chuong VI - Cong dong doc gia',
        lead:
          'Khi cau chuyen duoc chia se, mot cong dong nho se duoc hinh thanh tu nhung trang bao.',
        image:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
        columns: [
          'Doc gia gui ve nhung ghi chu nho, chia se cam nhan ve van hoa doc ngay nay.',
          'Moi tuan, chung toi chon ra mot cau chuyen ban doc tieu bieu.',
        ],
        rightTitle: 'Goc bien tap',
        articles: [
          {
            title: 'Gop y chu de moi',
            body: 'Goi y chu de, chuyen muc ma ban muon doc trong so tiep theo.',
          },
          {
            title: 'Goc thu ban doc',
            body: 'Nhung dong thu nho ve khoanh khac doc bao cung gia dinh.',
          },
        ],
        promo: {
          label: 'Danh rieng cho ban',
          offer: 'Tang ky niem chuong AIMS',
        },
      },
    },
  ];
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
    <section
      className={`theme theme--newspaper ${expandedIndex !== null ? 'is-reading' : ''}`}
      style={style}
    >
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

        <div
          className={`np-fan-wrapper ${isActive ? 'is-fanned' : ''} ${expandedIndex !== null ? 'is-reading' : ''}`}
        >
          {papers.map((paper, index) => {
            const isExpanded = expandedIndex === index;
            const isHidden = expandedIndex !== null && !isExpanded;

            return (
              <div
                key={`${paper.issue}-${index}`}
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
                    <span className="np-paper-name">{paper.paperName}</span>
                    <span className="np-paper-date">{paper.issue}</span>
                  </div>
                  <div
                    className="np-hero-img"
                    style={{ backgroundImage: `url(${paper.coverImage})` }}
                  ></div>
                  <div className="np-headline-text">{paper.coverHeadline}</div>
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
                    <h2>{paper.inner.title}</h2>
                    <h3>{paper.inner.subtitle}</h3>
                    <p>{paper.inner.lead}</p>
                    <div
                      className="np-inner-img"
                      style={{ backgroundImage: `url(${paper.inner.image})` }}
                    ></div>
                    <div className="np-cols">
                      <p>{paper.inner.columns[0]}</p>
                      <p>{paper.inner.columns[1]}</p>
                    </div>
                  </div>

                  <div className="np-page right">
                    <h3>{paper.inner.rightTitle}</h3>

                    {paper.inner.articles.map((article) => (
                      <div key={article.title} className="np-article-mini">
                        <h4>{article.title}</h4>
                        <p>{article.body}</p>
                      </div>
                    ))}

                    <div className="np-ad-box">
                      <span>{paper.inner.promo.label}</span>
                      <strong>{paper.inner.promo.offer}</strong>
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
