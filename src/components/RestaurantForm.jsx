import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';

const RestaurantForm = ({ restaurant, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        imageUrl: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (restaurant) {
            setFormData({
                name: restaurant.name || '',
                description: restaurant.description || '',
                address: restaurant.address || '',
                phone: restaurant.phone || '',
                imageUrl: restaurant.image_url || '',
                image: null // New image upload will replace old one
            });
        }
    }, [restaurant]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            data.append('address', formData.address);
            data.append('phone', formData.phone);
            if (formData.image) {
                data.append('image', formData.image);
            } else if (formData.imageUrl) {
                data.append('image_url', formData.imageUrl);
            }

            if (restaurant) {
                await restaurantAPI.update(restaurant.id, data);
            } else {
                await restaurantAPI.create(data);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving restaurant:', err);
            setError(err.response?.data?.message || 'Failed to save restaurant');
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
                    {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
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
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Restaurant Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-zomato"
                            style={{ padding: '10px 14px', fontSize: '14px' }}
                            placeholder="Enter restaurant name"
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
                            placeholder="Describe your restaurant"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="input-zomato"
                            placeholder="Enter restaurant address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-zomato"
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Restaurant Image</label>
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
                            {loading ? 'Saving...' : restaurant ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantForm;
