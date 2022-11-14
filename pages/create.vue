<template>

    <div class="h-full w-full flex flex-col items-center justify-center" v-if="creatingStatus == 0">
        <h1 class="text-2xl mt-4">Create new Arweave-Nameserver record</h1>
        <div class="bg-neutral lg:w-1/2 xl:w-1/2 w-3/4 p-4 mt-4 flex flex-col items-center justify-center">
            <p class="text-lg mb-2">Provide name</p>
            <input class="input w-full xl:w-1/3" placeholder="e.g mouse.stars" v-model="name" />
            <div class="flex flex-col w-full md:w-max  overflow-x-auto justify-center items-stretch ">
                <p class="text-lg mt-3 w-full text-center mb-4">Add name managers</p>
                <div v-for="manager in managers"
                    class="bg-base-100 p-2 flex flex-row justify-between items-center border-b border-b-base-content">
                    {{
                            manager
                    }} <div class="inline-flex cursor-pointer ml-4" @click="removeManager(manager)"><svg
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg></div>
                </div>
                <div class="bg-base-100 p-0  flex flex-row justify-between items-center">
                    <input class="input py-0 px-2 h-10  w-full focus:outline-none"
                        placeholder="Arweave address of new manager" v-model="newManager" /><button
                        class="btn btn-sm mr-1" @click="addManager">Add</button>

                </div>
            </div>
            <p class="text-lg mt-3">Set initial DNS</p>

            <div class="overflow-x-auto w-full md:w-3/4" v-if="initialRecords.length > 0">
                <table class="table w-full table-compact">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Content</th>
                            <th>TTL</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- row 1 -->
                        <tr v-for="(record, ri) in initialRecords">
                            <th>{{ record.type }}</th>
                            <td>{{ record.name }}</td>
                            <td>{{ record.content }}</td>
                            <td>{{ record.ttl }}</td>
                            <td>
                                <div class="inline-flex cursor-pointer" @click="removeRecord(ri)"><svg
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg></div>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <div class="w-full mt-2 flex flex-row items-end justify-center flex-wrap  ">
                <Selector @update:selected="selectType" :variants='recordTypeVariants' ref="typeSelector"
                    selectedVariantKey="A" label="Record type" />
                <input class="input ml-2" placeholder="Record name (@ for root)" v-model="addingRecordName" /> <input
                    class=" input ml-2" v-model="addingRecordContent" placeholder="Record content" />
                <Selector @update:selected="selectTTL" :variants='TTLVariants' label="Time to live" class="ml-2"
                    ref="ttlSelector" :selectedVariantKey="60000" />
                <button class="btn btn-outline ml-2 mt-2" @click="addRecord">Add record</button>
            </div>
            <button class="btn btn-primary btn-lg px-8 mt-4 min-h-0 h-auto py-4" @click="save">Save</button>
        </div>

    </div>
    <div v-else-if="creatingStatus == 1" class="h-full w-full flex flex-col items-center justify-center">
        <div class="lds-dual-ring"></div>
    </div>
    <div v-else-if="creatingStatus == 2" class="h-full w-full flex flex-col items-center justify-center">
        <div class="text-3xl text-center">Congratulations! Recorded to Arweave!</div>
        <div class="text-lg text-center m-2">Now, assign these nameservers to <p
                class="inline-flex bg-neutral rounded-md px-2">{{ name }}</p>
        </div>

        <div class="overflow-x-auto w-max">
            <table class="table w-full table-zebra">
                <!-- head -->
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Record</th>
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
            <NuxtLink class="btn btn-outline flex mt-4" to="/">Back to management panel</NuxtLink>
        </div>
    </div>
</template>


<script setup>
import Arweave from "arweave"
import ArDB from "ardb";
import { makeZoneFile } from 'zone-file'

