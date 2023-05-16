<template>
    <div class="hero-wrap sub-header" :style="{ backgroundImage: 'url(' + coverimg + ')' }">
                <div class="overlay"></div>
                <div class="container">
                    <div class="hero-content py-0 d-flex align-items-center">
                        <div class="avatar flex-shrink-0" :class="avatarSize">
                                <img :src="profileImageUrl" alt="">
                            </div>
                            <div class="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                                <div class="author-hero-content me-3">
                                    <h4 class="hero-author-title mb-1 text-white">{{ title }}</h4>
                                    <p class="hero-author-username mb-1 text-white">@{{ username }}</p>
                                </div><!-- author-hero-conetent -->
                            </div><!-- author-hero-content -->
                    </div><!-- hero-content -->
                </div><!-- .container-->
    </div><!-- end hero-wrap -->
</template>

<script>
import { mapState } from "vuex";
export default {
  name: 'AuthorHero',
  props: ['profileImageUrl', 'avatarSize', 'title', 'username', 'isDropdown', 'btntext', 'isCopyInput', 'btnlink', 'coverimg','address','myId'],
  methods: {
      onCopy () {
        const onCopy = (e) => {
            let target = e.trigger.querySelector(".tooltip-text");
            let prevText = target.innerHTML;
            target.innerHTML = "Copied";
            setTimeout(function(){
            target.innerHTML = prevText;
            }, 1000)
        }
        return { address, onCopy }
      }
  },
    computed: {
    ...mapState([
      "authToken",
      "myAddress",
      "userId"
      ]),
  },

//   setup(props) {
//     const message = props.address;
//     const onCopy = (e) => {
//         let target = e.trigger.querySelector(".tooltip-text");
//         let prevText = target.innerHTML;
//         target.innerHTML = "Copied";
//         setTimeout(function(){
//         target.innerHTML = prevText;
//         }, 1000)
//     }
//     return { message, onCopy }
//   },
}
</script>
