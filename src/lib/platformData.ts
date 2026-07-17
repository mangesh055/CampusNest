import { supabase } from './supabase'
import type { CommunityPost, Mess, MessPlan, Property, Review, RoommateProfile } from '../types'

const cache = {
  properties: null as Property[] | null,
  propertiesPromise: null as Promise<Property[]> | null,
  messes: null as Mess[] | null,
  messesPromise: null as Promise<Mess[]> | null,
  roommates: null as RoommateProfile[] | null,
  roommatesPromise: null as Promise<RoommateProfile[]> | null,
  posts: null as CommunityPost[] | null,
  postsPromise: null as Promise<CommunityPost[]> | null,
}

export function invalidatePlatformCache() {
  cache.properties = null
  cache.propertiesPromise = null
  cache.messes = null
  cache.messesPromise = null
  cache.roommates = null
  cache.roommatesPromise = null
  cache.posts = null
  cache.postsPromise = null
}

export async function fetchProperties(forceRefresh = false) {
  if (forceRefresh) cache.propertiesPromise = null
  if (cache.properties && !forceRefresh) return cache.properties
  
  if (!cache.propertiesPromise) {
    cache.propertiesPromise = (async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      cache.properties = (data || []) as Property[]
      return cache.properties
    })().catch((err: any) => {
      cache.propertiesPromise = null
      throw err
    })
  }
  return cache.propertiesPromise as Promise<Property[]>
}

export async function fetchMesses(forceRefresh = false) {
  if (forceRefresh) cache.messesPromise = null
  if (cache.messes && !forceRefresh) return cache.messes

  if (!cache.messesPromise) {
    cache.messesPromise = (async () => {
      const { data, error } = await supabase
        .from('messes')
        .select('*, profiles:profiles(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      cache.messes = (data || []) as Mess[]
      return cache.messes
    })().catch((err: any) => {
      cache.messesPromise = null
      throw err
    })
  }
  return cache.messesPromise as Promise<Mess[]>
}

export async function fetchRoommateProfiles(forceRefresh = false) {
  if (forceRefresh) cache.roommatesPromise = null
  if (cache.roommates && !forceRefresh) return cache.roommates

  if (!cache.roommatesPromise) {
    cache.roommatesPromise = (async () => {
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      cache.roommates = (data || []) as RoommateProfile[]
      return cache.roommates
    })().catch((err: any) => {
      cache.roommatesPromise = null
      throw err
    })
  }
  return cache.roommatesPromise as Promise<RoommateProfile[]>
}

export async function fetchCommunityPosts(forceRefresh = false) {
  if (forceRefresh) cache.postsPromise = null
  if (cache.posts && !forceRefresh) return cache.posts

  if (!cache.postsPromise) {
    cache.postsPromise = (async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      cache.posts = (data || []) as CommunityPost[]
      return cache.posts
    })().catch((err: any) => {
      cache.postsPromise = null
      throw err
    })
  }
  return cache.postsPromise as Promise<CommunityPost[]>
}

export async function fetchMessPlans(messId: string) {
  const { data, error } = await supabase
    .from('mess_plans')
    .select('*')
    .eq('mess_id', messId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as MessPlan[]
}

export async function fetchReviews(options: { propertyId?: string; messId?: string }) {
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })

  if (options.propertyId) query = query.eq('property_id', options.propertyId)
  if (options.messId) query = query.eq('mess_id', options.messId)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Review[]
}

export async function fetchCommunityComments(postId?: string) {
  let query = supabase.from('community_comments').select('*').order('created_at', { ascending: true })

  if (postId) {
    query = query.eq('post_id', postId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}
