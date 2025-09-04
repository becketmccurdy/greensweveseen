import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// Types
export interface Course {
  id?: string
  name: string
  location: string
  par: number
  holes: number
  rating?: number
  slope?: number
  description?: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Round {
  id?: string
  courseId: string
  courseName?: string
  date: Date
  score: number
  putts?: number
  fairwaysHit?: number
  greensInRegulation?: number
  notes?: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id?: string
  email: string
  name?: string
  handicap?: number
  createdAt: Date
  updatedAt: Date
}

// User Profile functions
export const createUserProfile = async (userId: string, email: string, name?: string): Promise<UserProfile> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const userProfile: Omit<UserProfile, 'id'> = {
    email,
    name: name || email.split('@')[0],
    handicap: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, userProfile as any)
  
  return { id: userId, ...userProfile }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      email: data.email,
      name: data.name,
      handicap: data.handicap,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }
  
  return null
}

// Course functions
export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const courseData = {
    ...course,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  const docRef = await addDoc(collection(db, 'courses'), courseData)
  
  return {
    id: docRef.id,
    ...course,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export const getCourses = async (userId?: string): Promise<Course[]> => {
  if (!db) throw new Error('Firestore not initialized')
  
  let q = query(collection(db, 'courses'), orderBy('name'))
  
  if (userId) {
    q = query(collection(db, 'courses'), where('createdById', '==', userId), orderBy('name'))
  }
  
  const querySnapshot = await getDocs(q)
  const courses: Course[] = []
  
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    courses.push({
      id: doc.id,
      name: data.name,
      location: data.location,
      par: data.par,
      holes: data.holes,
      rating: data.rating,
      slope: data.slope,
      description: data.description,
      createdById: data.createdById,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    })
  })
  
  return courses
}

// Round functions
export const createRound = async (round: Omit<Round, 'id' | 'createdAt' | 'updatedAt'>): Promise<Round> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const roundData = {
    ...round,
    date: Timestamp.fromDate(round.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  const docRef = await addDoc(collection(db, 'rounds'), roundData)
  
  return {
    id: docRef.id,
    ...round,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export const getRounds = async (userId: string): Promise<Round[]> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const q = query(
    collection(db, 'rounds'), 
    where('createdById', '==', userId), 
    orderBy('date', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  const rounds: Round[] = []
  
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    rounds.push({
      id: doc.id,
      courseId: data.courseId,
      courseName: data.courseName,
      date: data.date?.toDate() || new Date(),
      score: data.score,
      putts: data.putts,
      fairwaysHit: data.fairwaysHit,
      greensInRegulation: data.greensInRegulation,
      notes: data.notes,
      createdById: data.createdById,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    })
  })
  
  return rounds
}

export const getRound = async (roundId: string): Promise<Round | null> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const docRef = doc(db, 'rounds', roundId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      courseId: data.courseId,
      courseName: data.courseName,
      date: data.date?.toDate() || new Date(),
      score: data.score,
      putts: data.putts,
      fairwaysHit: data.fairwaysHit,
      greensInRegulation: data.greensInRegulation,
      notes: data.notes,
      createdById: data.createdById,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }
  
  return null
}

export const updateRound = async (roundId: string, updates: Partial<Round>): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now()
  }
  
  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date)
  }
  
  const docRef = doc(db, 'rounds', roundId)
  await updateDoc(docRef, updateData)
}

export const deleteRound = async (roundId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const docRef = doc(db, 'rounds', roundId)
  await deleteDoc(docRef)
}

export const getRecentRounds = async (userId: string, limitCount: number = 5): Promise<Round[]> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const q = query(
    collection(db, 'rounds'), 
    where('createdById', '==', userId), 
    orderBy('date', 'desc'),
    limit(limitCount)
  )
  
  const querySnapshot = await getDocs(q)
  const rounds: Round[] = []
  
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    rounds.push({
      id: doc.id,
      courseId: data.courseId,
      courseName: data.courseName,
      date: data.date?.toDate() || new Date(),
      score: data.score,
      putts: data.putts,
      fairwaysHit: data.fairwaysHit,
      greensInRegulation: data.greensInRegulation,
      notes: data.notes,
      createdById: data.createdById,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    })
  })
  
  return rounds
}
