/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: search_pokemon
// ====================================================

export interface search_pokemon_species_names {
  name: string;
}

export interface search_pokemon_species {
  value: string;
  /**
   * An array relationship
   */
  names: search_pokemon_species_names[];
}

export interface search_pokemon {
  /**
   * An array relationship
   */
  species: search_pokemon_species[];
}

export interface search_pokemonVariables {
  like: string;
}
