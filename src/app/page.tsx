"use client";
import '../index.css';
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from '@mui/material';

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
        loading="lazy"
        className="w-20 h-20 my-2"
        src={pokemon[selectedImg] as string}
        alt={pokemon.name[selectedLang]}
      />
      <p className="text-center text-lg font-semibold">
        {pokemon.name[selectedLang]}
      </p>

      <div className="flex justify-center space-x-2 mt-2">
        {typeList.map((type) =>
          pokemon.types.includes(type.id) ? (
            <div key={type.id} className="flex items-center bg-white rounded-full px-2 py-1 shadow">
              <img
                loading="lazy"
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const languages = ["en", "fr"];
  const shinyKeys: (keyof Pokemon)[] = ["image", "image_shiny"];
  const [selectedImg, setselectedImg] = useState(shinyKeys[1]);
  const [selectedLang, setSelectedLang] = useState(languages[1]);

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value.toLowerCase());
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const resPoke = await fetch("https://pokedex-api.3rgo.tech/api/pokemon");
        const resType = await fetch("https://pokedex-api.3rgo.tech/api/types");

        if (!resPoke.ok) {
          throw new Error(`HTTP error! Status: ${resPoke.status}`);
        }

        const jsonPoke = await resPoke.json();
        const jsonType = await resType.json();

        setPokemonList(jsonPoke.data);
        setTypeList(jsonType.data);
      } catch (error) {
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
  if (!pokemonList || pokemonList.length === 0) return <p>Aucun Pokémon trouvé.</p>;

  const lowerSearch = inputText.toLowerCase();

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
      <button onClick={() => {
        setSelectedLang(selectedLang === languages[1] ? languages[0] : languages[1]);
      }
      } className="mb-4 bg-gray-200 rounded-lg p-2 shadow-md border-2 border-yellow-500 flex items-center justify-center">

        {selectedLang === "en" ? (
          <span className="text-gray-700 font-bold">Langue : Anglais</span>
        ) : selectedLang === "fr" ? (
          <span className="text-gray-700 font-bold">Langue : Français</span>
        ) : null}
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Liste des Pokémon</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {pokemonList
          .filter((pokemon) =>
            pokemon.name[selectedLang]
              .toLowerCase()
              .includes(lowerSearch)
          )
          .map((pokemon) => (
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

      {selectedPokemon && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-center text-xl font-bold">
                  {selectedPokemon.name[selectedLang]}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex space-x-4">
                      <p className="text-gray-700 font-bold">#{selectedPokemon.id}</p>
                      <p className="text-gray-700 font-bold">Gen: {selectedPokemon.generation}</p>
                    </div>
                    <img
                      loading="lazy"
                      className="w-32 h-32"
                      src={selectedPokemon[selectedImg] as string}
                      alt={selectedPokemon.name[selectedLang]}
                    />
                    <button onClick={() => {
                      setSelectedLang(selectedLang === languages[1] ? languages[0] : languages[1]);
                    }
                    } className="mb-4 bg-gray-200 rounded-lg p-2 shadow-md border-2 border-yellow-500 flex items-center justify-center">

                      {selectedLang === "en" ? (
                        <span className="text-gray-700 font-bold">Langue : Anglais</span>
                      ) : selectedLang === "fr" ? (
                        <span className="text-gray-700 font-bold">Langue : Français</span>
                      ) : null}
                    </button>
                    <button onClick={() => {
                      setselectedImg(selectedImg === shinyKeys[1] ? shinyKeys[0] : shinyKeys[1]);
                    }
                    } className="mb-4 bg-gray-200 rounded-lg p-2 shadow-md border-2 border-yellow-500 flex items-center justify-center">

                      {selectedImg === "image" ? (
                        <span className="text-gray-700 font-bold">normal</span>
                      ) : selectedImg === "image_shiny" ? (
                        <span className="text-gray-700 font-bold">shiny</span>
                      ) : null}
                    </button>
                    <div className="flex flex-wrap justify-center gap-2">
                      {typeList.map((type) =>
                        selectedPokemon.types.includes(type.id) ? (
                          <div
                            key={type.id}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1 shadow-md"
                          >
                            <img
                              loading="lazy"
                              className="w-5 h-5 mr-2"
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

                  <div className="mt-4 space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Hauteur :</span> {selectedPokemon.height} m
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Poids :</span> {selectedPokemon.weight} kg
                    </p>
                    <div className="mt-4">
                      <p className="font-semibold text-gray-800">Stats :</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>PV : {selectedPokemon.stats.hp}</li>
                        <li>Attaque : {selectedPokemon.stats.atk}</li>
                        <li>Défense : {selectedPokemon.stats.def}</li>
                        <li>Attaque Spé : {selectedPokemon.stats.spe_atk}</li>
                        <li>Défense Spé : {selectedPokemon.stats.spe_def}</li>
                        <li>Vitesse : {selectedPokemon.stats.vit}</li>
                      </ul>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="flex justify-end">
                  <Button variant="contained" color="primary" onClick={onClose}>
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
