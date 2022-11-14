<template>
    <div class="flex flex-col">
        <label class="text-xs text-center w-full flex mb-1">{{ props.label }}</label>
        <ul class="menu bg-base-100 flex flex-col menu-horizontal ">
            <li tabindex="0" class="focus:" ref="selectorRoot">
                <span class="min-w-[6rem]">{{ selectedVariant.name }}</span>
                <ul class="bg-base-100 min-w-[6rem]" v-if="selectorCanBeShown">
                    <template v-for="variant in variants" :key="variant.key">
                        <li v-if="variant.key != selectedKey">
                            <a @click="select(variant.key)">{{ variant.name
                            }}</a>
                        </li>
                    </template>
                </ul>
            </li>
        </ul>
    </div>
</template>
<script setup>

const props = defineProps(['variants', 'selectedVariantKey', 'label'])
const variants = ref(props.variants)
const selectorRoot = ref(null)
const selectorCanBeShown = ref(true)
const emit = defineEmits(['update:selected'])
const selectedKey = ref(props.selectedVariantKey)
let selectedVariant = computed(() => props.variants.find((v) => v.key == selectedKey.value))
function select(key) {
    selectedKey.value = key
    selectorRoot.value.blur()
    selectorCanBeShown.value = false;
    nextTick(() => {

        setTimeout(() => {
            selectorCanBeShown.value = true // We can show dropdown again in 100ms, way to hide it after clicking on element
        }, 100)
    })
    emit("update:selected", selectedKey)
}
defineExpose({ select })
</script>