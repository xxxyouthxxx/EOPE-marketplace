<template>
  <div class="page-wrap">
    <!-- header  -->
    <header class="header-section has-header-main">
      <!-- Header main -->
      <HeaderMain></HeaderMain>
    </header>
    <!-- login section -->
    <chatSection></chatSection>
    <!-- Blog  -->
  </div>
  <!-- end page-wrap -->
</template>

<script>
// Import component data. You can change the data in the store to reflect in all component
import SectionData from "@/store/store.js";
import chatSection from "@/components/section/chatSection.vue";
export default {
  name: "Login",
  components: {chatSection},
  data() {
    return {
      SectionData,
    };
  },
};
</script>
