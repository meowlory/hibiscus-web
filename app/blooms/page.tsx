'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Bloom {
  id: number;
  url: string;
  pathname: string;
  uploadedAt: string;
  plantId?: number;
}

export default function BloomsPage() {
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchBlooms();
  }, []);

  const fetchBlooms = async () => {
    try {
      const response = await fetch('/api/blooms');
      const data = await response.json();
      setBlooms(data.blooms || []);
    } catch (error) {
      console.error('Error fetching blooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bloomId: number) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this bloom photo? This action cannot be undone.'
    );

    if (!confirmed) return;

    // Add to deleting set
    setDeletingIds(prev => new Set(prev).add(bloomId));

    try {
      const response = await fetch(`/api/blooms?id=${bloomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || 'Failed to delete bloom');
      }

      // Optimistic update - remove from local state
      setBlooms(prev => prev.filter(bloom => bloom.id !== bloomId));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete bloom. Please try again.');
    } finally {
      // Remove from deleting set
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(bloomId);
        return next;
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchBlooms();
        e.target.value = '';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        alert(errorData.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-pink-600 hover:text-pink-700">
            Hibiscus Tracker
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bloom Gallery</h1>
          <p className="text-lg text-gray-600 mb-6">
            Upload and view photos of your beautiful hibiscus blooms
          </p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block">
              <span className="text-gray-700 font-medium mb-2 block">
                Upload a bloom photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 disabled:opacity-50"
              />
              {uploading && (
                <p className="mt-2 text-sm text-pink-600">Uploading...</p>
              )}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading blooms...</p>
          </div>
        ) : blooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🌺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No blooms yet
            </h3>
            <p className="text-gray-600">
              Upload your first hibiscus bloom photo to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blooms.map((bloom) => {
              const isDeleting = deletingIds.has(bloom.id);

              return (
                <div
                  key={bloom.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                    isDeleting ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="aspect-square relative group">
                    <img
                      src={bloom.url}
                      alt="Hibiscus bloom"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDelete(bloom.id)}
                      disabled={isDeleting}
                      aria-label="Delete this bloom photo"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgb(239, 68, 68)',
                        color: 'white',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        zIndex: 999,
                        opacity: 1,
                      }}
                    >
                      ×
                    </button>
                    {isDeleting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600">
                      {new Date(bloom.uploadedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
