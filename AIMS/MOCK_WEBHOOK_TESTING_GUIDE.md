# Mock Webhook Testing Guide

## Overview
This guide explains how to test the payment transaction and order status flows using the mock webhook endpoints.

## What is a Webhook?

A webhook is **just a regular HTTP POST endpoint** that receives notifications from external services (like PayPal or VietQR). When a payment event occurs (success, failure, timeout), the payment provider sends an HTTP POST request to your webhook URL with event data.

**Example flow:**
1. User completes payment on PayPal website
2. PayPal sends: `POST https://yourapp.com/api/webhooks/paypal` with JSON payload
3. Your webhook handler validates the payload and updates order/transaction status

## Mock Webhook Endpoints

The `MockWebhookController` simulates what your colleague's actual webhook handlers will do. It provides three endpoints for testing:

### 1. **Payment Captured (Success)**
**Endpoint:** `POST /api/webhooks/mock/payment-captured`

**Request Body:**
```json
{
  "orderId": 1,
  "providerReference": "PAYPAL_ORDER_12345"
}
```

**What it does:**
- Updates `PaymentTransaction.status` → `CAPTURED`
- Sets `providerReference` and `webhookReceivedAt`
- Stores mock webhook payload in `rawPayload`
- Calls `OrderPaymentService.handlePaymentCaptured()`
- Updates `Order.status` → `PAID`

**Use case:** Test successful payment completion

---

### 2. **Payment Timeout (Expired)**
**Endpoint:** `POST /api/webhooks/mock/payment-timeout`

**Request Body:**
```json
{
  "orderId": 1
}
```

**What it does:**
- Updates `PaymentTransaction.status` → `FAILED`
- Stores mock webhook payload in `rawPayload`
- Calls `OrderPaymentService.handlePaymentTimeout()`
- Updates `Order.status` → `CANCELLED`
- **Restores stock** to inventory

**Use case:** Test payment link expiration (user didn't complete payment in time)

---

### 3. **Payment Cancelled (User Cancelled)**
**Endpoint:** `POST /api/webhooks/mock/payment-cancelled`

**Request Body:**
```json
{
  "orderId": 1
}
```

**What it does:**
- Updates `PaymentTransaction.status` → `FAILED`
- Stores mock webhook payload in `rawPayload`
- Calls `OrderPaymentService.handleUserCancelledPayment()`
- Updates `Order.status` → `CANCELLED`
- **Restores stock** to inventory

**Use case:** Test user clicking "cancel" on payment page

---

## Complete Testing Scenarios

### Scenario 1: Successful Order → Payment Flow

**Step 1: Create an order**
```bash
POST /api/orders
{
  "customerEmail": "test@example.com",
  "customerName": "John Doe",
  "phone": "0901234567",
  "addressLine": "123 Street",
  "city": "Ha Noi",
  "province": "Ha Noi",
  "postalCode": "100000",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 50000
    }
  ]
}
```

**Expected response:**
```json
{
  "id": 1,
  "status": "PENDING_PROCESSING",
  "paymentTransactionId": 1,
  "paymentStatus": "INIT",
  ...
}
```

**Verify:**
- ✅ Order created with status `PENDING_PROCESSING`
- ✅ PaymentTransaction created with status `INIT`
- ✅ Product stock decreased by 2

---

**Step 2: Simulate payment success**
```bash
POST /api/webhooks/mock/payment-captured
{
  "orderId": 1,
  "providerReference": "PAYPAL_12345"
}
```

**Expected response:**
```json
{
  "success": true,
  "data": "Payment captured, order status updated to PAID",
  "message": "Webhook processed"
}
```

**Verify:**
- ✅ Order status → `PAID`
- ✅ PaymentTransaction status → `CAPTURED`
- ✅ PaymentTransaction.providerReference → `"PAYPAL_12345"`
- ✅ PaymentTransaction.webhookReceivedAt → current timestamp
- ✅ Product stock remains decreased (no restoration)

---

### Scenario 2: Order → Payment Timeout

**Step 1: Create an order** (same as above)

**Step 2: Simulate payment timeout**
```bash
POST /api/webhooks/mock/payment-timeout
{
  "orderId": 1
}
```

**Expected response:**
```json
{
  "success": true,
  "data": "Payment timeout, stock restored and order cancelled",
  "message": "Webhook processed"
}
```

**Verify:**
- ✅ Order status → `CANCELLED`
- ✅ PaymentTransaction status → `FAILED`
- ✅ PaymentTransaction.webhookReceivedAt → current timestamp
- ✅ **Product stock restored** (increased by 2)

---

### Scenario 3: Order → User Cancels Payment

**Step 1: Create an order** (same as above)

**Step 2: Simulate user cancellation**
```bash
POST /api/webhooks/mock/payment-cancelled
{
  "orderId": 1
}
```

**Expected response:**
```json
{
  "success": true,
  "data": "Payment cancelled by user, stock restored and order cancelled",
  "message": "Webhook processed"
}
```

**Verify:**
- ✅ Order status → `CANCELLED`
- ✅ PaymentTransaction status → `FAILED`
- ✅ PaymentTransaction.webhookReceivedAt → current timestamp
- ✅ **Product stock restored** (increased by 2)

---

### Scenario 4: User Cancels Order Directly (Before Payment)

**Step 1: Create an order** (same as above)

**Step 2: User calls cancel API**
```bash
POST /api/orders/1/cancel
```

**Expected response:**
```json
{
  "id": 1,
  "status": "CANCELLED",
  "paymentTransactionId": 1,
  "paymentStatus": "FAILED",
  ...
}
```

**Verify:**
- ✅ Order status → `CANCELLED`
- ✅ PaymentTransaction status → `FAILED` (automatically updated)
- ✅ **Product stock restored** (increased by 2)

---

## Testing with Postman/cURL

### Example cURL Commands

**Create Order:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "customerName": "John Doe",
    "phone": "0901234567",
    "addressLine": "123 Street",
    "city": "Ha Noi",
    "province": "Ha Noi",
    "postalCode": "100000",
    "items": [{"productId": 1, "quantity": 2, "price": 50000}]
  }'
