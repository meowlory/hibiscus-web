'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Plant {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface Bloom {
  id: number;
  url: string;
  pathname: string;
  uploadedAt: string;
  plantId?: number;
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlant, setNewPlant] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const [editingPlant, setEditingPlant] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plantsRes, bloomsRes] = await Promise.all([
        fetch('/api/plants'),
        fetch('/api/blooms'),
      ]);

      const plantsData = await plantsRes.json();
      const bloomsData = await bloomsRes.json();

      setPlants(plantsData.plants || []);
      setBlooms(bloomsData.blooms || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlant.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlant),
      });

      if (response.ok) {
        await fetchData();
        setNewPlant({ name: '', description: '' });
        setShowForm(false);
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

  const handleAssignBloom = async (bloomId: number, plantId: number) => {
    try {
      const response = await fetch('/api/blooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloomId, plantId }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert('Failed to assign bloom');
      }
    } catch (error) {
      console.error('Error assigning bloom:', error);
      alert('Failed to assign bloom');
    }
  };

  const handleEditPlant = (plant: Plant) => {
    setEditingPlant(plant.id);
    setEditForm({ name: plant.name, description: plant.description });
  };

  const handleUpdatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlant || !editForm.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/plants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPlant,
          name: editForm.name,
          description: editForm.description,
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditingPlant(null);
        setEditForm({ name: '', description: '' });
      } else {
        alert('Failed to update plant');
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      alert('Failed to update plant');
    } finally {
      setSaving(false);
    }
  };

  const getPlantBlooms = (plantId: number) => {
    return blooms.filter(b => b.plantId === plantId);
  };

  const getUnassignedBlooms = () => {
    return blooms.filter(b => !b.plantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading plants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-pink-600 hover:text-pink-700">
            Hibiscus Tracker
          </Link>
          <div className="flex gap-4">
            <Link href="/blooms" className="text-gray-600 hover:text-gray-900">
              Gallery
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Plants</h1>
            <p className="text-lg text-gray-600">
              Manage your hibiscus plants and their blooms
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Plant'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Plant</h3>
            <form onSubmit={handleCreatePlant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plant Name *
                </label>
                <input
                  type="text"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., Front Yard Red, Garden Pink"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Location, color, notes..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Plant'}
              </button>
            </form>
          </div>
        )}

        {plants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🌺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No plants yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first plant to start organizing your blooms
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Add Your First Plant
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {plants.map((plant) => {
              const plantBlooms = getPlantBlooms(plant.id);
              const unassignedBlooms = selectedPlant === plant.id ? getUnassignedBlooms() : [];

              return (
                <div key={plant.id} className="bg-white rounded-lg shadow-md p-6">
                  {editingPlant === plant.id ? (
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Plant</h3>
                      <form onSubmit={handleUpdatePlant} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plant Name *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={saving}
                            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPlant(null)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-2xl font-semibold text-gray-900">
                          {plant.name}
                        </h3>
                        <button
                          onClick={() => handleEditPlant(plant)}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      {plant.description && (
                        <p className="text-gray-600">{plant.description}</p>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Blooms ({plantBlooms.length})
                      </h4>
                      <button
                        onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        {selectedPlant === plant.id ? 'Cancel' : '+ Add Photo'}
                      </button>
                    </div>

                    {selectedPlant === plant.id && unassignedBlooms.length > 0 && (
                      <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Select a recent bloom to add to {plant.name}:
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {unassignedBlooms.map((bloom) => (
                            <button
                              key={bloom.id}
                              onClick={() => handleAssignBloom(bloom.id, plant.id)}
                              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all"
                            >
                              <img
                                src={bloom.url}
                                alt="Unassigned bloom"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {plantBlooms.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No blooms yet</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {plantBlooms.map((bloom) => (
                          <div
                            key={bloom.id}
                            className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <img
                              src={bloom.url}
                              alt={`${plant.name} bloom`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {getUnassignedBlooms().length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unassigned Blooms ({getUnassignedBlooms().length})
            </h3>
            <p className="text-gray-600 mb-4">
              These photos haven't been assigned to a plant yet. Click "+ Add Photo" on any plant above to assign them.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getUnassignedBlooms().map((bloom) => (
                <div
                  key={bloom.id}
                  className="aspect-square rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={bloom.url}
                    alt="Unassigned bloom"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
