import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { listStories, getStory } from '../services/storiesApi';

const StoriesContext = createContext(null);

export function StoriesProvider({ children }) {
  const { user } = useAuth();
  const [storyList, setStoryList] = useState(null);   // null = not yet loaded
  const [storyCache, setStoryCache] = useState({});    // { [id]: fullStory }
  const [currentUserId, setCurrentUserId] = useState(null);

  // Clear cache when user changes
  useEffect(() => {
    const uid = user?.sub ?? null;
    if (uid !== currentUserId) {
      setStoryList(null);
      setStoryCache({});
      setCurrentUserId(uid);
    }
  }, [user, currentUserId]);

  // Re-fetch list on window focus — invalidate changed stories
  useEffect(() => {
    const onFocus = async () => {
      if (!user || !storyList) return;
      try {
        const fresh = await listStories();
        setStoryList(fresh);
        // Invalidate cache for any story whose updated_at changed
        setStoryCache(prev => {
          const next = { ...prev };
          fresh.forEach(item => {
            const cached = next[item.id];
            if (cached && cached.updated_at !== item.updated_at) {
              delete next[item.id];
            }
          });
          return next;
        });
      } catch {
        // silently ignore — user still sees cached data
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, storyList]);

  const fetchList = useCallback(async () => {
    const list = await listStories();
    setStoryList(list);
    return list;
  }, []);

  const fetchStory = useCallback(async (id) => {
    if (storyCache[id]) return storyCache[id];
    const story = await getStory(id);
    setStoryCache(prev => ({ ...prev, [id]: story }));
    return story;
  }, [storyCache]);

  const updateCache = useCallback((story) => {
    setStoryList(prev => prev
      ? prev.map(s => s.id === story.id
          ? { id: story.id, title: story.title, updated_at: story.updated_at, filled_count: story.filled_count }
          : s)
      : prev
    );
    setStoryCache(prev => ({ ...prev, [story.id]: story }));
  }, []);

  const addToList = useCallback((story) => {
    setStoryList(prev => prev
      ? [...prev, { id: story.id, title: story.title, updated_at: story.updated_at, filled_count: story.filled_count }]
      : [{ id: story.id, title: story.title, updated_at: story.updated_at, filled_count: story.filled_count }]
    );
    setStoryCache(prev => ({ ...prev, [story.id]: story }));
  }, []);

  const removeFromList = useCallback((id, seedStory) => {
    if (seedStory) {
      // Last story deleted — replace with seed
      setStoryList([{ id: seedStory.id, title: seedStory.title, updated_at: seedStory.updated_at, filled_count: seedStory.filled_count }]);
      setStoryCache({ [seedStory.id]: seedStory });
    } else {
      setStoryList(prev => prev ? prev.filter(s => s.id !== id) : prev);
      setStoryCache(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }, []);

  const clearCache = useCallback(() => {
    setStoryList(null);
    setStoryCache({});
    setCurrentUserId(null);
  }, []);

  return (
    <StoriesContext.Provider value={{
      storyList, storyCache,
      fetchList, fetchStory,
      updateCache, addToList, removeFromList, clearCache,
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  return useContext(StoriesContext);
}
