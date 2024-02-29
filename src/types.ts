interface PlantData {
    year: number,
    scientific_name: string,
}

interface PlantReturnType extends PlantData {
    species_observation: string,
    genus_family_common_name: string
}

interface ApiPlantType extends PlantData {
    slug: string,
    genus_id: number
}

type ParseUrlType = (url: string, queries: {[key: string]: string | number | null | boolean}) => string
