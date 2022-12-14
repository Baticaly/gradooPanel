import { useSession } from "@supabase/auth-helpers-react";
import Search from '../components/Search'

export default function SearchPage() {
    const session = useSession();

    return <>{!session ? <></> : <Search session={session} />}</>;
}
