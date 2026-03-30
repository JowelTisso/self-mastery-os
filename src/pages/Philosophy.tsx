import { useState } from 'react'
import {
  Code2, Dumbbell, MessageSquare, Briefcase, DollarSign,
  Landmark, Heart, Repeat, ChevronDown, ChevronUp, Sparkles, CalendarDays,
} from 'lucide-react'
import { PILLAR_COLORS } from '../types'
import type { Pillar } from '../types'

interface PillarSection {
  id: Pillar
  icon: React.ReactNode
  title: string
  what: string
  why: string
  study: string[]
  extras: string[]
}

const PILLARS: PillarSection[] = [
  {
    id: 'software_engineering',
    icon: <Code2 className="w-5 h-5" />,
    title: 'Software Engineering',
    what: 'Coding practice, projects, DSA, system design, open source contributions.',
    why: 'This is your career accelerator. Every hour invested here compounds into better jobs, higher pay, and more impactful work.',
    study: [
      'Data Structures & Algorithms — arrays, trees, graphs, DP',
      'System Design — distributed systems, databases, caching',
      'Cloud & DevOps — AWS/GCP, Docker, CI/CD',
      'Build SaaS projects — real products with real users',
    ],
    extras: ['Contribute to open source weekly', 'Build portfolio of 3-5 projects by year end'],
  },
  {
    id: 'fitness',
    icon: <Dumbbell className="w-5 h-5" />,
    title: 'Health, Fitness & Self-Defense',
    what: 'Gym workouts, calisthenics, martial arts drills. Alternate strength & cardio.',
    why: 'Your body is the vehicle for everything else. Physical strength builds mental resilience.',
    study: [
      'Strength training 3x/week — compound lifts, progressive overload',
      'Cardio 2-3x/week — running, swimming, or cycling',
      'Martial arts / self-defense 3x/week',
      'Track body measurements monthly',
    ],
    extras: ['Monthly body photos for progress tracking', 'Learn one new martial arts technique per week'],
  },
  {
    id: 'soft_skills',
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Soft Skills & Communication',
    what: 'Books, public speaking, writing, podcasts. Become a confident communicator.',
    why: 'Technical skills get you interviews. Communication skills get you leadership roles.',
    study: [
      'Read 1 book/month — start with: Never Split the Difference, How to Win Friends, Atomic Habits',
      'Practice writing daily in journal',
      'Record yourself speaking weekly — review and improve',
      'Listen to 2 podcasts per week on communication/leadership',
    ],
    extras: ['Join a speaking group or practice presentations', 'Write one blog post per month'],
  },
  {
    id: 'side_business',
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Side Business',
    what: 'Product building, marketing, freelancing, sales. Build something that earns.',
    why: 'A side business teaches you skills no job ever will — selling, marketing, building for customers.',
    study: [
      'Week 1-4: Validate an idea — talk to customers, research the market',
      'Month 2-3: Build the MVP — ship fast, iterate based on feedback',
      'Month 4+: Get your first paying customer',
      'The 90-minute block is sacred — protect it every day',
    ],
    extras: ['Read The Lean Startup or $100M Offers', 'Launch on Product Hunt or social media'],
  },
  {
    id: 'finance',
    icon: <DollarSign className="w-5 h-5" />,
    title: 'Finance & Money',
    what: 'Budgeting, investing, saving, financial literacy.',
    why: 'Financial freedom gives you options. Money stress kills productivity.',
    study: [
      'Track every expense — know where your money goes',
      'Save minimum 20% of income',
      'Learn: budgeting → index funds → tax basics → compounding',
      'Recommended: Zerodha Coin for investments',
    ],
    extras: ['Set up automatic monthly SIP', 'Review net worth quarterly'],
  },
  {
    id: 'culture',
    icon: <Landmark className="w-5 h-5" />,
    title: 'Culture — Assamese Heritage',
    what: 'Assamese language, history, traditions, heritage preservation.',
    why: 'Knowing your roots gives you identity and purpose. Culture is not just heritage — it\'s pride.',
    study: [
      'Learn 3 Assamese words/week',
      'Read Assamese history — start with the Ahom Kingdom',
      'Attend one Bihu celebration fully',
      'Talk to grandparents/elders monthly — record their stories',
    ],
    extras: ['Watch Assamese films or listen to Assamese music weekly', 'Cook one traditional dish per month'],
  },
  {
    id: 'family',
    icon: <Heart className="w-5 h-5" />,
    title: 'Family Responsibility',
    what: 'Household duties, family time, being dependable and present.',
    why: 'Success without family means nothing. Be the person your family can count on.',
    study: [
      'Show up reliably — keep your word to family',
      'Know household finances — bills, groceries, maintenance',
      'Be the person family can count on',
      'Ask parents what they need — don\'t wait to be told',
    ],
    extras: ['Plan one family outing per month', 'Help with one household task daily without being asked'],
  },
  {
    id: 'habit',
    icon: <Repeat className="w-5 h-5" />,
    title: 'Habit & Discipline',
    what: 'Consistent routines, journaling, sleep hygiene, discipline as identity.',
    why: 'The schedule IS the habit. Discipline beats motivation every single day.',
    study: [
      'Track streaks — never break the chain two days in a row',
      'Sleep and wake time are non-negotiable anchors',
      'Journal every night — 3 wins + 1 improvement',
      'No phone for first 30 minutes after waking',
    ],
    extras: ['Review weekly habits every Sunday', 'Reward yourself for 30-day streak milestones'],
  },
]

