import { createContext, ReactNode, useEffect, useState } from "react";
import * as GoogleAuth from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { api } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

interface IUserProps {
  name: string;
  avatarUrl: string;
}

export interface IAuthContextProps {
  user: IUserProps;
  isUserLoading: boolean;
  signIn: () => Promise<void>;
}

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContextProps);

export function AuthContextProvider({ children }: IAuthProviderProps) {
  const [user, setUser] = useState<IUserProps>({} as IUserProps);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [request, response, promptAsync] = GoogleAuth.useAuthRequest({
    clientId:
      "347824417280-g23oimtcue5pdjgkobqjmdqqunjdo4lf.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ["profile", "email"],
  });

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (error) {
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  async function signInWithGoogle(access_token: string) {
    try {
      setIsUserLoading(true);

      const tokenResponse = await api.post("/users", { access_token });
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokenResponse.data.token}`;

      const userInfoResponse = await api.get("/me");
      setUser(userInfoResponse.data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken);
    }
  }, [response]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        isUserLoading,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
