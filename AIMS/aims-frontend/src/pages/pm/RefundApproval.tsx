import React, { useEffect, useState } from 'react';
import { listPendingRefunds, approveRefund, rejectRefund } from '../../services/pmService';
import './RefundApproval.css';

const RefundApproval: React.FC = () => {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [rejectingOrder, setRejectingOrder] = useState<any | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadRefunds = async (pageNum: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await listPendingRefunds(pageNum, 30);
            if (response.success && response.data) {
                setRefunds(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setPage(pageNum);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load pending refunds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRefunds();
    }, []);

    const handleApprove = async (orderId: number) => {
        try {
            await approveRefund(orderId);
            setSuccess('Refund approved successfully');
            loadRefunds(page);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to approve refund');
        }
    };

    const handleReject = async () => {
        if (!rejectingOrder) return;
        try {
            await rejectRefund(rejectingOrder.id, rejectReason);
            setSuccess('Refund rejected');
            setRejectingOrder(null);
            setRejectReason('');
            loadRefunds(page);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reject refund');
        }
    };

    return (
        <div className="refund-approval">
            <div className="page-header">
                <div>
                    <h1>Refund Approval</h1>
                    <p className="page-description">Review and approve pending refund requests</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                    <button onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            <div className="refunds-table-container">
                {loading ? (
                    <div className="loading-spinner">Loading refunds...</div>
                ) : refunds.length === 0 ? (
                    <div className="empty-state">
                        <p>No pending refund requests</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer ID</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.userId}</td>
                                    <td>₫{order.totalAmount?.toLocaleString()}</td>
                                    <td>
                                        <span className="status-badge status-pending">{order.status}</span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleApprove(order.id)}
                                                title="Approve refund"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn-reject"
                                                onClick={() => setRejectingOrder(order)}
                                                title="Reject refund"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn-pagination"
                        onClick={() => loadRefunds(page - 1)}
                        disabled={page === 0}
                    >
                        ← Previous
                    </button>
                    <span className="page-info">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        className="btn-pagination"
                        onClick={() => loadRefunds(page + 1)}
                        disabled={page >= totalPages - 1}
                    >
                        Next →
                    </button>
                </div>
            )}

            {rejectingOrder && (
                <div className="modal-overlay" onClick={() => setRejectingOrder(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reject Refund Request</h2>
                            <button className="modal-close" onClick={() => setRejectingOrder(null)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleReject(); }}>
                            <div style={{ padding: '2rem' }}>
                                <p>Are you sure you want to reject refund for Order #{rejectingOrder.id}?</p>
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Reason (optional)</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={4}
                                        placeholder="Provide a reason for rejection..."
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setRejectingOrder(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-danger">
                                    Reject Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundApproval;
