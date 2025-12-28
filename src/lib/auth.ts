import { auth } from "./firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    hd: "sahyadri.edu.in"
});

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user.email?.endsWith("@sahyadri.edu.in")) {
            await firebaseSignOut(auth);
            throw new Error("Only @sahyadri.edu.in emails are allowed.");
        }

        return user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const signOut = () => firebaseSignOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
