"use client";

import { useEffect, useState } from "react";

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
  const shiny = ["image", "image_shiny"];
  const selectedImg = shiny[0];
  const selectedLang = langage[1];

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
        setError(error.message);
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
    <>
      <h1>Liste des Pokémon</h1>
      {dataPoke.map((pokemon) => (
        <ul key={pokemon.id} id={pokemon.id}>
          <p>#{pokemon.id}</p>
          <p>{pokemon.name[selectedLang]}</p>
          <img src={pokemon[selectedImg]} alt={pokemon.name[selectedLang]} />
          <p>height {pokemon.height}</p>
          <p>weight {pokemon.weight}</p>
          <p>stats</p>
          <p>healt point {pokemon.stats.hp}</p>
          <p>attack {pokemon.stats.atk}</p>
          <p>defence {pokemon.stats.def}</p>
          <p>special attack {pokemon.stats.spe_atk}</p>
          <p>special defence {pokemon.stats.spe_def}</p>
          <p>speed {pokemon.stats.vit}</p>

          {dataType.map((type) => {
            if (pokemon.types.includes(type.id)) {
              return <p key={type.id}>
                <img src={type.image} alt={type.name[selectedLang]} />

                {type.name[selectedLang]}


              </p>;
            }
          }
          )}
        </ul>
      ))}
    </>
  );
}
