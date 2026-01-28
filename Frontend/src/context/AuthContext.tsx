import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../api/axiosClient";
import { auth } from "../firebase";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type AuthCredentials = {
  name?: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (payload: AuthCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const persistAuth = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearPersistedAuth = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setToken(null);
        clearPersistedAuth();
        setLoading(false);
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      const nextUser: AuthUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? firebaseUser.email ?? "Anonymous",
        email: firebaseUser.email ?? "unknown@example.com",
        avatar: firebaseUser.photoURL,
      };

      setUser(nextUser);
      setToken(idToken);
      persistAuth(idToken, nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async ({ email, password }: AuthCredentials): Promise<void> => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    [],
  );

  const register = useCallback(
    async ({ name, email, password }: AuthCredentials): Promise<void> => {
      if (!name?.trim()) {
        throw new Error("Name is required");
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(credential.user, { displayName: name.trim() });
      await credential.user.getIdToken(true);
    },
    [],
  );

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const loginWithFacebook = useCallback(async (): Promise<void> => {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    await signInWithPopup(auth, provider);
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    setToken(null);
    clearPersistedAuth();
    void signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
    }),
    [
      loading,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
