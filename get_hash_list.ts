require('dotenv').config()

const {Metaplex} = require("@metaplex-foundation/js");
const {Connection} = require("@solana/web3.js");
import { PublicKey } from '@solana/web3.js';

const fs = require('fs');
const get_prompt = require('prompt-sync')({sigint: true});


const getBool = (promptText: string, breakOnFalse: boolean): boolean => {
    const val: string = get_prompt(`${promptText} (Y/N): `).toString().toUpperCase()
    if (val === 'Y') {
        return true
    } else if (val === 'N') {
        if (breakOnFalse) {
            console.warn('Stopping Program. Candy Machine ID was incorrect.')
            process.exit(1);
        }
        return false
    } else {
        return getBool(promptText, breakOnFalse)
    }
}


const getNftsByCandyMachine = async (candyMachineID: PublicKey): Promise<object> => {
    const connection = new Connection(process.env.RPC_URI);
    const metaplex = new Metaplex(connection);
    console.log('Finding NFTS! Please be patient, as this can take a while!')
    return await metaplex.candyMachines().findMintedNfts(candyMachineID, {version: 2}).run()
}


const getCMID = (): PublicKey => {
    let candyMachineID = get_prompt('Please Enter the Candy Machine ID of the collection: ')
    getBool(`Is CMID: ${candyMachineID} correct?`, true)

    // Validate Public Key
    try {
        return new PublicKey(candyMachineID)
    } catch (e) {
        console.error('Invalid Public Key Input')
        process.exit(1)
    }
}


const Main = async () => {
    const candyMachineID = getCMID()
    const nfts = await getNftsByCandyMachine(candyMachineID);
    const data = JSON.stringify(nfts);

    // Save Data
    fs.writeFileSync('output/hash-list.json', data);
    console.log(`Successfully Retrieved and Saved Hash List for CMID ${candyMachineID}`)
}


Main().then(() => {
    // Do Nothing
})

