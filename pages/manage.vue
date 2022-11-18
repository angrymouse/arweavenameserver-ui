<template>
    <Loading v-if="loading" />
    <div v-else class="h-full w-full flex flex-col items-center justify-center">
        <h1 class="text-2xl mt-4">Manage {{ domainName }}
        </h1>
        <div class="bg-neutral lg:min-w-1/2 xl:min-w-1/4 min-w-3/4 p-4 mt-4 flex flex-col items-center justify-center ">
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

            <div class="overflow-x-auto w-min">
                <label class="label"><span class="label-text">Edit DNS records</span></label>
                <table class="table w-full ">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th class="bg-black">Type</th>
                            <th class="bg-black">Name</th>
                            <th class="bg-black">Content</th>
                            <th class="bg-black">
                                <p>TTL (seconds)</p>
                            </th>
                            <th class="bg-black"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- row 1 -->
                        <tr v-for="(record, ri) in records">
                            <td class="p-0">
                                <SelectorCompact @update:selected="k => selectTypeForRecord(ri, k)"
                                    :variants='recordTypeVariants' ref="typeSelector"
                                    :selectedVariantKey="typeBitflagToTxt[record.type]" label="Record type" />
                            </td>
                            <td><input v-model="record.name" placeholder="Record subdomain" class="input input-sm" />
                            </td>
                            <td class=""><input v-if="typeBitflagToTxt[record.type] == 'A'"
                                    v-model="record.data.address" placeholder="IP" class="input input-sm" />
                                <textarea v-if="typeBitflagToTxt[record.type] == 'TXT'" v-model="record.data.txt[0]"
                                    class="textarea h-0 p-2" placeholder="Text content"></textarea>
                                <input v-if="typeBitflagToTxt[record.type] == 'NS'" v-model="record.data.ns"
                                    placeholder="Nameserver" class="input input-sm" />
                                <input v-if="typeBitflagToTxt[record.type] == 'AAAA'" v-model="record.data.address"
                                    placeholder="IPv6" class="input input-sm" />
                                <input v-if="typeBitflagToTxt[record.type] == 'CNAME'" v-model="record.data.target"
                                    placeholder="CNAME Target" class="input input-sm" />
                                <input v-if="typeBitflagToTxt[record.type] == 'MX'" v-model="record.data.mx"
                                    placeholder="MX Server" class="input input-sm" />
                                <input v-if="typeBitflagToTxt[record.type] == 'MX'" v-model="record.data.priority"
                                    type="number" placeholder="MX Priority" class="input input-sm" />
                            </td>
                            <td>
                                <input v-model="record.ttl" type="number" placeholder="Seconds of record cache"
                                    class="input input-sm w-20" />
                            </td>
                            <td class="">
                                <div class="inline-flex cursor-pointer justify-center items-center"
                                    @click="removeRecord(ri)"><svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg></div>
                            </td>
                        </tr>

                    </tbody>
                </table>
                <label class="label label-text text-center w-full justify-center mt-4">Don't forget to press save button
                    or
                    your edits will
                    be
                    lost</label>
                <div class="w-full flex justify-center flex-row ">

                    <button class="btn btn-secondary mx-2" @click="addBlankRecord">Add new
                        record</button>
                    <button class="btn btn-accent mx-2" @click="saveRecords">Save records</button>
                </div>

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
let records = ref([])
let recordTypeVariants = ref([{ key: "A", name: "A" }, { key: "TXT", name: "TXT" }, { key: "CNAME", name: "CNAME" }, { key: "AAAA", name: "AAAA" }, { key: "MX", name: "MX" }, { key: "NS", name: "NS" }])
let domainMgrTx = ref(route.hash.slice(1))
let encodedRecordName = ref(BigInt("0x" + bufferToHex(arweave.utils.b64UrlToBuffer(domainMgrTx.value))).toString(36))
let domainMgrMeta = ref(await ardb.search("transaction").id(domainMgrTx.value).exclude("anchor").findOne())
let domainMgrData = ref(await fetch(`https://arweave.net/` + domainMgrTx.value).then(r => r.json()))
let domainName = ref((await ardb.search("transactions").sort("HEIGHT_DESC").from(domainMgrData.value.managers).appName("Arweave-Nameserver").tags([{ name: "Action", values: "UpdateName" }, { name: "Manager-TX", values: [domainMgrTx.value] }]).exclude("anchor").limit(1).findOne() || domainMgrMeta.value).tags.find(t => t.name == "Domain-Name")?.value)
let lastZonesTxSearch = await ardb.search("transactions").tags([{ name: "Target-NS-TxID", values: [domainMgrTx.value] }]).from(domainMgrData.value.managers).sort("HEIGHT_DESC").limit(1).exclude(["anchor"]).find()
let lastZonesTx = lastZonesTxSearch.length > 0 ? lastZonesTxSearch[0].id : domainMgrData.value.recordsTx;
let domainZoneFileRaw = await fetch(`https://arweave.net/` + lastZonesTx).then(r => r.text())
let typeBitflagToTxt = ref(Object.fromEntries(Object.entries(bns.constants.types).map(([k, v]) => [v, k])))

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
try {
    records.value = bns.wire.fromZone(domainZoneFileRaw, domainName.value)
    console.log(bns)
    console.log(records.value)
} catch (e) {
    records.value = []
    console.log("Error parsing zonefile:", e)
}
function selectTypeForRecord(ri, k) {
    records.value[ri].type = bns.constants.types[k]
}
function addBlankRecord() {
    let newRecord = new bns.wire.Record().fromJSON({ name: domainName.value, ttl: 300, data: { address: "111.111.111.111" }, type: "A", class: "IN" })
    newRecord.data.address = ""
    records.value.push(newRecord)
}
function removeRecord(idx) {
    records.value = records.value.filter((rec, reci) => reci != idx)
}
function bufferToHex(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
async function saveRecords() {
    loading.value = true
    let recordsUpdateTx = await arweave.createTransaction({
        data: bns.wire.toZone(records.value),
    })
    recordsUpdateTx.addTag("App-Name", "Arweave-Nameserver")
    recordsUpdateTx.addTag("Target-NS-TxID", domainMgrTx.value)
    recordsUpdateTx.addTag("Action", "UpdateDNSRecords")
    let { id: DNSRecordsTxId } = await wallet.dispatch(recordsUpdateTx)

    let DNSRecordsTxContent = "Not found."

    while (DNSRecordsTxContent == "Not found.") {
        DNSRecordsTxContent = await fetch(`https://arweave.net/${DNSRecordsTxId}`).then(r => r.text())
        wait(3000)
    }
    loading.value = false
}
const hexToBuffer = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
function base36ToBigInt(str) {
    return [...str].reduce((acc, curr) => BigInt(parseInt(curr, 36)) + BigInt(36) * acc, 0n);
}
function wait(ms) {
    return new Promise(r => setTimeout(r, ms))
}
</script>
