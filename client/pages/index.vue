<script setup>
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/lara-light-indigo/theme.css";

import Counter from "/counter.vue";
import Main from "/main.vue";

import Button from 'primevue/button';
import Toast from 'primevue/toast';

import { useToast } from 'primevue/usetoast';

const toast = useToast();
const showSuccess = () =>
{
    toast.add( { severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 } );
};
</script>

<template>
    <div>
        <h1 class="text-4xl">
            Welcome to your own customizable app!
        </h1>
        <p>
            Checkout your api routes here:
            <a href="/swagger" class="flex">
                Click me to check Swagger docs
                dogs
            </a>
        </p>
    </div>
    <Counter />
    <Toast />
    <Button label="Click" @click="showSuccess" />
</template>

<style>
@import url("/IBMPlexSans-Regular.ttf");

body {
    margin: 0;
    padding: 0;
}

* {
    font-family: 'IBM Plex Sans', sans-serif;
}
</style>
