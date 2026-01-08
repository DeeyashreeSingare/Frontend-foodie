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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                    {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Restaurant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantForm;
