
import fs from 'fs';
import { Pokemon } from './types';
import Tracetest from '@tracetest/client';
import { TestResource } from '@tracetest/client/dist/modules/openapi-client';

// To use the @tracetest/client, you must have a token for the environment. This is created on the Settings page under Tokens by the 
// admin for the environment. The token below has been given the 'runner' role in the pokeshop-demo env in the tracetest-demo org. 
const TRACETEST_API_TOKEN = 'tttoken_3f39a18e565214df';
const baseUrl = 'https://demo-pokeshop.tracetest.io/pokemon';

const setupPokemon = `{
    "name": "fearow",  
    "imageUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png",
    "isFeatured": false,
    "type": "normal,flying"
}`


const main = async () => {
    console.log('hnyydi')
    const tracetest = await Tracetest(TRACETEST_API_TOKEN);
    console.log('hi')
    //execute setup by adding a Pokemon with a REST POST api call directly
    const createPokemon = async (): Promise<Pokemon> => {
        const response = await fetch(baseUrl,{
            method: 'POST',
            body: setupPokemon,
            headers: {'Content-Type': 'application/json'} 
        });
        return await response.json() as Pokemon;
    };

    const pokemonId = (await createPokemon()).toString();

    

    const definition: TestResource = {
    "type": "Test",
    "spec": {
        "id": "delete-pokemon",
        "name": "Delete Pokemon",
        "trigger": {
        "type": "http",
        "httpRequest": {
            "method": "DELETE",
            "url": "https://demo-pokeshop.tracetest.io/pokemon/${env:pokemon_id}",
            "headers": [
            {
                "key": "Content-Type",
                "value": "application/json"
            }
            ]
        }
        },
        "specs": [
        {
            "selector": "span[tracetest.span.type=\"general\" name=\"Tracetest trigger\"]",
            "name": "Delete returns a 200 status code",
            "assertions": [
            "attr:tracetest.response.status = 200"
            ]
        },
        {
            "selector": "span[tracetest.span.type=\"database\" db.system=\"redis\" db.operation=\"del\" db.redis.database_index=\"0\"]",
            "name": "Ensure we are deleting from the redis cache also",
            "assertions": [
            "attr:tracetest.selected_spans.count = 1"
            ]
        },
        {
            "selector": "span[tracetest.span.type=\"database\"]",
            "name": "All Database Spans: Processing time is less than 10ms",
            "assertions": [
            "attr:tracetest.span.duration < 10ms"
            ]
        },
        {
            "selector": "span[tracetest.span.type=\"database\" name=\"delete pokeshop.pokemon\" db.system=\"postgres\" db.name=\"pokeshop\" db.user=\"ashketchum\" db.operation=\"delete\" db.sql.table=\"pokemon\"]",
            "name": "Check that number of deleted rows from Postgres is one",
            "assertions": [
            "attr:db.result = 1"
            ]
        }
        ]
      }
    }

    

    //let deleteTest = fs.readFileSync('delete_pokemon.yaml', 'utf-8');

    const getVariables = (id: string) => [
        { key: 'POKEMON_ID', value: id }
    ];

    const deletePokemon = async () => {
        console.log('hij');
        const test = await tracetest.newTest(definition);
        // deletes all pokemons
        console.log('hik');
        const run = await tracetest.runTest(test, { variables: getVariables(pokemonId) });
        console.log('hil');    
        run.wait();
        console.log('him');
    };

    await deletePokemon();
    console.log(await tracetest.getSummary());

//   await importPokemons(pokemonId);
//   console.log(await tracetest.getSummary());

//   await deletePokemons();


    // // If you care about a response:
    // if (response.body !== null) {
    //     // body is ReadableStream<Uint8Array>
    //     // parse as needed, e.g. reading directly, or
    //     const asString = new TextDecoder("utf-8").decode(response.body);
    //     // and further:
    //     const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
    //     console.log('response: ', asString)
    // }


    // const getLastPokemonId = async (): Promise<number> => {
    //     const response = await fetch(baseUrl);
    //     const list = (await response.json());

    //     return list.items.length + 1;
    // };    
    // const pokemonId = (await getLastPokemonId()) + 1;
    // console.log(`ℹ Ok... got ${pokemonId} as the id`);

    

//   const tracetest = await Tracetest(TRACETEST_API_TOKEN);
  
//   const testList = await tracetest.testList();
//   console.log(`ℹ Ok... got ${testList.length} number of tests Ken`);

//   const getLastPokemonId = async (): Promise<number> => {
//     const response = await fetch(baseUrl);
//     const list = (await response.json()) as PokemonList;

//     return list.items.length + 1;
//   };

//   // get the initial pokemon from the API
//   const pokemonId = (await getLastPokemonId()) + 1;

//   const getVariables = (id: string) => [
//     { key: 'POKEMON_ID', value: id },
//     { key: 'BASE_URL', value: baseUrl },
//   ];

//   const importedPokemonList: string[] = [];

//   const importPokemons = async (startId: number) => {
//     const test = await tracetest.newTest(importDefinition);
//     // imports all pokemons
//     await Promise.all(
//       new Array(5).fill(0).map(async (_, index) => {
//         console.log(`ℹ KEN Importing pokemon ${startId + index + 1}`);
//         const run = await tracetest.runTest(test, { variables: getVariables(`${startId + index + 1}`) });
//         const updatedRun = await run.wait();
//         const pokemonId = updatedRun.outputs?.find((output) => output.name === 'DATABASE_POKEMON_ID')?.value || '';

//         console.log(`ℹ Adding pokemon ${pokemonId} to the list`);
//         importedPokemonList.push(pokemonId);
//       })
//     );
//   };

//   const deletePokemons = async () => {
//     const test = await tracetest.newTest(deleteDefinition);
//     // deletes all pokemons
//     await Promise.all(
//       importedPokemonList.map(async (pokemonId) => {
//         console.log(`ℹ Deleting pokemon ${pokemonId}`);
//         const run = await tracetest.runTest(test, { variables: getVariables(pokemonId) });
//         run.wait();
//       })
//     );
//   };

//   await importPokemons(pokemonId);
//   console.log(await tracetest.getSummary());

//   await deletePokemons();
//   console.log(await tracetest.getSummary());
 };

 main();
