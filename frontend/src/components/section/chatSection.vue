<template>
    <section class=" section-space-b">
      <div class="container">
        <div class="row  justify-content-center">
          <div class="col-lg-6">
            <div class="">
              <h1 class="mb-1">{{ SectionData.chat.title }}</h1>
            </div>
            <div class="chat_area" style="height: 70vh; overflow-y: scroll;">
            <!-- 这里放置聊天信息 -->
                <div
                    v-for="(item, index) in messages"
                    :key="index"
                    :class ="item.username != this.username ? 'message_item' :'message_item_me' "
                >
                    <img
                        :src="item.avatarUrl"
                        alt
                        class="messagellll"
                    />
            </div>
            </div>

            <div class="form-floating mb-4 d-flex align-items-center" style="position:fixed;bottom:0;">
                <input type="text" class="form-control d-inline" id="id" placeholder="ID" v-model="msg" autocomplete="off" >
                <label for="say_msg">你要说：</label>
                <button class="btn btn-dark w-0 d-inline" type="submit"  @click="send_msg(msg)">{{ SectionData.chat.button_text }}</button>
            </div>

            
            <!-- <span class="d-block my-4">— or login with —</span>
                              <ul class="btns-group d-flex">
                                  <li class="flex-grow-1" v-for="(list, i) in SectionData.loginData.btns" :key="i"><router-link :to="list.path" class="btn d-block" :class="list.btnClass"><em class="ni" :class="list.icon"></em> {{ list.title }} </router-link></li>
                              </ul> -->
          </div>
          <!-- end col-lg-6 -->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </section>
  </template>
  <script>
  // Import component data. You can change the data in the store to reflect in all component
  import SectionData from "@/store/store.js";
  import axios from "axios";
  import { mapActions } from "vuex";
  export default {
    name: "LoginSection",
    data() {
      return {
        messages:[],
        SectionData,
        credentials: {
          memberId: null,
          memberPassword: null,
        },
      };
    },
    methods: {
      ...mapActions(["send_msg","username"]),
    },
    mounted() {
      
    },
  };
  </script>
  
  <style scoped>
  /* .login { */
  /* font-family: DM Serif Display, serif; */
  /* word-spacing: 500px; */
  /* letter-spacing: 1px; */
  /* font-size: 40px; */
  /* } */
.chat_area {
    background-color: #f2f2f2;
    border-radius: 10px;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
}
.message_item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
}
.message_item_me {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 10px;
        width: 100%;
      }
      .message_ava {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        cursor: pointer;
      }
  </style>
  