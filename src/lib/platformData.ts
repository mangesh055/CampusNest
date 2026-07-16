import { supabase } from './supabase'
import type { CommunityPost, Mess, MessPlan, Property, Review, RoommateProfile } from '../types'

export async function fetchProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Property[]
}

export async function fetchMesses() {
  const { data, error } = await supabase
    .from('messes')
    .select('*, profiles:profiles(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Mess[]
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

export async function fetchRoommateProfiles() {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as RoommateProfile[]
}

export async function fetchCommunityPosts() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as CommunityPost[]
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
