<template>
    <Loading v-if="loading" />
    <div v-else class="h-full w-full flex flex-col items-center justify-center">
        <h1 class="text-2xl mt-4">Manage {{ domainName }}
        </h1>
        <div class="bg-neutral lg:w-1/2 xl:w-1/4 w-3/4 p-4 mt-4 flex flex-col items-center justify-center ">
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Edit name of domain</span>
                </label>
                <div class="input-group">
                    <input type="text" v-model="domainName" placeholder="Enter new name" class="input input-bordered" />
                    <button class="btn btn-outline btn-square" @click="saveName">
                        Save
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto w-max">
                <label class="label"><span class="label-text">To make it work, you need to setup these NS
                        records on {{ domainName }}</span></label>
                <table class="table w-full table-compact">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th class="bg-black">Name</th>
                            <th class="bg-black">Record</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- row 1 -->
                        <tr>
                            <th>NS1</th>
                            <td>{{ encodedRecordName }}.winston</td>
                        </tr>
                        <tr>
                            <th>NS2</th>
                            <td>{{ encodedRecordName }}._arweave</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <NuxtLink class="btn btn-outline flex mt-4" to="/">Back to management panel</NuxtLink>

    </div>

</template>
<script setup>
import Arweave from "arweave"
import ArDB from "ardb";
import bns from "../lib/bns.js"
const arweaveState = useState("arweave", () => {
    Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 60_000,
        logging: false,
    });
});
const loading = ref(false)
const arweave = arweaveState.value;
const ardbState = useState("ardb", () => new ArDB(arweave.value));
let wallet = (useState("wallet", () => null)).value;
let ardb = ardbState.value;
let route = useRoute()

let domainMgrTx = ref(route.hash.slice(1))
let encodedRecordName = ref(BigInt("0x" + bufferToHex(arweave.utils.b64UrlToBuffer(domainMgrTx.value))).toString(36))
let domainMgrMeta = ref(await ardb.search("transaction").id(domainMgrTx.value).exclude("anchor").findOne())
let domainMgrData = ref(await fetch(`https://arweave.net/` + domainMgrTx.value).then(r => r.json()))
let domainName = ref((await ardb.search("transactions").sort("HEIGHT_DESC").from(domainMgrData.value.managers).appName("Arweave-Nameserver").tags([{ name: "Action", values: "UpdateName" }, { name: "Manager-TX", values: [domainMgrTx.value] }]).exclude("anchor").limit(1).findOne() || domainMgrMeta.value).tags.find(t => t.name == "Domain-Name")?.value)
let lastZonesTxSearch = await ardb.search("transactions").tags([{ name: "Target-NS-TxID", values: [domainMgrTx.value] }]).from(domainMgrData.value.managers).sort("HEIGHT_DESC").limit(1).exclude(["anchor"]).find()
let lastZonesTx = lastZonesTxSearch.length > 0 ? lastZonesTxSearch[0].id : domainMgrData.value.recordsTx;
let domainZoneFileRaw = await fetch(`https://arweave.net/` + lastZonesTx).then(r => r.text())
// let domainZone = parseZoneFile(domainZoneFileRaw)

async function saveName() {

    let nameUpdateTx = await arweave.createTransaction({
        data: "update",
    })
    nameUpdateTx.addTag("Action", "UpdateName")
    nameUpdateTx.addTag("App-Name", "Arweave-Nameserver")
    nameUpdateTx.addTag("Manager-TX", domainMgrTx.value)
    nameUpdateTx.addTag("Domain-Name", domainName.value)
    loading.value = true
    await wallet.dispatch(nameUpdateTx)
    loading.value = false
}
console.log(bns.wire.fromZone(domainZoneFileRaw, domainName.value))

function bufferToHex(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
const hexToBuffer = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
function base36ToBigInt(str) {
    return [...str].reduce((acc, curr) => BigInt(parseInt(curr, 36)) + BigInt(36) * acc, 0n);
}
</script>
