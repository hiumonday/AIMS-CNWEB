import React, { useState } from 'react';
import { adjustStock } from '../../services/pmService';
import '../admin/UserFormModal.css';

interface StockAdjustmentModalProps {
    product: any;
    onClose: () => void;
    onSuccess: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
    product,
    onClose,
    onSuccess,
}) => {
    const [quantityChange, setQuantityChange] = useState<number>(0);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const newStock = (product.stock || 0) + quantityChange;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Reason is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await adjustStock(product.id, { quantityChange, reason });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to adjust stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Adjust Stock</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="stock-info">
                        <h3>{product.title}</h3>
                        <p className="stock-current">Current Stock: <strong>{product.stock}</strong></p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantityChange">Quantity Change *</label>
                        <input
                            id="quantityChange"
                            type="number"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                            required
                            placeholder="Enter positive to add, negative to remove"
                        />
                        <span className="field-hint">
                            Use positive numbers to add stock, negative to remove
                        </span>
                    </div>

                    {quantityChange !== 0 && (
                        <div className={`stock-preview ${newStock < 0 ? 'invalid' : ''}`}>
                            New Stock: <strong>{newStock}</strong>
                            {newStock < 0 && <span className="error-text"> (Invalid: Stock cannot be negative)</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="reason">Reason *</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={4}
                            placeholder="Explain why stock is being adjusted..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || newStock < 0 || quantityChange === 0}
                        >
                            {loading ? 'Adjusting...' : 'Adjust Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
