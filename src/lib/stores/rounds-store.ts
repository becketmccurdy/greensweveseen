import { create } from 'zustand'

interface Round {
  id: string
  date: Date
  totalScore: number
  totalPar: number
  course: {
    name: string
    location: string | null
  }
  weather?: string | null
  notes?: string | null
}

interface RoundsState {
  rounds: Round[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setRounds: (rounds: Round[]) => void
  addRoundOptimistic: (round: Omit<Round, 'id'> & { tempId: string }) => void
  confirmRound: (tempId: string, actualRound: Round) => void
  removeOptimisticRound: (tempId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRoundsStore = create<RoundsState>((set, get) => ({
  rounds: [],
  isLoading: false,
  error: null,

  setRounds: (rounds) => set({ rounds }),

  addRoundOptimistic: (round) => {
    const optimisticRound: Round = {
      id: round.tempId,
      date: round.date,
      totalScore: round.totalScore,
      totalPar: round.totalPar,
      course: round.course,
      weather: round.weather,
      notes: round.notes,
    }
    
    set((state) => ({
      rounds: [optimisticRound, ...state.rounds]
    }))
  },

  confirmRound: (tempId, actualRound) => {
    set((state) => ({
      rounds: state.rounds.map((round) =>
        round.id === tempId ? actualRound : round
      )
    }))
  },

  removeOptimisticRound: (tempId) => {
    set((state) => ({
      rounds: state.rounds.filter((round) => round.id !== tempId)
    }))
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