```

**Simulate Payment Success:**
```bash
curl -X POST http://localhost:8080/api/webhooks/mock/payment-captured \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "providerReference": "PAYPAL_12345"
  }'
```

**Simulate Payment Timeout:**
```bash
curl -X POST http://localhost:8080/api/webhooks/mock/payment-timeout \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

**Cancel Order:**
```bash
curl -X POST http://localhost:8080/api/orders/1/cancel
```

**Check Order Status:**
```bash
curl http://localhost:8080/api/orders/1
```

---

## Database Verification Queries

**Check order and transaction:**
```sql
SELECT o.id, o.status, o.total_with_vat, 
       pt.id as transaction_id, pt.status as payment_status, 
       pt.webhook_received_at, pt.raw_payload
FROM orders o
LEFT JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.id = 1;
```

**Check product stock:**
```sql
SELECT id, title, stock 
FROM products 
WHERE id = 1;
```

**Check payment transaction details:**
```sql
SELECT * FROM payment_transactions WHERE order_id = 1;
```

---

## What Your Colleague Needs to Implement

When your colleague creates the actual webhook handlers, they will follow the same pattern:

### PayPal Webhook Example:
```java
@PostMapping("/api/webhooks/paypal")
public ResponseEntity<?> handlePayPalWebhook(@RequestBody String payload, @RequestHeader Map<String, String> headers) {
    // 1. Validate PayPal signature
    boolean valid = payPalWebhookValidator.validate(payload, headers);
    if (!valid) {
        return ResponseEntity.status(401).body("Invalid signature");
    }
    
    // 2. Parse webhook event
    PayPalWebhookEvent event = parsePayload(payload);
    
    // 3. Find transaction by provider order ID
    String paypalOrderId = event.getResource().getSupplementaryData().getRelatedIds().getOrderId();
    PaymentTransaction transaction = findTransactionByProviderReference(paypalOrderId);
    
    // 4. Update transaction
    transaction.setStatus(mapStatus(event.getEventType()));
    transaction.setRawPayload(payload);
    transaction.setWebhookReceivedAt(LocalDateTime.now());
    paymentTransactionRepository.save(transaction);
    
    // 5. Call YOUR OrderPaymentService
    if (event.getEventType().equals("PAYMENT.CAPTURE.COMPLETED")) {
        orderPaymentService.handlePaymentCaptured(transaction.getOrderId());
    } else if (event.getEventType().equals("PAYMENT.CAPTURE.DENIED")) {
        orderPaymentService.handlePaymentFailed(transaction.getOrderId());
    }
    
    return ResponseEntity.ok("Webhook processed");
}
```

---

## Summary

✅ **Fixed Issues:**
- Added logic to update `PaymentTransaction.status` to `FAILED` when order is cancelled
- Created mock webhook controller for testing

✅ **Webhook = Regular HTTP Endpoint:**
- Yes, webhooks are just POST endpoints that receive JSON
- External services call them when events happen
- Your mock controller simulates this behavior

✅ **Complete Flow Working:**
- Order creation → Transaction creation ✅
- Payment success → Order PAID ✅
- Payment timeout → Order CANCELLED + Stock restored ✅
- User cancels payment → Order CANCELLED + Stock restored ✅
- User cancels order → Transaction FAILED + Stock restored ✅

You can now test all scenarios using the mock webhook endpoints!
