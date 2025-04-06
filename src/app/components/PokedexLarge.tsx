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
    const selectedImg: keyof Pokemon = shinyKeys[0];
    const selectedLang = languages[1];

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
                                <ModalHeader>{selectedPokemon.name[selectedLang]}</ModalHeader>
                                <ModalBody>
                                    <p>Génération : {selectedPokemon.generation}</p>
                                    <p>Hauteur : {selectedPokemon.height}</p>
                                    <p>Poids : {selectedPokemon.weight}</p>
                                    <p className="mt-2 font-semibold">Stats :</p>
                                    <p>PV : {selectedPokemon.stats.hp}</p>
                                    <p>Attaque : {selectedPokemon.stats.atk}</p>
                                    <p>Défense : {selectedPokemon.stats.def}</p>
                                    <p>Attaque Spé : {selectedPokemon.stats.spe_atk}</p>
                                    <p>Défense Spé : {selectedPokemon.stats.spe_def}</p>
                                    <p>Vitesse : {selectedPokemon.stats.vit}</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={onClose}>Fermer</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
}
