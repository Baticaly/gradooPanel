import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Dashboard from "./dashboard";
import Account from "../components/Account";

const Home = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      {!session ? (
        <Auth
          view="sign_in"
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      ) : (
        <Dashboard session={session} />
      )}
    </>
  );
};

export default Home;
