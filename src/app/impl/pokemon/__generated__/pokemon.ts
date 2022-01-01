/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pokemon
// ====================================================

export interface pokemon_species_names {
  name: string;
  genus: string;
}

export interface pokemon_species_generation {
  name: string;
}

export interface pokemon_species_form_nodes_types_type_names {
  name: string;
}

export interface pokemon_species_form_nodes_types_type {
  /**
   * An array relationship
   */
  names: pokemon_species_form_nodes_types_type_names[];
}

export interface pokemon_species_form_nodes_types {
  /**
   * An object relationship
   */
  type: pokemon_species_form_nodes_types_type | null;
}

export interface pokemon_species_form_nodes_abilities_ability_names {
  name: string;
}

export interface pokemon_species_form_nodes_abilities_ability {
  /**
   * An array relationship
   */
  names: pokemon_species_form_nodes_abilities_ability_names[];
}

export interface pokemon_species_form_nodes_abilities {
  /**
   * An object relationship
   */
  ability: pokemon_species_form_nodes_abilities_ability | null;
  is_hidden: boolean;
}

export interface pokemon_species_form_nodes {
  name: string;
  height: number | null;
  weight: number | null;
  /**
   * An array relationship
   */
  types: pokemon_species_form_nodes_types[];
  /**
   * An array relationship
   */
  abilities: pokemon_species_form_nodes_abilities[];
}

export interface pokemon_species_form {
  nodes: pokemon_species_form_nodes[];
}

export interface pokemon_species_egg_groups_group_names {
  name: string;
}

export interface pokemon_species_egg_groups_group {
  /**
   * An array relationship
   */
  names: pokemon_species_egg_groups_group_names[];
}

export interface pokemon_species_egg_groups {
  /**
   * An object relationship
   */
  group: pokemon_species_egg_groups_group | null;
}

export interface pokemon_species_evolution_chain_evolutions_names {
  name: string;
}

export interface pokemon_species_evolution_chain_evolutions {
  id: number;
  name: string;
  parent_id: number | null;
  /**
   * An array relationship
   */
  names: pokemon_species_evolution_chain_evolutions_names[];
}

export interface pokemon_species_evolution_chain {
  /**
   * An array relationship
   */
  evolutions: pokemon_species_evolution_chain_evolutions[];
}

export interface pokemon_species {
  id: number;
  gender_rate: number | null;
  /**
   * An array relationship
   */
  names: pokemon_species_names[];
  /**
   * An object relationship
   */
  generation: pokemon_species_generation | null;
  /**
   * An aggregate relationship
   */
  form: pokemon_species_form;
  /**
   * An array relationship
   */
  egg_groups: pokemon_species_egg_groups[];
  /**
   * An object relationship
   */
  evolution_chain: pokemon_species_evolution_chain | null;
}

export interface pokemon {
  /**
   * An array relationship
   */
  species: pokemon_species[];
}

export interface pokemonVariables {
  name: string;
}
