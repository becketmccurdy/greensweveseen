import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: 'Firebase not initialized' }
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: 'Firebase not initialized' }
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Create account with email and password
export const createAccountWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: 'Firebase not initialized' }
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign out
export const signOut = async () => {
  if (!auth) {
    return { error: 'Firebase not initialized' }
  }
  
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get current user
export const getCurrentUser = (): Promise<User | null> => {
  if (!auth) {
    return Promise.resolve(null)
  }
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null)
    return () => {} // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth!, callback)
}
