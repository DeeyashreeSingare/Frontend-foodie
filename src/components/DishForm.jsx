import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';

const DishForm = ({ restaurantId, dish, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        is_available: true,
        imageUrl: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (dish) {
            setFormData({
                name: dish.name || '',
                description: dish.description || '',
                price: dish.price || '',
                is_available: dish.is_available ?? true,
                imageUrl: dish.image_url || '',
                image: null
            });
        }
    }, [dish]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('is_available', formData.is_available);
            if (formData.image) {
                data.append('image', formData.image);
            } else if (formData.imageUrl) {
                data.append('image_url', formData.imageUrl);
            }

            if (dish) {
                await restaurantAPI.updateMenuItem(restaurantId, dish.id, data);
            } else {
                await restaurantAPI.addMenuItem(restaurantId, data);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving dish:', err);
            setError(err.response?.data?.message || 'Failed to save dish');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]" 
            style={{ backdropFilter: 'blur(4px)' }} 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-md mx-auto my-auto max-h-[75vh] overflow-y-auto shadow-2xl" 
                style={{ 
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    margin: 'auto',
                    position: 'relative',
                    width: '90%',
                    maxWidth: '450px',
                    padding: '24px'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>
                    {dish ? 'Edit Dish' : 'Add New Dish'}
                </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        style={{ fontSize: '28px', lineHeight: '1', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Dish Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-zomato"
                            style={{ padding: '10px 14px', fontSize: '14px' }}
                            placeholder="Enter dish name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-zomato"
                            rows="3"
                            placeholder="Describe the dish"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Price (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="input-zomato"
                            placeholder="Enter price in ₹"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 border rounded-lg" style={{ borderColor: '#E8E8E8', backgroundColor: '#F9FAFB' }}>
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleChange}
                            className="w-5 h-5 rounded text-zomato-red focus:ring-zomato-red"
                            style={{ accentColor: '#E23744' }}
                        />
                        <label htmlFor="is_available" className="text-sm font-semibold" style={{ color: '#374151' }}>Available for order</label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Dish Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="input-zomato"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Or Image URL</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="input-zomato"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-zomato-outline"
                            style={{ padding: '10px 20px', fontSize: '14px' }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-zomato"
                            style={{ padding: '10px 20px', fontSize: '14px' }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : dish ? 'Update' : 'Add Dish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DishForm;
