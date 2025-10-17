'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Folder, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react'
import collectionsService from '../../lib/services/collectionsService'
import CreateCollectionModal from '../../components/collections/CreateCollectionModal'
import CollectionDetailModal from '../../components/collections/CollectionDetailModal'
import useFirebaseAuth from '../../lib/hooks/useFirebaseAuth'
import Header from '../../components/layout/Header'

export default function CollectionsPage() {
  const { user, isLoading: authLoading } = useFirebaseAuth()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [showCollectionMenu, setShowCollectionMenu] = useState(null)

  const fetchCollections = useCallback(async () => {
    try {
      console.log('📞 Calling collectionsService.getUserCollections()...')
      setLoading(true)
      setError(null)
      const data = await collectionsService.getUserCollections()
      console.log('📦 Received collections data:', data)
      setCollections(data || [])
    } catch (err) {
      console.error('❌ Failed to fetch collections:', err)
      console.error('❌ Error details:', err.message, err.stack)
      setError('Failed to load collections')
    } finally {
      setLoading(false)
      console.log('✅ fetchCollections finished')
    }
  }, [])

  useEffect(() => {
    console.log('🔍 Collections page useEffect:', { authLoading, user: user?.email })
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...')
      return
    }
    
    console.log('✅ Auth finished loading. User:', user?.email || 'No user')
    
    if (user) {
      console.log('✅ User authenticated, fetching collections...')
      fetchCollections()
    } else {
      console.log('❌ No user, showing sign-in message')
      setLoading(false)
      setError('Please sign in to view your collections')
    }
  }, [user, authLoading, fetchCollections])

  const handleCreateCollection = async (name) => {
    try {
      const newCollection = await collectionsService.createCollection(name)
      setCollections(prev => [newCollection, ...prev])
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create collection:', err)
      throw err
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    try {
      await collectionsService.deleteCollection(collectionId)
      setCollections(prev => prev.filter(c => c.id !== collectionId))
      setShowCollectionMenu(null)
    } catch (err) {
      console.error('Failed to delete collection:', err)
    }
  }

  const handleViewCollection = (collection) => {
    setSelectedCollection(collection)
    setShowDetailModal(true)
  }

  const getCollectionPreview = (collection) => {
    if (!collection.items || collection.items.length === 0) {
      return []
    }
    return collection.items.slice(0, 4).map(item => item.image)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your collections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Folder className="w-12 h-12 text-[#C15F3C]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error}
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-3 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white rounded-xl hover:from-[#A54F32] hover:to-[#E08A6A] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Main App Header */}
      <Header />
      
      {/* Collections Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Collections</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Organize and curate your AI generations
                </p>
              </div>
              
              {collections.length > 0 && (
                <div className="flex items-center gap-4 ml-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl border border-[#C15F3C]/20">
                    <Folder className="w-4 h-4 text-[#C15F3C]" />
                    <span className="text-sm font-medium text-gray-900">
                      {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl border border-[#C15F3C]/20">
                    <span className="text-sm font-medium text-gray-900">
                      {collections.reduce((sum, col) => sum + (col.images?.length || 0), 0)} Items Saved
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white rounded-xl hover:from-[#A54F32] hover:to-[#E08A6A] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Collection
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C15F3C]/5 to-[#F59B7B]/5 rounded-3xl blur-xl"></div>
              <Folder className="w-16 h-16 text-[#C15F3C] relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your First Collection</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
              Organize and save your favorite AI-generated images and videos in beautiful collections, just like Pinterest boards.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Folder className="w-6 h-6 text-[#C15F3C]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Organize</h4>
                <p className="text-sm text-gray-600">Group your creations by theme, project, or style</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-[#C15F3C]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Browse</h4>
                <p className="text-sm text-gray-600">Quickly find and view your saved generations</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-[#C15F3C]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Curate</h4>
                <p className="text-sm text-gray-600">Build galleries of your best work to share</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white rounded-xl hover:from-[#A54F32] hover:to-[#E08A6A] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mx-auto shadow-lg hover:shadow-xl text-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {collections.map((collection) => {
              const previews = getCollectionPreview(collection)
              return (
                <div
                  key={collection.id}
                  className="break-inside-avoid bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:border-[#C15F3C]/30 transform hover:scale-[1.02]"
                  onClick={() => handleViewCollection(collection)}
                >
                  {/* Collection Preview Grid */}
                  <div className="aspect-square p-2 relative">
                    {/* Hover overlay */}
                    <div className="absolute inset-2 bg-gradient-to-br from-[#C15F3C]/0 to-[#F59B7B]/0 group-hover:from-[#C15F3C]/10 group-hover:to-[#F59B7B]/10 rounded-xl transition-all duration-300 pointer-events-none z-10"></div>
                    
                    {previews.length === 0 ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-xl flex items-center justify-center group-hover:from-[#C15F3C]/20 group-hover:to-[#F59B7B]/20 transition-all duration-300">
                        <Folder className="w-16 h-16 text-[#C15F3C]/40 group-hover:text-[#C15F3C]/60 transition-colors" />
                      </div>
                    ) : previews.length === 1 ? (
                      <div className="w-full h-full rounded-xl overflow-hidden">
                        <img
                          src={previews[0].url}
                          alt={previews[0].prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : previews.length === 2 ? (
                      <div className="w-full h-full grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                        {previews.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                        <div className="col-span-2 row-span-2">
                          <img
                            src={previews[0].url}
                            alt={previews[0].prompt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {previews.slice(1, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                        ))}
                        {collection.items.length > 4 && (
                          <div className="w-full h-full bg-black/50 flex items-center justify-center text-white font-semibold text-sm">
                            +{collection.items.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Collection Info */}
                  <div className="p-5 relative bg-gradient-to-br from-white to-gray-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate mb-2 group-hover:text-[#C15F3C] transition-colors">
                          {collection.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#C15F3C]"></div>
                            <span className="text-gray-700 font-medium">
                              {collection.items?.length || 0} {collection.items?.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {formatDate(collection.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Collection Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowCollectionMenu(showCollectionMenu === collection.id ? null : collection.id)
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {showCollectionMenu === collection.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowCollectionMenu(null)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewCollection(collection)
                                  setShowCollectionMenu(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Collection
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Implement edit functionality
                                  setShowCollectionMenu(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
                                    handleDeleteCollection(collection.id)
                                  }
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCollection}
        />
      )}

      {showDetailModal && selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCollection(null)
          }}
          onCollectionUpdate={fetchCollections}
        />
      )}
    </div>
  )
}
