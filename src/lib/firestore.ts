import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface Course {
  id?: string
  name: string
  location: string | null
  par: number
  holes: number
  userId: string
  createdAt: Date
}

export interface Round {
  id?: string
  userId: string
  courseId: string
  courseName: string
  date: Date
  totalScore: number
  totalPar: number
  weather?: string | null
  notes?: string | null
  createdAt: Date
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  photoURL?: string | null
  createdAt: Date
  handicap?: number | null
}

// User Profile functions
export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt'>) => {
  const userRef = doc(db, 'users', profile.uid)
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp()
  })
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    const data = userSnap.data()
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as UserProfile
  }
  return null
}

// Course functions
export const createCourse = async (course: Omit<Course, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...course,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export const getCourses = async (userId: string): Promise<Course[]> => {
  const q = query(
    collection(db, 'courses'),
    where('userId', '==', userId),
    orderBy('name', 'asc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Course[]
}

// Round functions
export const createRound = async (round: Omit<Round, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'rounds'), {
    ...round,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export const getRounds = async (userId: string): Promise<Round[]> => {
  const q = query(
    collection(db, 'rounds'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Round[]
}

export const getRound = async (roundId: string): Promise<Round | null> => {
  const roundRef = doc(db, 'rounds', roundId)
  const roundSnap = await getDoc(roundRef)
  
  if (roundSnap.exists()) {
    const data = roundSnap.data()
    return {
      id: roundSnap.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date()
    } as Round
  }
  return null
}

export const updateRound = async (roundId: string, updates: Partial<Round>) => {
  const roundRef = doc(db, 'rounds', roundId)
  await updateDoc(roundRef, updates)
}

export const deleteRound = async (roundId: string) => {
  const roundRef = doc(db, 'rounds', roundId)
  await deleteDoc(roundRef)
}
