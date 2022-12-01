<template>

    <div class="h-full w-full flex flex-col items-center justify-center">
        <h1 class="text-2xl mt-4">Welcome to Arweave Nameserver Portal!</h1>
        <div class="bg-neutral lg:w-1/2 xl:w-1/4 w-3/4 p-4 mt-4 flex flex-col items-center justify-center ">
            <p class="text-lg">Your names:</p>
            <div v-if="managedNames.length > 0" class=" flex flex-col items-center w-full">

                <NuxtLink v-for="managedName in managedNames"
                    class="my-2 p-4 bg-base-100 rounded-lg text-center w-full lg:w-1/2"
                    :to="'/manage/#' + managedName.id">{{
        managedName.domainName
                    }}
                </NuxtLink>
                <NuxtLink to="/create" class="btn btn-outline mt-2 w-full">Add new name</NuxtLink>
            </div>
            <div v-else
                class="p-3 mt-2 w-full text-center rounded flex flex-col text-gray-400 border-spacing-2 border-2 border-dashed border-gray-500">
                You don't have any names yet.

                <NuxtLink to="/create" class="btn btn-outline mt-2">Add one!</NuxtLink>
            </div>
        </div>
        <div class="text-center">Made with ❤️ by <a class="link" href="https://github.com/angrymouse">Angrymouse</a>
            with big support from <a class="link" href="https://arweave.org">Arweave</a> and <a class="link"
                href="https://stargaze.zone">Stargaze</a>
        </div>
    </div>
</template>
<script setup>
import Arweave from "arweave"
import ArDB from "ardb";
const arweaveState = useState("arweave", () => {
    Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 60_000,
        logging: false,
    });
});
const arweave = arweaveState.value;
const ardbState = useState("ardb", () => new ArDB(arweave.value));
let wallet = (useState("wallet", () => null)).value;
let ardb = ardbState.value;
let managedNames = ref([])
let rawNamesMeta = await ardb.search("transactions").appName("Arweave-Nameserver").tags([{ name: "App-Name", values: ["Arweave-Nameserver"] }, { name: "Manager", values: [await wallet.getActiveAddress()] }]).exclude(["anchor"]).findAll()
managedNames.value = (await Promise.all(rawNamesMeta.map(async nameRecord => {
    let nameContent = await fetch("https://arweave.net/" + nameRecord.id).then(r => r.json())
    console.log(nameRecord.id)
    let latestNameUpdate = (await ardb.search("transactions").sort("HEIGHT_DESC").from(nameContent.managers).appName("Arweave-Nameserver").tags([{ name: "Action", values: "UpdateName" }, { name: "Manager-TX", values: [nameRecord.id] }]).exclude("anchor").limit(1).findOne() || nameRecord)
    return {
        id: nameRecord.id,
        domainName: latestNameUpdate.tags.find(t => t.name == "Domain-Name") ? latestNameUpdate.tags.find(t => t.name == "Domain-Name").value : null
    }
}))).filter(r => r.domainName != null)

</script>