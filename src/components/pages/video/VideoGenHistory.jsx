"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Image, Video, Calendar, Eye, Plus, X, History } from 'lucide-react';
import generationApi from '../../../lib/api/generation';

export default function ImageGenHistory({ onSelectThread, currentThreadId, refreshTrigger, onNewChat, isOpen, onClose, page }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseId, setFirebaseId] = useState(null);

  useEffect(() => {
    fetchFirebaseId();
  }, []);

  useEffect(() => {
    if (firebaseId) {
      fetchThreads();
    }
  }, [firebaseId, refreshTrigger]);

  const fetchFirebaseId = async () => {
    try {
      const id = await generationApi.getFirebaseId();
      if (!id) {
        // TEMPORARY: Use hardcoded firebaseId for testing
        console.warn('⚠️ No Firebase ID found, using hardcoded one for testing');
        setFirebaseId('bscUhhSwrbPitTU4DOjoCk3mhiL2');
      } else {
        setFirebaseId(id);
      }
    } catch (error) {
      console.error('Error fetching Firebase ID:', error);
      setError('Failed to load user data');
    }
  };

  const fetchThreads = async () => {
    if (!firebaseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations?firebaseId=${firebaseId}&page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.threads) {
        // Filter for image type threads only
        const imageThreads = data.threads.filter(thread => thread.type === 'image');
        setThreads(imageThreads);
      } else {
        setError('Failed to load conversation history');
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleThreadClick = (thread) => {
    if (onSelectThread) {
      onSelectThread(thread);
    }
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <div className={`w-80 bg-[#f9f3f0] rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#C15F3C]" />
          <h3 className="text-lg font-semibold text-gray-800">Chat History</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-lg transition-colors group"
        >
          <X className="w-5 h-5 text-gray-500 group-hover:text-[#C15F3C] transition-colors" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] hover:from-[#A54F32] hover:to-[#E08A6A] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C15F3C]"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p className="text-sm mb-2">{error}</p>
            <button 
              onClick={fetchThreads}
              className="text-xs text-[#C15F3C] hover:text-[#A54F32] underline"
            >
              Try again
            </button>
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1">Start generating images to see them here</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <div className="p-2 space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  onClick={() => {
                    handleThreadClick(thread);
                    onClose();
                  }}
                  className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentThreadId === thread.threadId
                      ? 'bg-gradient-to-r from-[#faf7f4] to-[#f9f3f0] border-2 border-[#C15F3C] shadow-md'
                      : 'bg-white hover:bg-white/80 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {thread.firstImageUrl ? (
                        <img
                          src={thread.firstImageUrl}
                          alt="Thread preview"
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                          {getTypeIcon(thread.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {thread.firstMessage || 'Untitled conversation'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(thread.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(thread.type)}
                          <span className="capitalize">{thread.type}</span>
                        </div>
                        <span className="text-gray-400">
                          {thread.messageCount} {thread.messageCount === 1 ? 'msg' : 'msgs'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {currentThreadId === thread.threadId && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-[#C15F3C] rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={fetchThreads}
          className="w-full text-sm text-gray-600 hover:text-[#C15F3C] transition-colors"
        >
          Refresh History
        </button>
      </div>
    </div>
  );
}