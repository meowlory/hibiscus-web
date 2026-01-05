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

export default function Home() {
  const [unassignedBlooms, setUnassignedBlooms] = useState<Bloom[]>([]);
  const [selectedBloom, setSelectedBloom] = useState<Bloom | null>(null);
  const [newPlant, setNewPlant] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUnassignedBlooms();
  }, []);

  const fetchUnassignedBlooms = async () => {
    try {
      const response = await fetch('/api/blooms');
      const data = await response.json();
      const unassigned = (data.blooms || []).filter((b: Bloom) => !b.plantId);
      setUnassignedBlooms(unassigned);
    } catch (error) {
      console.error('Error fetching blooms:', error);
    }
  };

  const handleCreatePlantWithBloom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlant.name.trim() || !selectedBloom) return;

    setSaving(true);
    try {
      // Create plant
      const plantResponse = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlant),
      });

      if (plantResponse.ok) {
        const { plant } = await plantResponse.json();

        // Assign bloom to plant
        await fetch('/api/blooms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bloomId: selectedBloom.id, plantId: plant.id }),
        });

        // Reset form and refresh
        setNewPlant({ name: '', description: '' });
        setSelectedBloom(null);
        await fetchUnassignedBlooms();
      } else {
        alert('Failed to create plant');
      }
    } catch (error) {
      console.error('Error creating plant:', error);
      alert('Failed to create plant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-pink-600">Hibiscus Tracker</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Hibiscus Blooms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Name your plants, capture their beautiful blooms, and watch your garden flourish over time.
          </p>
        </div>

        {unassignedBlooms.length > 0 && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              New Bloom Photos to Name!
            </h3>
            <p className="text-gray-700 mb-4">
              You have {unassignedBlooms.length} bloom photo{unassignedBlooms.length !== 1 ? 's' : ''} that {unassignedBlooms.length !== 1 ? "haven't" : "hasn't"} been assigned to a plant yet.
            </p>

            {!selectedBloom ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {unassignedBlooms.map((bloom) => (
                  <button
                    key={bloom.id}
                    onClick={() => setSelectedBloom(bloom)}
                    className="aspect-square rounded-lg overflow-hidden hover:ring-4 hover:ring-pink-500 transition-all shadow-md"
                  >
                    <img
                      src={bloom.url}
                      alt="Unassigned bloom"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6">
                <div className="flex gap-6 mb-4">
                  <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedBloom.url}
                      alt="Selected bloom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <form onSubmit={handleCreatePlantWithBloom} className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Name this plant
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Plant Name *
                        </label>
                        <input
                          type="text"
                          value={newPlant.name}
                          onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="e.g., Front Yard Red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newPlant.description}
                          onChange={(e) => setNewPlant({ ...newPlant, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Location, color, notes..."
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Creating...' : 'Create Plant'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBloom(null)}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-4xl mb-4">🌺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Plants</h3>
            <p className="text-gray-600 mb-4">
              View all your named hibiscus plants in one place
            </p>
            <Link
              href="/plants"
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              View Plants
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Recent Blooms</h3>
            <p className="text-gray-600 mb-4">
              Browse the latest flower photos from your collection
            </p>
            <Link
              href="/blooms"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
