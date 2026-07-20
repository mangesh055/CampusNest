import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoriteState {
  favoriteProperties: string[]
  favoriteMesses: string[]
  togglePropertyFavorite: (id: string) => void
  toggleMessFavorite: (id: string) => void
  isPropertyFavorite: (id: string) => boolean
  isMessFavorite: (id: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteProperties: [],
      favoriteMesses: [],
      togglePropertyFavorite: (id) => {
        const { favoriteProperties } = get()
        if (favoriteProperties.includes(id)) {
          set({ favoriteProperties: favoriteProperties.filter(pId => pId !== id) })
        } else {
          set({ favoriteProperties: [...favoriteProperties, id] })
        }
      },
      toggleMessFavorite: (id) => {
        const { favoriteMesses } = get()
        if (favoriteMesses.includes(id)) {
          set({ favoriteMesses: favoriteMesses.filter(mId => mId !== id) })
        } else {
          set({ favoriteMesses: [...favoriteMesses, id] })
        }
      },
      isPropertyFavorite: (id) => get().favoriteProperties.includes(id),
      isMessFavorite: (id) => get().favoriteMesses.includes(id),
    }),
    {
      name: 'favorites-storage',
    }
  )
)
