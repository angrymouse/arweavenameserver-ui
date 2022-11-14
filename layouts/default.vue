<template>
    <div class="h-screen" v-if="wallet">
        <slot />
    </div>
    <div v-else class="h-full flex flex-row justify-center items-center">
        <connect-wallet :show="true" />
    </div>
</template>
<script setup>
let wallet = useState("wallet", () => null);
// router.push("#connectWallet");
</script>