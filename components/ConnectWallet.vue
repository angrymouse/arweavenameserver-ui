<template>
    <input type="checkbox" id="connectWallet" class="modal-toggle" :checked="show" />

    <div class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-3xl text-center">Select your arweave wallet</h3>
            <div class="py-4 flex justify-center">
                <div class="card card-compact m-2 w-1/3 bg-base-200" @click="connectArconnect">
                    <figure>
                        <img src="https://7qx7gbohuua3h7r32vf6ddrjoi7mkdmczz6cdtcq2e3dhdpavd3q.arweave.net/_C_zBcelAbP-O9VL4Y4pcj7FDYLOfCHMUNE2M43gqPc"
                            alt="ArConnect" height="200" />
                    </figure>
                    <div class="card-body w-full flex bg-neutral rounded-b-xl">
                        <h2 class="card-title w-full block text-center">ArConnect</h2>
                    </div>
                </div>
                <!-- ArConnect uses own encryption method, which is not normal RSA encryption and not compatible with most software -->
                <div class="card card-compact m-2 w-1/3 bg-base-200 " @click="connectArweaveApp">
                    <figure>
                        <img src="https://yctstiqqys3b4j5qb55sxtn6airb6a56tlwxtkfi36of6cbg2a5a.arweave.net/wKcpohDEth4nsA97K82-AiIfA76a7XmoqN-cXwgm0Do"
                            alt="Arweave.app" width="900" />
                    </figure>
                    <div class="card-body w-full flex bg-neutral rounded-b-xl">
                        <h2 class="card-title w-full block text-center">Arweave.app</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ArweaveWebWallet } from "arweave-wallet-connector";

import Arweave from 'arweave';
import ArDB from 'ardb';

const props = defineProps(["show"]);

const show = ref(props.show || false);
const wallet = useState("wallet", () => null);

const arweave = useState("arweave", () => Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 60000,
    logging: false,
}));


const ardbState = useState("ardb", () => new ArDB(arweave.value));
let ardb = ardbState.value

async function connectArweaveApp() {
    let webwallet = new ArweaveWebWallet(
        {
            name: "Arweave Nameserver",
            logo: "https://ioxi6amwxsn3dylpukxmmsa7m56e4xlbtqlqn5psmjsrtp247zha.arweave.net/Q66PAZa8m7Hhb6KuxkgfZ3xOXWGcFwb18mJlGb9c_k4",
        },
        "arweave.app"
    );
    await webwallet.connect();
    let address = await webwallet.namespaces.arweaveWallet.getActiveAddress()
    wallet.value = webwallet.namespaces.arweaveWallet;
    // window.arweaveWallet = webwallet.namespaces.arweaveWallet
    // router.push("/app/lobby");

}
async function connectArconnect() {
    window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "ACCESS_PUBLIC_KEY",
        "DISPATCH",
    ]);
    let address = await window.arweaveWallet.getActiveAddress()
    wallet.value = window.arweaveWallet;

    // router.push("/app/lobby");
}



</script>