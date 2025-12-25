import React, { useState } from 'react';
import { createProduct, updateProduct } from '../../services/pmService';
import '../admin/UserFormModal.css';
import './ProductFormModal.css';

interface ProductFormModalProps {
    product?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        typeCode: product?.typeCode || 'BOOK',
        barcode: product?.barcode || '',
        title: product?.title || '',
        category: product?.category || '',
        conditionLabel: product?.conditionLabel || '',
        dominantColor: product?.dominantColor || '',
        returnPolicy: product?.returnPolicy || '',
        height: product?.height || '',
        width: product?.width || '',
        length: product?.length || '',
        weight: product?.weight || '',
        originalValue: product?.originalValue || '',
        currentPrice: product?.currentPrice || '',
        stock: product?.stock || 0,
        status: product?.status || 'ACTIVE',
        // Type-specific
        attributes: product?.attributes || {},
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value },
        }));
    };

    const validatePrice = () => {
        const original = parseFloat(formData.originalValue);
        const current = parseFloat(formData.currentPrice);
        if (original && current) {
            const min = original * 0.3;
            const max = original * 1.5;
            if (current < min || current > max) {
                setError(`Price must be between 30% (${min.toFixed(2)}) and 150% (${max.toFixed(2)}) of original value`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validatePrice()) {
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            const productRequest = {
                typeCode: formData.typeCode,
                status: formData.status,
                barcode: formData.barcode,
                title: formData.title,
                category: formData.category,
                conditionLabel: formData.conditionLabel,
                dominantColor: formData.dominantColor,
                returnPolicy: formData.returnPolicy,
                height: formData.height ? parseFloat(formData.height) : null,
                width: formData.width ? parseFloat(formData.width) : null,
                length: formData.length ? parseFloat(formData.length) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                originalValue: parseFloat(formData.originalValue),
                currentPrice: parseFloat(formData.currentPrice),
                stock: parseInt(formData.stock),
                attributes: formData.attributes,
            };

            formDataToSend.append('product', new Blob([JSON.stringify(productRequest)], { type: 'application/json' }));

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            if (product) {
                await updateProduct(product.id, formDataToSend);
            } else {
                await createProduct(formDataToSend);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${product ? 'update' : 'create'} product`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-sections">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3 className="section-title">Basic Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Type *</label>
                                    <select
                                        value={formData.typeCode}
                                        onChange={(e) => handleChange('typeCode', e.target.value)}
                                        required
                                        disabled={!!product}
                                    >
                                        <option value="BOOK">Book</option>
                                        <option value="CD">CD</option>
                                        <option value="DVD">DVD</option>
                                        <option value="NEWSPAPER">Newspaper</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        required
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Barcode *</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => handleChange('barcode', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        {/* Physical Attributes */}
                        <div className="form-section">
                            <h3 className="section-title">Physical Attributes</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.height}
                                        onChange={(e) => handleChange('height', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Width (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.width}
                                        onChange={(e) => handleChange('width', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Length (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.length}
                                        onChange={(e) => handleChange('length', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.weight}
                                        onChange={(e) => handleChange('weight', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Condition</label>
                                    <input
                                        type="text"
                                        value={formData.conditionLabel}
                                        onChange={(e) => handleChange('conditionLabel', e.target.value)}
                                        placeholder="e.g., New, Used"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Dominant Color</label>
                                    <input
                                        type="text"
                                        value={formData.dominantColor}
                                        onChange={(e) => handleChange('dominantColor', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Return Policy</label>
                                <input
                                    type="text"
                                    value={formData.returnPolicy}
                                    onChange={(e) => handleChange('returnPolicy', e.target.value)}
                                    placeholder="e.g., 30 days return"
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="form-section">
                            <h3 className="section-title">Pricing & Stock</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Original Value (VND) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.originalValue}
                                        onChange={(e) => handleChange('originalValue', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Current Price (VND) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.currentPrice}
                                        onChange={(e) => handleChange('currentPrice', e.target.value)}
                                        required
                                        onBlur={validatePrice}
                                    />
                                    <span className="field-hint">Must be 30-150% of original value</span>
                                </div>

                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => handleChange('stock', e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Type-Specific Fields */}
                        {formData.typeCode === 'BOOK' && (
                            <div className="form-section type-specific">
                                <h3 className="section-title">Book Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Author(s)</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.authors || ''}
                                            onChange={(e) => handleAttributeChange('authors', e.target.value)}
                                            placeholder="Comma-separated"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Publisher</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.publisher || ''}
                                            onChange={(e) => handleAttributeChange('publisher', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cover Type</label>
                                        <select
                                            value={formData.attributes.coverType || ''}
                                            onChange={(e) => handleAttributeChange('coverType', e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="PAPERBACK">Paperback</option>
                                            <option value="HARDCOVER">Hardcover</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Pages</label>
                                        <input
                                            type="number"
                                            value={formData.attributes.pages || ''}
                                            onChange={(e) => handleAttributeChange('pages', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Language</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.language || ''}
                                            onChange={(e) => handleAttributeChange('language', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Genre</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.genre || ''}
                                            onChange={(e) => handleAttributeChange('genre', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Publication Date</label>
                                        <input
                                            type="date"
                                            value={formData.attributes.publicationDate || ''}
                                            onChange={(e) => handleAttributeChange('publicationDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.typeCode === 'CD' && (
                            <div className="form-section type-specific">
                                <h3 className="section-title">CD Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Artist(s)</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.artists || ''}
                                            onChange={(e) => handleAttributeChange('artists', e.target.value)}
                                            placeholder="Comma-separated"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Record Label</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.recordLabel || ''}
                                            onChange={(e) => handleAttributeChange('recordLabel', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Genre</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.genre || ''}
                                            onChange={(e) => handleAttributeChange('genre', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Release Date</label>
                                        <input
                                            type="date"
                                            value={formData.attributes.releaseDate || ''}
                                            onChange={(e) => handleAttributeChange('releaseDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Track List</label>
                                    <textarea
                                        value={formData.attributes.trackList || ''}
                                        onChange={(e) => handleAttributeChange('trackList', e.target.value)}
                                        placeholder="One track per line"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}

                        {formData.typeCode === 'DVD' && (
                            <div className="form-section type-specific">
                                <h3 className="section-title">DVD Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Disc Type</label>
                                        <select
                                            value={formData.attributes.discType || ''}
                                            onChange={(e) => handleAttributeChange('discType', e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="BLURAY">Blu-ray</option>
                                            <option value="HD_DVD">HD-DVD</option>
                                            <option value="DVD">Standard DVD</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Director</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.director || ''}
                                            onChange={(e) => handleAttributeChange('director', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Runtime (minutes)</label>
                                        <input
                                            type="number"
                                            value={formData.attributes.runtime || ''}
                                            onChange={(e) => handleAttributeChange('runtime', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Studio</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.studio || ''}
                                            onChange={(e) => handleAttributeChange('studio', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Language</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.language || ''}
                                            onChange={(e) => handleAttributeChange('language', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subtitles</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.subtitles || ''}
                                            onChange={(e) => handleAttributeChange('subtitles', e.target.value)}
                                            placeholder="Comma-separated"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Genre</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.genre || ''}
                                            onChange={(e) => handleAttributeChange('genre', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Release Date</label>
                                        <input
                                            type="date"
                                            value={formData.attributes.releaseDate || ''}
                                            onChange={(e) => handleAttributeChange('releaseDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.typeCode === 'NEWSPAPER' && (
                            <div className="form-section type-specific">
                                <h3 className="section-title">Newspaper Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Editor-in-Chief</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.editorInChief || ''}
                                            onChange={(e) => handleAttributeChange('editorInChief', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Publisher</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.publisher || ''}
                                            onChange={(e) => handleAttributeChange('publisher', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ISSN</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.issn || ''}
                                            onChange={(e) => handleAttributeChange('issn', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Issue Number</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.issueNumber || ''}
                                            onChange={(e) => handleAttributeChange('issueNumber', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Frequency</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.frequency || ''}
                                            onChange={(e) => handleAttributeChange('frequency', e.target.value)}
                                            placeholder="e.g., Daily, Weekly"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Language</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.language || ''}
                                            onChange={(e) => handleAttributeChange('language', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Publication Date</label>
                                        <input
                                            type="date"
                                            value={formData.attributes.publicationDate || ''}
                                            onChange={(e) => handleAttributeChange('publicationDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sections</label>
                                        <input
                                            type="text"
                                            value={formData.attributes.sections || ''}
                                            onChange={(e) => handleAttributeChange('sections', e.target.value)}
                                            placeholder="e.g., Politics, Business, Sports"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
