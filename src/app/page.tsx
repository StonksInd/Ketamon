import { useEffect, useState } from "react";

export default async function Page() {
  const res_poke = await fetch("https://pokedex-api.3rgo.tech/api/pokemon");
  const { data_poke } = await res_poke.json();

  const res_types = await fetch("https://pokedex-api.3rgo.tech/api/types");
  const { data_types } = await res_types.json();


  const langage = ["en", "fr"];
  const shiny = ["image", "image_shiny"];
  const selectedImg = shiny[0];
  const selectedLang = langage[1];

  return (
    <>
      {data_poke.map(pokemon => (
        <ul key={pokemon.id} id={pokemon.id}>
          <p>#{pokemon.id}</p>
          <p>{pokemon.name[selectedLang]}</p>
          <img src={pokemon[selectedImg]} alt="" />


          {pokemon.types.map((type, index) => (
            data_types.map(types_poke => (
              <li key={index}>{types_poke.type.name[selectedLang]}</li>
            )
            )

          ))}




        </ul>
      ))}
    </>
  );
}

