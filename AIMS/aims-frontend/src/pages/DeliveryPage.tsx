import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import type { DeliveryInfo } from "../types";
import orderService from "../services/orderService";
import cartService from "../services/cartService";

const baseDeliveryFee = 15000;

const DeliveryPage = () => {
  const navigate = useNavigate();
  const { subtotal, lines } = useCart();
  const { showToast } = useToast();
  const [form, setForm] = useState<DeliveryInfo>(() => {
    const saved = localStorage.getItem("deliveryInfo");
    const defaults = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      note: "",
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  useEffect(() => {
    localStorage.setItem("deliveryInfo", JSON.stringify(form));
  }, [form]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const deliveryFee = useMemo(
    () => (subtotal > 100000 ? 0 : baseDeliveryFee),
    [subtotal]
  );
  const vatAmount = useMemo(() => subtotal * 0.1, [subtotal]);
  const total = subtotal + deliveryFee + vatAmount;

  const onContinue = async () => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
    });

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state
    ) {
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Get cart session key
      const sessionKey = cartService.getSessionKey();

      // Create order with delivery info and cart items
      const order = await orderService.createOrder({
        customerEmail: form.email,
        customerName: form.fullName,
        phone: form.phone,
        addressLine: form.address,
        city: form.city,
        province: form.state,
        postalCode: "00000",
        cartSessionKey: sessionKey,
        shippingFee: deliveryFee,
        items: lines.map((line) => ({
          productId: Number(line.productId),
          productTitle: line.productName,
          quantity: line.quantity,
          price: line.price,
        })),
       
        cancelReturnUrl: "http://localhost:5173/payment/cancel",
        successReturnUrl: "http://localhost:5173/payment/success?orderId=39",
        currency: "VND",
        provider: "VIETQR",
      });

      // Save order ID to localStorage for payment success page
      localStorage.setItem("currentOrderId", String(order.id));

      // Navigate to payment with order ID
      navigate("/checkout/payment", {
        state: {
          orderId: order.id,
          order, // Pass the full order object which contains paymentResult
          deliveryInfo: form,
          deliveryFee,
          total,
        },
      });
    } catch (error: any) {
      console.error("Failed to create order:", error);

      // Check if it's a duplicate order error (cart already checked out)
      const errorMessage =
        error?.response?.data?.message || error?.message || "";

      if (
        errorMessage.includes("already been used for an order") ||
        errorMessage.includes("already checked out")
      ) {
        showToast(
          "You have a pending order with this cart. Please complete or cancel your existing order before creating a new one.",
          "warning"
        );
      } else if (
        errorMessage.includes("out of stock") ||
        errorMessage.includes("Insufficient stock")
      ) {
        showToast(
          "Some items in your cart are out of stock. Please update your cart and try again.",
          "error"
        );
      } else {
        showToast("Failed to create order. Please try again.", "error");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="checkout-shell">
        <div className="checkout-topbar">
          <Link to="/cart" className="back-link">
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
            Back to Cart
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

  return (
    <main className="checkout-shell">
      <div className="checkout-topbar">
        <Link to="/cart" className="back-link">
          &lt; Back to Bag
        </Link>
      </div>

      <h1>Delivery Information</h1>
      <div className="checkout-layout">
        <section className="panel">
          <h3>Shipping Address</h3>
          <div className="input-group">
            <label>Full Name *</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              placeholder="John Doe"
            />
            {touched.fullName && !form.fullName && (
              <span className="warning">Bắt buộc nhập</span>
            )}
          </div>
          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="customer@example.com"
            />
            {touched.email && !form.email && (
              <span className="warning">Bắt buộc nhập</span>
            )}
          </div>
          <div className="input-group">
            <label>Phone Number *</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
              placeholder="(555) 123-4567"
            />
            {touched.phone && !form.phone && (
              <span className="warning">Bắt buộc nhập</span>
            )}
          </div>
          <div className="input-group">
            <label>Street Address *</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
              placeholder="123 Main St"
            />
            {touched.address && !form.address && (
              <span className="warning">Bắt buộc nhập</span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 12,
            }}
          >
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>City *</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                placeholder="New York"
              />
              {touched.city && !form.city && (
                <span className="warning">Bắt buộc nhập</span>
              )}
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>State/Province *</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, state: true }))}
                placeholder="NY"
              />
              {touched.state && !form.state && (
                <span className="warning">Bắt buộc nhập</span>
              )}
            </div>
          </div>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Delivery Instructions (Optional)</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Leave at front door, ring bell, etc."
            />
          </div>
        </section>

        <aside className="panel panel--summary">
          <div className="panel-header">
            <h3>Delivery Summary</h3>
            <span className="panel-meta">{lines.length} items</span>
          </div>
          <div className="summary">
            <div className="summary-section">
              <div className="summary-section__title">Charges</div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString('vi-VN')} VND</span>
              </div>
              {/* <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee.toLocaleString('vi-VN')} VND</span>
              </div> */}
              <div className="summary-row">
                <span>VAT (10%)</span>
                <span>{vatAmount.toLocaleString('vi-VN')} VND</span>
              </div>
              {/* <p className="summary-note">
                Free delivery on orders over 100.000 VND
              </p> */}
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="price">{total.toLocaleString('vi-VN')} VND</span>
            </div>
            <button
              className="btn primary block"
              type="button"
              onClick={onContinue}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? "CREATING ORDER..." : "CONTINUE TO PAYMENT"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default DeliveryPage;