const YEAR_OUTCOMES = [
  { title: 'Software Engineering', result: '500+ hours of practice. Portfolio of 3-5 real projects. Significantly stronger interview performance.' },
  { title: 'Fitness', result: 'Visible body transformation. Real self-defense capability. Consistent energy throughout the day.' },
  { title: 'Soft Skills', result: 'Noticeably better communicator. Able to speak confidently in meetings and social settings.' },
  { title: 'Side Business', result: 'At least one paying customer or validated product idea.' },
  { title: 'Finance', result: '3-6 months emergency fund. Started investing. Clear monthly budget habit.' },
  { title: 'Culture', result: 'Reconnected with Assamese roots. Proud of heritage. Able to have basic conversations in Assamese.' },
  { title: 'Family', result: 'Recognized as dependable and responsible. Real contribution to household.' },
  { title: 'Habit', result: '200+ day streak. Discipline as identity, not effort.' },
]

export default function Philosophy() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)

  return (
    <div className="pb-6 space-y-8">
      {/* Vision */}
      <div className="bg-gradient-to-br from-teal-500/10 to-blue-600/10 rounded-2xl border border-teal-500/20 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-500 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">The Vision</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          In 365 days, every single domain of your life will be measurably better — not because you were gifted,
          but because you showed up every day when others did not. This is your operating system.
        </p>
      </div>

      {/* The 8 Pillars */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The 8 Pillars</h2>
        <div className="space-y-3">
          {PILLARS.map((pillar) => {
            const isExpanded = expandedPillar === pillar.id
            const color = PILLAR_COLORS[pillar.id]
            return (
              <div key={pillar.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {pillar.icon}
                  </div>
                  <span className="flex-1 font-semibold text-gray-900 dark:text-white">{pillar.title}</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">What it means</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{pillar.what}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Why it matters</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{pillar.why}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Study plan</h4>
                      <ul className="space-y-1">
                        {pillar.study.map((item, i) => (
                          <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-teal-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Weekly extras</h4>
                      <ul className="space-y-1">
                        {pillar.extras.map((item, i) => (
                          <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                            <span style={{ color }} className="mt-1">★</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Alternating Evening Rule */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">The Alternating Evening Rule</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600 dark:text-gray-300"><span className="text-purple-500 dark:text-purple-400 font-medium">Mon / Wed / Fri:</span> Soft skills learning</p>
          <p className="text-gray-600 dark:text-gray-300"><span className="text-purple-500 dark:text-purple-400 font-medium">Tue / Thu / Sat:</span> Culture & Assamese heritage</p>
          <p className="text-gray-600 dark:text-gray-300"><span className="text-purple-500 dark:text-purple-400 font-medium">Sunday:</span> Rest or family outing</p>
        </div>
      </div>

      {/* What 1 Year Looks Like */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What 1 Year Looks Like</h2>
        <div className="space-y-3">
          {YEAR_OUTCOMES.map((outcome) => (
            <div key={outcome.title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{outcome.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{outcome.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
