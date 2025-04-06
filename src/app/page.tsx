"use client";
import "../index.css";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@mui/material";

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

interface Type {
  id: number;
  name: {
    en: string;
    fr: string;
  };
  image: string;
}

const PokemonCard = ({
  pokemon,
  typeList,
  selectedLang,
  selectedImg,
  onClick,
}: {
  pokemon: Pokemon;
  typeList: Type[];
  selectedLang: string;
  selectedImg: keyof Pokemon;
  onClick: () => void;
}) => (
  <Button
    key={pokemon.id}
    onClick={onClick}
    className="bg-gray-200 rounded-lg p-4 shadow-md border-2 border-yellow-500 flex flex-col items-center"
  >
    <div className="flex flex-col items-center">
      <div className="flex space-x-4">
        <p className="text-gray-700 font-bold">#{pokemon.id}</p>
        <p className="text-gray-700 font-bold">Gen: {pokemon.generation}</p>
      </div>
      <img
        className="w-20 h-20 my-2"
        src={pokemon[selectedImg] as string}
        alt={pokemon.name[selectedLang]}
      />
      <p className="text-center text-lg font-semibold">{pokemon.name[selectedLang]}</p>

      <div className="flex justify-center space-x-2 mt-2">
        {typeList.map((type) =>
          pokemon.types.includes(type.id) ? (
            <div key={type.id} className="flex items-center bg-white rounded-full px-2 py-1 shadow">
              <img
                className="w-5 h-5 mr-1"
                src={type.image}
                alt={type.name[selectedLang]}
              />
              <span className="text-sm font-medium">
                {type.name[selectedLang]}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  </Button>
);

export default function Page() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [typeList, setTypeList] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedType, setSelectedType] = useState<number | "">("");
  const [selectedGen, setSelectedGen] = useState<number | "">("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const languages = ["en", "fr"];
  const shinyKeys: (keyof Pokemon)[] = ["image", "image_shiny"];
  const [selectedImg, setselectedImg] = useState(shinyKeys[0]);
  const [selectedLang, setSelectedLang] = useState(languages[1]);

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value.toLowerCase());
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const resPoke = await fetch("https://pokedex-api.3rgo.tech/api/pokemon");
        const resType = await fetch("https://pokedex-api.3rgo.tech/api/types");

        if (!resPoke.ok) throw new Error(`HTTP error! Status: ${resPoke.status}`);
        const jsonPoke = await resPoke.json();
        const jsonType = await resType.json();

        setPokemonList(jsonPoke.data);
        setTypeList(jsonType.data);
      } catch (error) {
        if (error instanceof Error) setError(error.message);
        else setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredPokemon = pokemonList
    .filter((pokemon) =>
      pokemon.name[selectedLang].toLowerCase().includes(inputText)
    )
    .filter((pokemon) => (selectedGen ? pokemon.generation === selectedGen : true))
    .filter((pokemon) => (selectedType ? pokemon.types.includes(selectedType) : true));

  const generationOptions = Array.from(new Set(pokemonList.map(p => p.generation))).sort((a, b) => a - b);

  if (loading) return <p>⏳ Chargement...</p>;
  if (error) return <p>❌ Erreur : {error}</p>;
  if (!pokemonList || pokemonList.length === 0) return <p>Aucun Pokémon trouvé.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <TextField
            id="outlined-basic"
            variant="outlined"
            label="Search"
            onChange={inputHandler}
            className="flex-grow"
          />

          <button
            onClick={() => {
              setSelectedLang(selectedLang === "fr" ? "en" : "fr");
            }}
            className="bg-yellow-500 text-white rounded-lg px-4 py-2 shadow hover:bg-yellow-600 transition"
          >
            Langue : {selectedLang === "fr" ? "Français" : "Anglais"}
          </button>

          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="bg-white rounded-lg px-4 py-2 shadow border border-gray-300 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Toutes Générations</option>
            {generationOptions.map((gen) => (
              <option key={gen} value={gen}>
                Génération {gen}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="bg-white rounded-lg px-4 py-2 shadow border border-gray-300 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Tous Types</option>
            {typeList.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name[selectedLang]}
              </option>
            ))}
          </select>

          <select
            name="tri"
            id="tri"
            onChange={(e) => {
              const value = e.target.value;
              const sortedList = [...pokemonList];
              switch (value) {
                case "number-asc":
                  sortedList.sort((a, b) => a.id - b.id);
                  break;
                case "number-desc":
                  sortedList.sort((a, b) => b.id - a.id);
                  break;
                case "name-asc":
                  sortedList.sort((a, b) =>
                    a.name[selectedLang].localeCompare(b.name[selectedLang])
                  );
                  break;
                case "name-desc":
                  sortedList.sort((a, b) =>
                    b.name[selectedLang].localeCompare(a.name[selectedLang])
                  );
                  break;
                case "weight-asc":
                  sortedList.sort((a, b) => a.weight - b.weight);
                  break;
                case "weight-desc":
                  sortedList.sort((a, b) => b.weight - a.weight);
                  break;
                case "height-asc":
                  sortedList.sort((a, b) => a.height - b.height);
                  break;
                case "height-desc":
                  sortedList.sort((a, b) => b.height - a.height);
                  break;
              }
              setPokemonList(sortedList);
            }}
            className="bg-white rounded-lg px-4 py-2 shadow border border-gray-300 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="number-asc">Numéro (croissant)</option>
            <option value="number-desc">Numéro (décroissant)</option>
            <option value="name-asc">Alphabétique (A-Z)</option>
            <option value="name-desc">Alphabétique (Z-A)</option>
            <option value="weight-asc">Poids (croissant)</option>
            <option value="weight-desc">Poids (décroissant)</option>
            <option value="height-asc">Taille (croissant)</option>
            <option value="height-desc">Taille (décroissant)</option>
          </select>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Liste des Pokémon</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            typeList={typeList}
            selectedLang={selectedLang}
            selectedImg={selectedImg}
            onClick={() => {
              setSelectedPokemon(pokemon);
              onOpen();
            }}
          />
        ))}
      </div>

      {/* Modal détaillé */}
      {selectedPokemon && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-center text-2xl font-bold text-gray-800">
                  {selectedPokemon.name[selectedLang]}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedPokemon[selectedImg] as string}
                      alt={selectedPokemon.name[selectedLang]}
                      className="w-48 h-48 object-contain mb-6"
                    />

                    <h2 className="text-2xl font-bold mb-2 text-gray-800">
                      {selectedPokemon.name[selectedLang]}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      #{selectedPokemon.id} | Gen {selectedPokemon.generation}
                    </p>

                    <div className="flex gap-3 mb-6">
                      {typeList.map((type) =>
                        selectedPokemon.types.includes(type.id) ? (
                          <div
                            key={type.id}
                            className="flex items-center bg-yellow-100 rounded-full px-4 py-2 border border-yellow-500 shadow"
                          >
                            <img
                              src={type.image}
                              alt={type.name[selectedLang]}
                              className="w-6 h-6 mr-2"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {type.name[selectedLang]}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mb-8">
                      <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
                        <p className="font-semibold">Taille</p>
                        <p>{selectedPokemon.height} m</p>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
                        <p className="font-semibold">Poids</p>
                        <p>{selectedPokemon.weight} kg</p>
                      </div>
                    </div>

                    <div className="w-full max-w-md">
                      <p className="font-semibold text-lg mb-4 text-center text-gray-800">Statistiques</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(selectedPokemon.stats).map(([key, value]) => (
                          <div key={key} className="bg-white p-4 rounded-lg shadow border">
                            <p className="font-semibold text-gray-700">
                              {({
                                hp: "PV",
                                atk: "Attaque",
                                def: "Défense",
                                spe_atk: "Att. Spé",
                                spe_def: "Déf. Spé",
                                vit: "Vitesse",
                              }[key as keyof Pokemon["stats"]])}
                            </p>
                            <p>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="flex justify-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Fermer
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
