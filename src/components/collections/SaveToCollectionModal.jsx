'use client'

import { useState, useEffect } from 'react'
import { X, Folder, Plus, Check } from 'lucide-react'
import collectionsService from '../../lib/services/collectionsService'

export default function SaveToCollectionModal({ 
  isOpen, 
  onClose, 
  imageData, 
  onSave 
}) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await collectionsService.getUserCollections()
      setCollections(data || [])
    } catch (err) {
      console.error('Failed to fetch collections:', err)
      setError('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  const handleCollectionToggle = (collectionId) => {
    const newSelected = new Set(selectedCollections)
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId)
    } else {
      newSelected.add(collectionId)
    }
    setSelectedCollections(newSelected)
  }

  const handleCreateCollection = async (e) => {
    e.preventDefault()
    
    if (!newCollectionName.trim()) {
      setError('Collection name is required')
      return
    }

    try {
      setSaving(true)
      setError('')
      const newCollection = await collectionsService.createCollection(newCollectionName.trim())
      setCollections(prev => [newCollection, ...prev])
      setSelectedCollections(prev => new Set([...prev, newCollection.id]))
      setNewCollectionName('')
      setShowCreateForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create collection')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (selectedCollections.size === 0) {
      setError('Please select at least one collection')
      return
    }

    try {
      setSaving(true)
      setError('')
      
      const savePromises = Array.from(selectedCollections).map(collectionId =>
        collectionsService.addImageToCollection(collectionId, imageData.id)
      )
      
      await Promise.all(savePromises)
      
      if (onSave) {
        onSave(Array.from(selectedCollections))
      }
      
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save to collections')
    } finally {
      setSaving(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C15F3C] to-[#F59B7B] rounded-xl flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Save to Collection</h2>
              <p className="text-sm text-gray-600">Choose collections to save this image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Image Preview */}
        {imageData && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={imageData.url}
                  alt={imageData.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 line-clamp-2">
                  {imageData.prompt}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {imageData.like_count || 0} likes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading collections...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Create New Collection */}
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-[#C15F3C]/30 rounded-xl hover:border-[#C15F3C]/50 transition-colors text-[#C15F3C]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create New Collection</span>
                </button>
              ) : (
                <form onSubmit={handleCreateCollection} className="p-3 border border-[#C15F3C]/30 rounded-xl bg-[#C15F3C]/5">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent text-sm"
                    autoFocus
                    disabled={saving}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={saving || !newCollectionName.trim()}
                      className="px-3 py-1 bg-[#C15F3C] text-white rounded-lg text-sm hover:bg-[#A54F32] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewCollectionName('')
                      }}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Collections List */}
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No collections yet</p>
                  <p className="text-gray-400 text-xs mt-1">Create your first collection above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleCollectionToggle(collection.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C15F3C]/20 to-[#F59B7B]/20 rounded-lg flex items-center justify-center">
                          <Folder className="w-4 h-4 text-[#C15F3C]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 text-sm">
                            {collection.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {collection.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      {selectedCollections.has(collection.id) && (
                        <div className="w-5 h-5 bg-[#C15F3C] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedCollections.size === 0}
            className="px-6 py-2 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white rounded-xl hover:from-[#A54F32] hover:to-[#E08A6A] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              `Save to ${selectedCollections.size} ${selectedCollections.size === 1 ? 'Collection' : 'Collections'}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

