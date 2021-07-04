/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PokemonQuery
// ====================================================

export interface PokemonQuery_mon_abilities_ability {
  __typename: "pokemon_v2_ability";
  name: string;
}

export interface PokemonQuery_mon_abilities {
  __typename: "pokemon_v2_pokemonability";
  /**
   * An object relationship
   */
  ability: PokemonQuery_mon_abilities_ability | null;
}

export interface PokemonQuery_mon {
  __typename: "pokemon_v2_pokemon";
  name: string;
  /**
   * An array relationship
   */
  abilities: PokemonQuery_mon_abilities[];
}

export interface PokemonQuery {
  /**
   * fetch data from the table: "pokemon_v2_pokemon"
   */
  mon: PokemonQuery_mon[];
}

export interface PokemonQueryVariables {
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