const arweaveState = useState("arweave", () => {
    Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 60_000,
        logging: false,
    });
});
const selectedType = ref("A")
const encodedRecordName = ref("")
const addingRecordName = ref("")
const addingRecordContent = ref("")
const initialRecords = ref([])
const newManager = ref("")
const typeSelector = ref(null)
const ttlSelector = ref(null)
const creatingStatus = ref(0)
const name = ref("")
const selectedTTL = ref(60000)
const TTLVariants = ref([{ key: 60000, name: "1 Min" }, { key: 300000, name: "5 min" }, { key: 1.8e+6, name: "30 min" }, { key: 3.6e+6, name: "1 hour" }, { key: 2.16e+7, name: "6 hours" }, { key: 8.64e+7, name: "24 hours" }])
const recordTypeVariants = ref([{ key: "A", name: "A" }, { key: "CNAME", name: "CNAME" }, { key: "AAAA", name: "AAAA" }, { key: "TXT", name: "TXT" }, { key: "NS", name: "NS" }])
const arweave = arweaveState.value;
const ardbState = useState("ardb", () => new ArDB(arweave.value));
let wallet = (useState("wallet", () => null)).value;
let ardb = ardbState.value;
const managers = ref([await wallet.getActiveAddress()])
function selectType(newKey) {
    selectedType.value = newKey.value
}
function selectTTL(newKey) {
    selectedTTL.value = newKey.value
}
function addRecord() {
    let recordObject = {
        name: addingRecordName.value,
        content: addingRecordContent.value,
        ttl: selectedTTL.value,
        type: selectedType.value
    }
    addingRecordName.value = ""
    addingRecordContent.value = ""
    ttlSelector.value.select(60000)
    typeSelector.value.select("A")
    initialRecords.value.push(recordObject)
    console.log(initialRecords.value)
}
function removeRecord(ri) {
    initialRecords.value = initialRecords.value.filter((r, cri) => cri != ri)
}

async function save() {
    creatingStatus.value = 1
    let recordsZoneObject = {
        "$origin": name.value.toUpperCase(),
        "$ttl": 3600,
        "ns": initialRecords.value.filter(r => r.type == "NS").map(r => ({ name: r.name, host: r.content })),
        "a": initialRecords.value.filter(r => r.type == "A").map(r => ({ name: r.name, ip: r.content })),
        "aaaa": initialRecords.value.filter(r => r.type == "AAAA").map(r => ({ name: r.name, ip: r.content })),
        "cname": initialRecords.value.filter(r => r.type == "CNAME").map(r => ({ name: r.name, alias: r.content })),
        "txt": initialRecords.value.filter(r => r.type == "TXT").map(r => ({ name: r.name, txt: r.content })),

    }
    let recordsZoneFile = makeZoneFile(recordsZoneObject)
    let recordsZoneTransaction = await arweave.createTransaction({
        data: recordsZoneFile,
    })
    recordsZoneTransaction.addTag("Content-Type", "text/dns-zone")
    let { id: zoneTxId } = await wallet.dispatch(recordsZoneTransaction)

    let recordTransaction = await arweave.createTransaction({
        data: JSON.stringify({ managers: managers.value, recordsTx: zoneTxId }),
    })
    managers.value.forEach(mgr => recordTransaction.addTag("Manager", mgr))
    recordTransaction.addTag("App-Name", "Arweave-Nameserver")
    recordTransaction.addTag("Domain-Name", name.value)
    let { id: managementRecordId } = await wallet.dispatch(recordTransaction)
    let managementRecordContent = "Not found."

    while (managementRecordContent == "Not found.") {
        managementRecordContent = await fetch(`https://arweave.net/${managementRecordId}`).then(r => r.text())
        wait(3000)
    }
    encodedRecordName.value = BigInt("0x" + bufferToHex(arweave.utils.b64UrlToBuffer(managementRecordId))).toString(36)

    creatingStatus.value = 2
}
function removeManager(manager) {
    managers.value = managers.value.filter(m => m != manager)
}
function addManager() {
    if (newManager.value == "") { return }
    managers.value.push(newManager.value)
    newManager.value = ""
}
function wait(ms) {
    return new Promise(r => setTimeout(r, ms))
}
function bufferToHex(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
const hexToBuffer = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
function base36ToBigInt(str) {
    return [...str].reduce((acc, curr) => BigInt(parseInt(curr, 36)) + BigInt(36) * acc, 0n);
}
</script>

<style>
.lds-dual-ring {
    display: inline-block;
    width: 80px;
    height: 80px;
}

.lds-dual-ring:after {
    content: " ";
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>