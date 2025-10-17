'use client'

import { useState, useEffect } from 'react'
import { X, Folder, Download, Heart, Trash2, ArrowLeft } from 'lucide-react'
import collectionsService from '../../lib/services/collectionsService'

export default function CollectionDetailModal({ collection, onClose, onCollectionUpdate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleRemoveImage = async (imageId) => {
    if (!confirm('Remove this image from the collection?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      await collectionsService.removeImageFromCollection(collection.id, imageId)
      onCollectionUpdate() // Refresh the collection
    } catch (err) {
      setError(err.message || 'Failed to remove image')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'image.jpg'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C15F3C] to-[#F59B7B] rounded-xl flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{collection.name}</h2>
              <p className="text-sm text-gray-600">
                {collection.items?.length || 0} {collection.items?.length === 1 ? 'item' : 'items'} • Created {formatDate(collection.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {collection.items?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Folder className="w-12 h-12 text-[#C15F3C]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Empty Collection</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                This collection doesn't have any images yet. Start adding images from your generations!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collection.items?.map((item) => (
                <div
                  key={item.image_id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.image.url}
                      alt={item.image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadImage(item.image.url, `image-${item.image.id}.jpg`)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleRemoveImage(item.image_id)}
                          disabled={loading}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove from collection"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                      {item.image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{item.image.like_count || 0}</span>
                      </div>
                      <span className="text-xs">
                        {item.image.id.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

