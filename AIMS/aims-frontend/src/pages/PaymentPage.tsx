import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import paymentService from "../services/paymentService";
import orderService, { type Order } from "../services/orderService";
import { API_BASE_URL } from "../services/api";
import { QRCodeCanvas } from "qrcode.react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { orderId?: number; deliveryFee?: number; total?: number; order?: Order };
  };
  const orderId = location.state?.orderId;
  const deliveryFee = location.state?.deliveryFee ?? 15000;
  const { lines, subtotal, clear } = useCart();
  const { showToast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState<Order | null>(
    location.state?.order ?? null
  );
  const autoCancelRef = useRef(false);
  
  // Use orderId directly for display
  const displayOrderCode = orderId ? String(orderId) : "--";

  const formatVnd = (value: number | null | undefined) =>
    `${Math.max(0, Math.round(value ?? 0)).toLocaleString("vi-VN")} VND`;

  const totals = useMemo(() => {
    const subtotalAmount = orderSnapshot?.totalBeforeVat ?? subtotal;
    const shipping = orderSnapshot?.shippingFee ?? deliveryFee;
    const totalWithVat = orderSnapshot?.totalWithVat;
    const vatAmount =
      totalWithVat != null
        ? Math.max(0, totalWithVat - subtotalAmount - shipping)
        : subtotalAmount * 0.1;
    const finalTotal = totalWithVat ?? subtotalAmount + shipping + vatAmount;
    return {
      subtotalAmount,
      shippingFee: shipping,
      vatAmount,
      totalWithVat: finalTotal,
    };
  }, [orderSnapshot, subtotal, deliveryFee]);



  const triggerAutoCancel = () => {
    if (autoCancelRef.current) {
      return;
    }
    if (!orderId || paymentStatus === "PAID") {
      return;
    }
    autoCancelRef.current = true;
    const url = `${API_BASE_URL}/orders/${orderId}/cancel`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, "");
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Silent fallback for unload scenario.
    });
  };

  if (lines.length === 0) {
    return (
      <main className="checkout-shell">
        <div className="checkout-topbar">
          <Link to="/products" className="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Products
          </Link>
        </div>
        <div className="panel empty-cart">
          <div style={{ fontSize: 48, color: "#cbd5e1" }}>👜</div>
          <div>Your cart is empty</div>
          <Link className="btn primary" to="/products">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [qrImageError, setQrImageError] = useState(false);
  const statusText =
    paymentStatus === "PAID"
      ? "Đã thanh toán"
      : paymentStatus
        ? paymentStatus
        : "Đang chờ";

  useEffect(() => {
    if (!orderId) {
      return;
    }
    let active = true;
    orderService
      .getOrder(orderId)
      .then((order) => {
        if (active) {
          setOrderSnapshot(order);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch order details:", error);
      });
    return () => {
      active = false;
    };
  }, [orderId]);



  // Handle payment result from order details
  // Handle payment result from order details
  useEffect(() => {
    if (orderSnapshot) {
      console.log("PaymentPage: Order loaded", orderSnapshot);
    }
    if (orderSnapshot?.paymentResult) {
      console.log("PaymentPage: Payment Result found", orderSnapshot.paymentResult);
      const { qrContent, providerReference, status } = orderSnapshot.paymentResult;
      if (qrContent) {
        console.log("PaymentPage: Setting QR Content", qrContent);
        setQrCodeUrl(qrContent);
      } else {
        console.warn("PaymentPage: No QR Content in payment result");
      }
      if (providerReference) {
        setPaymentLinkId(providerReference);
      }
      // If status is already PAID (e.g. re-opening page), update local state
      if (status) {
         setPaymentStatus(status);
         if (status === 'PAID') {
           setShowSuccess(true);
         }
      }
    } else if (orderSnapshot) {
        console.warn("PaymentPage: No paymentResult in order");
    }
  }, [orderSnapshot]);


  useEffect(() => {
    const handlePageHide = () => {
      triggerAutoCancel();
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [orderId, paymentStatus]);

  // Auto-poll PayOS so users don't have to click "Tôi đã thanh toán"
  useEffect(() => {
    if (!paymentLinkId) {
      return;
    }

    let cancelled = false;
    let intervalId: number | null = null;

    const pollStatus = async () => {
      try {
        const statusResponse = await paymentService.checkPayOSPaymentStatus(
          paymentLinkId
        );
        if (cancelled) return;
        const status = statusResponse.status;
        setPaymentStatus(status);
        if (status === "PAID") {
          if (intervalId) {
            clearInterval(intervalId);
          }
          setShowSuccess(true);
          setShowFail(false);
          setTimeout(() => {
            clear();
            navigate("/");
          }, 1200);
        } else if (["CANCELLED", "FAILED", "EXPIRED"].includes(status)) {
          if (intervalId) {
            clearInterval(intervalId);
          }
          setShowFail(true);
          setShowSuccess(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to poll PayOS status", error);
        }
      }
    };

    intervalId = window.setInterval(pollStatus, 3000);
    pollStatus();

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentLinkId, clear, navigate]);

  const handleCancelOrder = async () => {
    if (!orderId) {
      showToast("No order to cancel", "error");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsCancelling(true);
    autoCancelRef.current = true;
    try {
      await orderService.cancelOrder(orderId);
      showToast(
        "Order cancelled successfully. You can modify your cart and create a new order.",
        "success"
      );
      setTimeout(() => {
        navigate("/cart");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel order";
      showToast(errorMessage, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main className="checkout-shell">
      <div className="checkout-topbar">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate("/checkout/delivery")}
        >
          &lt; BACK TO DELIVERY
        </button>
      </div>
      <h1>PAYMENT</h1>
      <div className="checkout-layout">
        <section className="panel">
          <div className="payment-hero">
            <div>
              <div className="eyebrow">SECURE PAYMENT</div>
              <div className="payment-title">VIETQR PAYMENT</div>
            </div>
            <span className="status-pill">
              <span className="dot" />
              {statusText}
            </span>
          </div>

          <div className="payment-body">
            <div className="payment-grid">
              <div className="payment-qr">
                <div className="qr-frame">
                  <div className="qr-box">
                    {qrCodeUrl ? (
                      <div className="qr-inner">
                        {qrCodeUrl.startsWith("data:image") && !qrImageError ? (
                          <img
                            src={qrCodeUrl}
                            alt="VietQR"
                            onError={() => setQrImageError(true)}
                          />
                        ) : (
                          <QRCodeCanvas value={qrCodeUrl} size={230} includeMargin />
                        )}
                      </div>
                    ) : (
                      <div className="qr-placeholder">
                        {orderSnapshot ? "▢▢" : "Đang tải..."}
                      </div>
                    )}
                  </div>
                </div>
                <div className="qr-meta">
                  <span>Mã đơn hàng</span>
                  <strong>{displayOrderCode ? `#${displayOrderCode}` : "--"}</strong>
                </div>
              </div>

              <div className="payment-instructions">
                <div className="payment-steps">
                  <div className="payment-step">
                    <span className="payment-step__index">01</span>
                    <span>Mở app ngân hàng và chọn quét mã QR.</span>
                  </div>
                  <div className="payment-step">
                    <span className="payment-step__index">02</span>
                    <span>Quét mã VietQR bên cạnh và xác nhận thanh toán.</span>
                  </div>
                  <div className="payment-step">
                    <span className="payment-step__index">03</span>
                    <span>Hệ thống tự kiểm tra trạng thái mỗi 3 giây.</span>
                  </div>
                </div>

                <div className="payment-amount">
                  {formatVnd(totals.totalWithVat)}
                </div>
                <p className="note-text">
                  {paymentStatus === "PAID"
                    ? "Đã xác nhận thanh toán, đang chuyển hướng..."
                    : "Đừng đóng trang cho đến khi thanh toán hoàn tất."}
                  {paymentStatus && paymentStatus !== "PAID"
                    ? ` (Trạng thái: ${paymentStatus})`
                    : ""}
                </p>
                <button
                  className="btn light"
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? "CANCELLING..." : "CANCEL ORDER"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel panel--summary order-mini">
          <div className="panel-header">
            <h3>Order Summary</h3>
            <span className="panel-meta">{lines.length} items</span>
          </div>
          <div className="summary">
            <div className="summary-section">
              <div className="summary-section__title">Items</div>
              <div className="summary-items">
                {lines.map((line) => (
                  <div key={line.productId} className="summary-item">
                    <div className="summary-item__text">
                      <span className="summary-item__name">{line.productName}</span>
                      <span className="summary-item__qty">Qty {line.quantity}</span>
                    </div>
                    <span className="summary-item__price">
                      {(line.price * line.quantity).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-divider" />
            <div className="summary-section">
              <div className="summary-section__title">Charges</div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatVnd(totals.subtotalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{formatVnd(totals.shippingFee)}</span>
              </div>
              <div className="summary-row">
                <span>VAT (10%)</span>
                <span>{formatVnd(totals.vatAmount)}</span>
              </div>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="price">{formatVnd(totals.totalWithVat)}</span>
            </div>
            <button
              className="btn light"
              type="button"
              onClick={() => navigate("/cart")}
            >
              Thay đổi sản phẩm
            </button>
          </div>
        </aside>
      </div>

      {showSuccess && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>PAYMENT SUCCESS</h2>
            <p>Thank you for your purchase!</p>
          </div>
        </div>
      )}

      {showFail && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Payment Failed</h2>
            <p>Thanh toán thất bại hoặc hết thời gian. Vui lòng thử lại.</p>
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowFail(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PaymentPage;
