export type Pillar =
  | 'software_engineering'
  | 'fitness'
  | 'soft_skills'
  | 'culture'
  | 'side_business'
  | 'finance'
  | 'family'
  | 'habit'
  | 'career'
  | 'recovery'

export type TimeGroup =
  | 'morning'
  | 'deep_work'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night'

export interface ScheduleBlock {
  id: string
  timeStart: string
  timeEnd: string
  timeLabel: string
  title: string
  description: string
  category: Pillar
  group: TimeGroup
}

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  completed_blocks: string[]
  journal_wins: string
  journal_improve: string
  mood: number
  overall_score: number
  created_at: string
}

export interface PillarLog {
  id: string
  user_id: string
  log_date: string
  pillar: Pillar
  completed: boolean
  notes: string | null
}

export const PILLAR_COLORS: Record<Pillar, string> = {
  software_engineering: '#3B82F6',
  fitness: '#22C55E',
  soft_skills: '#A855F7',
  culture: '#A855F7',
  side_business: '#F97316',
  finance: '#F59E0B',
  family: '#EC4899',
  habit: '#14B8A6',
  career: '#6B7280',
  recovery: '#6B7280',
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  software_engineering: 'Software Engineering',
  fitness: 'Fitness & Self-Defense',
  soft_skills: 'Soft Skills',
  culture: 'Culture',
  side_business: 'Side Business',
  finance: 'Finance & Money',
  family: 'Family Responsibility',
  habit: 'Habit',
  career: 'Career',
  recovery: 'Recovery',
}

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  morning: 'Morning',
  deep_work: 'Deep Work',
  midday: 'Midday',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}
