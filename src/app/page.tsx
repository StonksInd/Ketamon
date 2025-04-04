"use client";

import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";

interface Pokemon {
  id: number;
  generation: number;
  name: {
    en: string;
    fr: string;
  };
  image: string;
  image_shiny: string;
  height: number;
  weight: number;
  stats: {
    hp: number;
    atk: number;
    def: number;
    spe_atk: number;
    spe_def: number;
    vit: number;
  };
  types: number[];
  evolvedFrom: number[];
  evolvesTo: Record<number, string>;
}

export default function Page() {
  const [dataPoke, setDataPoke] = useState<Pokemon[]>([]);
  const [dataType, setDataType] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Pour capturer les erreurs
  const langage = ["en", "fr"];
  const shiny: (keyof Pokemon)[] = ["image", "image_shiny"];
  const selectedImg: keyof Pokemon = shiny[0];
  const selectedLang = langage[1];
  const [inputText, setInputText] = useState("");

  let inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {

    //convert input text to lower case

    var lowerCase = e.target.value.toLowerCase();

    setInputText(lowerCase);
  };



  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔄 Fetching data...");
        const resPoke = await fetch("https://pokedex-api.3rgo.tech/api/pokemon");
        const resType = await fetch("https://pokedex-api.3rgo.tech/api/types");
        if (!resPoke.ok) {
          throw new Error(`HTTP error! Status: ${resPoke.status}`);
        }

        const jsonPoke = await resPoke.json();
        const jsonType = await resType.json();
        console.log("✅ Réponse API reçue :", jsonPoke); // Afficher la réponse dans la console
        setDataType(jsonType.data);
        setDataPoke(jsonPoke.data);
      } catch (error) {
        console.error("❌ Erreur lors du fetch :", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>⏳ Chargement...</p>;
  if (error) return <p>❌ Erreur : {error}</p>;
  if (!dataPoke || dataPoke.length === 0) return <p>Aucun Pokémon trouvé.</p>;

  return (
    <div className="p-4">
      <TextField
        id="outlined-basic"
        variant="outlined"
        fullWidth
        label="Search"
        onChange={inputHandler}
        className="mb-4"
      />
      <h1 className="text-2xl font-bold text-center mb-6">Liste des Pokémon</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {dataPoke
          .filter((pokemon) =>
            pokemon.name[selectedLang as keyof typeof pokemon.name].toLowerCase().includes(inputText.toLowerCase())
          )
          .map((pokemon) => (
            <div key={pokemon.id} className="bg-gray-200 rounded-lg p-4 shadow-md border-2 border-yellow-500 flex flex-col items-center">
              <p className="text-gray-700 font-bold">#{pokemon.id}</p>
              <img className="w-20 h-20 my-2" src={pokemon[selectedImg] as string} alt={pokemon.name[selectedLang]} />
              <p className="text-center text-lg font-semibold">{pokemon.name[selectedLang]}</p>

              {/* Types */}
              <div className="flex justify-center space-x-2 mt-2">
                {dataType.map((type) =>
                  pokemon.types.includes(type.id) ? (
                    <div key={type.id} className="flex items-center bg-white rounded-full px-2 py-1 shadow">
                      <img className="w-5 h-5 mr-1" src={type.image} alt={type.name[selectedLang]} />
                      <span className="text-sm font-medium">{type.name[selectedLang]}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
      </div>
    </div>

  );
}



{/* <p>height {pokemon.height}</p>
            <p>weight {pokemon.weight}</p>
            <p>stats</p>
            <p>healt point {pokemon.stats.hp}</p>
            <p>attack {pokemon.stats.atk}</p>
            <p>defence {pokemon.stats.def}</p>
            <p>special attack {pokemon.stats.spe_atk}</p>
            <p>special defence {pokemon.stats.spe_def}</p>
            <p>speed {pokemon.stats.vit}</p> */}