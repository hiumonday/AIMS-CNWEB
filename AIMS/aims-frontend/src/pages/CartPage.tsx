import { Link } from 'react-router-dom';
import './CartPage.css';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { lines, updateQty, removeItem, subtotal } = useCart();

  // Hàm xử lý khi ảnh bị lỗi (không load được)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
    e.currentTarget.onerror = null;
  };

  return (
    <main className="shopping-bag-page">
      <div className="shopping-bag-container">

        <header className="bag-header-section">
          <h1>SHOPPING CART</h1>
        </header>

        {lines.length === 0 ? (
          <div className="empty-bag">
            <p>YOUR BAG IS EMPTY</p>
            <Link className="btn-continue-shopping" to="/products">
              SHOP NOW
            </Link>
          </div>
        ) : (
          <div className="bag-content">
            <div className="bag-items">
              {lines.map(line => (
                <div key={line.productId} className="bag-item-row">
                  <div className="item-media">
                    <img
                      src={line.imageUrl || "https://placehold.co/150x200?text=Product"}
                      alt={line.productName}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>

                  <div className="item-info-col">
                    <h3 className="item-title">
                      <Link to={`/product/${line.productId}`}>{line.productName}</Link>
                    </h3>
                    <div className="item-price-display">
                      {line.price.toLocaleString('vi-VN')} VND
                    </div>

                    {/* Placeholder for size/color if available */}
                    <div className="item-variant">
                      One Size
                    </div>

                    <button
                      className="link-remove"
                      onClick={() => removeItem(String(line.productId))}
                    >
                      REMOVE
                    </button>
                  </div>

                  <div className="item-actions-col">
                    <div className="qty-control-minimal">
                      <button onClick={() => updateQty(String(line.productId), line.quantity - 1)}>−</button>
                      <span>{line.quantity}</span>
                      <button onClick={() => updateQty(String(line.productId), line.quantity + 1)}>+</button>
                    </div>
                  </div>

                  {/* Optional: Show Total for line item if desired, or keep minimal like image */}
                </div>
              ))}
            </div>

            <div className="bag-footer">
              <div className="bag-summary-section">
                <div className="subtotal-display">
                  <span>SUBTOTAL:</span>
                  <span className="amount">{subtotal.toLocaleString('vi-VN')} VND</span>
                </div>

                <div className="bag-buttons-stack">
                  <Link to="/products" className="btn-minimal-outline">
                    CONTINUE SHOPPING
                  </Link>
                  <Link to="/checkout/delivery" className="btn-minimal-solid">
                    CHECKOUT
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;