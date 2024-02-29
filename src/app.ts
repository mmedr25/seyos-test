import express from "express";

const app = express();
// put in an env file
const PORT = 4000;
const RUNNING = `http://localhost:${PORT}`;
const API_URL = "https://trefle.io/api/v1/"
const ACCESS_TOKEN = "8fFX4FwH76RP4Y1GesjAJ_XP-kIXFCFqH-nkFeQWis0";


//put in utils
const parseUrl: ParseUrlType = (url, queries) => {
    let newUrl = new URL(url);

    for (let queryKey in queries) {
        const queryValue = queries[queryKey] + "" // coerce to string
        newUrl.searchParams.append(queryKey, queryValue);
    }

    return newUrl.toString()
}

const authFetch = async (path = "", queries = {}) => {
    const url = API_URL + path;
    const fetchUrl = parseUrl(url, queries)

    try {
        const response = await fetch(fetchUrl, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            }
        })
        return response.json()
        
    } catch (error) {
        // error handling here
        console.error(error)
    }
}


// queries
const getPlants = async (family_name: string) => {
    if (!family_name) return {}
    return authFetch("plants", {
        page: 1,
        "filter[family_common_name]": family_name
    })
}

const getSpeciesById = async (slug: string) => {
    return authFetch("species/" + slug, {
        page: 1,
        "filter[family_common_name]": slug
    })
}

const getGenusById = async (id: number) => {
    return authFetch("genus/" + id)
}


const cleanResponse = async (returnResult: PlantReturnType[], {year, scientific_name, genus_id, slug}: ApiPlantType) => {
    const genus = await getGenusById(genus_id)
    const species = await getSpeciesById(slug)

    returnResult.push({
        year, 
        scientific_name, 
        species_observation: species?.data?.observations,
        genus_family_common_name: genus?.data?.family.common_name
    })
}


//have a base url for all routes
//api 
app.get("/api/v1/", async(req, res) => {
    const queryFamName = req.query.family_common_name

    if (!queryFamName) {
        return res.status(400).send({message: "query param 'family_common_name' is requred!"})
    }
    
    const plantsResponse = await getPlants(queryFamName as string)

    if (!plantsResponse?.data) return res.send({message: "no data"})

    const returnResult: PlantReturnType[] = []

    for (const plant of plantsResponse.data) {
        await cleanResponse(returnResult, plant)
    }

    return res.send(returnResult)
})

app.listen(PORT, () => console.log({RUNNING}))