<template>
    <div class="page-wrap">
        <header class="header-section has-header-main bg-gradient-2">
            <HeaderMain isTransparent="is-transparent"></HeaderMain>
        </header>
    <CanvasMain></CanvasMain>
    </div>
</template>
<script>
import CanvasMain from '../components/section/CanvasMain.vue';
export default {
    name: 'Canvas',
    components: {
        CanvasMain
    }
}
</script>