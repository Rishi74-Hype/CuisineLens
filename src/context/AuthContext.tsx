import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from '../lib/firebase.ts';
import { UserProfile, MealLogItem } from '../types/nutrition.ts';
import { WaterLogMap } from '../utils/nutritionCalculator.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfileToFirestore: (profile: UserProfile) => Promise<void>;
  syncMealToFirestore: (meal: MealLogItem) => Promise<void>;
  deleteMealFromFirestore: (mealId: string) => Promise<void>;
  syncWaterToFirestore: (date: string, glasses: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onProfileSynced?: (profile: UserProfile) => void;
  onMealsSynced?: (meals: MealLogItem[]) => void;
  onWaterSynced?: (water: WaterLogMap) => void;
}> = ({ children, onProfileSynced, onMealsSynced, onWaterSynced }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && onProfileSynced) {
            onProfileSynced(snap.data() as UserProfile);
          }
        } catch (e) {
          console.warn('Could not read user profile from Firestore:', e);
        }

        // Real-time listener for meals subcollection
        try {
          const mealsColRef = collection(db, 'users', currentUser.uid, 'meals');
          const unsubMeals = onSnapshot(mealsColRef, (snapshot) => {
            if (!snapshot.empty && onMealsSynced) {
              const loadedMeals: MealLogItem[] = [];
              snapshot.forEach((d) => {
                loadedMeals.push(d.data() as MealLogItem);
              });
              // Sort descending by loggedAt
              loadedMeals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
              onMealsSynced(loadedMeals);
            }
          });

          // Real-time listener for water logs subcollection
          const waterColRef = collection(db, 'users', currentUser.uid, 'waterLogs');
          const unsubWater = onSnapshot(waterColRef, (snapshot) => {
            if (!snapshot.empty && onWaterSynced) {
              const loadedWater: WaterLogMap = {};
              snapshot.forEach((d) => {
                const data = d.data();
                if (data.date && typeof data.glasses === 'number') {
                  loadedWater[data.date] = data.glasses;
                }
              });
              onWaterSynced(loadedWater);
            }
          });

          return () => {
            unsubMeals();
            unsubWater();
          };
        } catch (err) {
          console.warn('Firestore snapshot error:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const syncProfileToFirestore = async (profile: UserProfile) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...profile,
        uid: user.uid,
        email: user.email || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync profile to Firestore:', e);
    }
  };

  const syncMealToFirestore = async (meal: MealLogItem) => {
    if (!user) return;
    try {
      const mealDocRef = doc(db, 'users', user.uid, 'meals', meal.id);
      await setDoc(mealDocRef, {
        ...meal,
        userId: user.uid,
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync meal to Firestore:', e);
    }
  };

  const deleteMealFromFirestore = async (mealId: string) => {
    if (!user) return;
    try {
      const mealDocRef = doc(db, 'users', user.uid, 'meals', mealId);
      await deleteDoc(mealDocRef);
    } catch (e) {
      console.warn('Failed to delete meal from Firestore:', e);
    }
  };

  const syncWaterToFirestore = async (date: string, glasses: number) => {
    if (!user) return;
    try {
      const waterDocRef = doc(db, 'users', user.uid, 'waterLogs', date);
      await setDoc(waterDocRef, {
        date,
        userId: user.uid,
        glasses,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync water to Firestore:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        syncProfileToFirestore,
        syncMealToFirestore,
        deleteMealFromFirestore,
        syncWaterToFirestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
