import React from 'react';


// app/page.tsx (Server Component)
export default async function Page() {
  const res = await fetch("https://pokedex-api.3rgo.tech/api/pokemon");
  const pokemons = await res.json();

  return (
    <div>
      <h1>Liste des Pokémon</h1>
      <ul>
        {pokemons.map((pokemon: { id: number; name: string }) => (
          <li key={pokemon.id}>{pokemon.name}</li>
        ))}
      </ul>
    </div>
  );
}
