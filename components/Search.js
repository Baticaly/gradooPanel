import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';

export default function Search(session) {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [query, setQuery] = useState({ events: [], cities: [], schools: [], types: [] })
    const [schools, setSchools] = useState([])

    useEffect(() => {
        getProfile();
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) throw new Error("No user");

            let { data, error, status } = await supabase
                .from("profiles")
                .select(`username, avatar_url`)
                .eq("id", user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
                downloadImage(data.avatar_url);
            }
        } catch (error) {
            alert("Error loading user data!");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage
                .from("avatars")
                .download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log("Error downloading image: ", error);
        }
    }

    const colourStyles = {
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                backgroundColor: isFocused ? "#999999" : null,
                color: "#333333"
            };
        },
        container: base => ({
            ...base,
            flex: 1,
            padding: '.5rem',
        }),
        menuList: (provided, state) => ({
            ...provided,
            paddingTop: 0,
            paddingBottom: 0
        })
    };

    const eventoptions = [
        { value: 'Learn How to Learn', label: 'Learn How to Learn' },
        { value: 'Gradoo x Derece Atölyesi', label: 'Gradoo x Derece Atölyesi' },
    ]

    const cityoptions = [
        { value: 'Istanbul', label: 'Istanbul' },
        { value: 'Ankara', label: 'Ankara' },
        { value: 'Izmir', label: 'Izmir' },
    ]

    const classoptions = [
        { value: 'Hazırlık & Lise', label: 'Hazırlık (Lise)' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
        { value: 'Hazırlık & Üniversite', label: 'Hazırlık (Üniversite)' },
        { value: '1', label: '1. sınıf' },
        { value: '2', label: '2. sınıf' },
        { value: '3', label: '3. sınıf' },
        { value: '4', label: '4. sınıf' },
    ]

    // const usertypeoptions = [
    //     { value: 'Lise', label: 'Lise' },
    //     { value: 'Üniversite', label: 'Üniversite' },
    //     { value: 'Diğer', label: 'Diğer' },
    // ]

    const usertypeoptions = [
        { value: 'lise', label: 'High School' },
        { value: 'üniversite', label: 'University' },
        { value: 'diğer', label: 'Other' }
    ]

    const eventchange = (input) => {
        let eventlist = []

        input.forEach(i => {
            eventlist.push(i.value)
        });

        setQuery(query => ({ ...query, events: eventlist }))
    }

    const citychange = async (input) => {
        let citylist = []

        input.forEach(i => {
            citylist.push(i.value)
        });

        setQuery(query => ({ ...query, cities: citylist }))
    }

    const schoolchange = async (input) => {
        let schoollist = []

        input.forEach(i => {
            schoollist.push(i.value)
        });

        setQuery(query => ({ ...query, schools: schoollist }))

    }

    const usertypechange = async (input) => {
        let usertypes = []

        input.forEach(i => {
            usertypes.push(i.value)
        });

        setQuery(query => ({ ...query, types: usertypes }))
    }

    const classchange = async (input) => {
        let classtypes = []

        input.forEach(i => {
            classtypes.push(i.value)
        });

        setQuery(query => ({ ...query, class: classtypes }))
    }

    function wordSplit(splitinput) {
        let returnstring = '( '
        if (JSON.stringify(splitinput2).indexOf(" ") >= 0) {

            let words = JSON.stringify(splitinput2).split(" ")
            words.forEach(w => {
                returnstring = returnstring.concat(JSON.stringify(w), ' |')
            });
            returnstring = returnstring.substring(0, returnstring.length - 1, ')')

        }
        return returnstring
    }

    const search = async () => {
        //console.log(query)

        async function fullquery() {
            if (query !== null) {
                let resultList = []
                let searchstring = ""

                if (query.types != undefined) {
                    if (query.types.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.types.length; i++) {
                            if (i > 0 && i < query.types.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.types[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.types[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.events != undefined) {
                    if (query.events.length != 0) {
                        searchstring = searchstring.concat("(")
                        for (let i = 0; i < query.events.length; i++) {
                            if (i > 0 && i < query.events.length + 1) {
                                let splitted = ''
                                if (JSON.stringify(query.events[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.events[i]).replaceAll(' ', ' | ')
                                    searchstring = searchstring.concat(' | ', splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.events[i])) }
                            } else {
                                let splitted = ''
                                if (JSON.stringify(query.events[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.events[i]).replaceAll(' ', ' | ')
                                    searchstring = searchstring.concat(splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.events[i])) }
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.cities != undefined) {
                    if (query.cities.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.cities.length; i++) {
                            if (i > 0 && i < query.cities.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.cities[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.cities[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.class != undefined) {
                    if (query.class.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.class.length; i++) {
                            if (i > 0 && i < query.class.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.class[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.class[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.schools != undefined) {
                    if (query.schools.length != 0) {
                        searchstring = searchstring.concat("(")
                        for (let i = 0; i < query.schools.length; i++) {
                            if (i > 0 && i < query.schools.length + 1) {
                                let splitted = ''
                                if (JSON.stringify(query.schools[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.schools[i]).replaceAll(' ', ' & ')
                                    searchstring = searchstring.concat(' & ', splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.schools[i])) }
                            } else {
                                let splitted = ''
                                if (JSON.stringify(query.schools[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.schools[i]).replaceAll(' ', ' & ')
                                    searchstring = searchstring.concat(splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.schools[i])) }
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }


                const { data, error } = await supabase.rpc('renderschoollist', { input: searchstring.substring(0, searchstring.length - 3) })
                console.log(error)

                console.log('querystring - ', searchstring.substring(0, searchstring.length - 3))

                if (data !== null) {
                    data.forEach(e => {
                        resultList.push(e)
                    })
                    setSchools(resultList)
                }

            }
        }
        fullquery()
    }

    return (
        <>
            <div className="sidebar">
                <h1>Gradoo Panel</h1>
                <img src="/img/divider.svg" className="divider" />

                <div className="section summary" onClick={() => router.push({ pathname: "/" })} >
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Summary</h2>
                </div>

                <div className="section query bg-active-menu" onClick={() => router.push({ pathname: "/search" })} >
                    <img src="/img/query.svg" className="icon" />
                    <h2>Search</h2>
                </div>

                <div className="section campaigns" campaign-button>
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Campaigns</h2>
                </div>

                <div className="campaignlist visible" campaign-list>
                    <div
                        className="campaignelement"
                        onClick={() => router.push({ pathname: "/project/1" })}
                    >
                        Gradoo x Derece Atölyesi
                    </div>
                    <div
                        className="campaignelement"
                        onClick={() => router.push({ pathname: "/project/2" })}
                    >
                        Learn How to Learn: English
                    </div>
                </div>

                <div
                    className="section settings"
                    onClick={() => supabase.auth.signOut()}
                >
                    <img src="/img/db.svg" className="icon" />
                    <h2>Log Out</h2>
                </div>
            </div>

            <div className="container">
                <div className="header">
                    <div className="title">
                        <img src="/img/summary2.svg" />
                        <h2 className="flex items-center text-lg font-medium">Search</h2>
                    </div>
                    <div
                        className="profile"
                        onClick={() => router.push({ pathname: "/account" })}
                    >
                        <h3 className="flex items-center text-base font-medium">{username}</h3>
                        {avatar_url ? (
                            <>
                                <img src={avatar_url} alt="Avatar" className="avatar image" />
                            </>
                        ) : (
                            <>
                                <div className="avatar no-image" />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-col">
                    <div className="flex w-full h-8 justify-evenly px-2 text-sm">

                        <div className="flex grow basis-14">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Event'} options={eventoptions} onChange={eventchange} />
                        </div>

                        <div className="flex grow basis-10">
                            <CreatableSelect isClearable isMulti styles={colourStyles} placeholder={'City'} options={cityoptions} onChange={citychange} />
                        </div>

                        <div className="flex grow basis-10">
                            <CreatableSelect isClearable isMulti styles={colourStyles} placeholder={'School'} onChange={schoolchange} />
                        </div>

                        <div className="flex grow basis-10">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Usertype'} options={usertypeoptions} onChange={usertypechange} />
                        </div>

                        <div className="flex grow basis-10">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Class'} options={classoptions} onChange={classchange} />
                        </div>

                        <div className="flex bg-activeMenu rounded-xl text-fontSecondary w-8  h-8 mt-1 justify-center hover:cursor-pointer hover:bg-dropShadow" onClick={search}>
                            <img src="/img/query.svg" className="w-4" />
                        </div>

                    </div>

                    <div className="flex mt-14 p-4">
                        <div className="flex bg-cardBackground p-4 text-fontPrimary rounded-xl">
                            <p className="text-current font-semibold">{schools.length}</p>
                            <p className="text-current ml-1"> result(s) found.</p>
                        </div>
                    </div>

                    <div className="flex px-4">
                        <div className="p-2 bg-cardBackground w-full h-[50vh] rounded-2xl overflow-auto">
                            <div className="table w-full">

                                <div className="table-header-group">
                                    <div className="table-row">
                                        <p className="table-cell text-fontPrimary text-base">School</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">Applications</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">City</p>
                                    </div>
                                </div>

                                <div class="table-row-group">

                                    {schools.map(school => (
                                        <>
                                            <div className="table-row mt-1 text-fontPrimary hover:bg-dropShadow hover:text-fontSecondary hover:cursor-pointer">
                                                <div className="table-cell text-current text-sm">{school.name}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.count}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.city}</div>
                                            </div>
                                        </>
                                    ))}


                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}
