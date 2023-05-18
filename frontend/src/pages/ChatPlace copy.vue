<template>
    <div class="page-wrap">
        <header class="header-section has-header-main bg-gradient-2">
            <HeaderMain isTransparent="is-transparent"></HeaderMain>
        </header>
        <!-- 主界面 -->
    <mu-paper v-show="loginStatus" class="message_box" :z-depth="4">
      <!-- 右侧功能区-->
      <div class="function_area" v-show="active_type == 'chat'">
        <!-- 消息栏 -->
        <div class="messageList">
          <div
            v-for="(item, index) in messageList"
            :key="index"
            :class="active_chat==item.user_name?'messageItem messageItemActive':'messageItem'"
            @click="focusMessageItem(item.user_name, index)"
          >
            <div class="messageItem_leftside">
              <img :src="item.ava" alt />
              <span v-show="item.is_read === 0"></span>
            </div>
            <div class="messageItem_rightside">
              <span>{{ item.user_name }}</span>
              <div v-html="item.message"></div>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="chat_area">
          <div class="chat_area_header">
            <span class="chat_area_who">{{ active_chat }}</span>
          </div>
          <div class="message_show">
            <div
              v-for="(item, index) in messages"
              :key="index"
              :class="item.user != user ? 'message_item' : 'message_item_me'"
            >
              <img
                :src="item.ava"
                alt
                class="message_ava"
                v-if="item.user != user"
                @click="openModal(item.user)"
              />
              <div class="message_item_right" v-if="item.user != user">
                <p class="message_title_you">
                  <span>{{ item.user }}</span>
                  <span class="message_time">{{ item.time }}</span>
                  <span class="level_label"></span>
                </p>
                <div class="message_content_you">
                  <span class="message_triangle_you"></span>
                  <div v-html="item.message"></div>
                </div>
              </div>

              <div class="message_item_right_me" v-if="item.user == user">
                <p class="message_title_me">
                  <span>{{ item.user }}</span>
                  <span class="message_time">{{ item.time }}</span>
                  <span class="level_label"></span>
                </p>
                <div class="message_content_me">
                  <span class="message_triangle_me"></span>
                  <div v-html="item.message"></div>
                </div>
              </div>
              <img
                :src="item.ava"
                alt
                class="message_ava"
                v-if="item.user == user"
              />
            </div>
          </div>
          <div class="message_send">
            <div class="send_btn" @click="submitMessage">
              <span>发送(ctrl+Enter)</span>
            </div>
            <div
              ref="editor"
              class="editor"
              @keypress="handleEditorKeyPress($event)"
            ></div>
          </div>
        </div>
      </div>
    </mu-paper>
    </div>
</template>
<script>
import io from "socket.io-client";
import localforage from "localforage";
import defaultAva from "../images/defaultAva.png";
import Editor from "wangeditor";
import { mapState } from "vuex";
// const socket = io("http://47.105.210.34:8086", {
//   transports: ["websocket", "xhr-polling", "jsonp-polling"],
//   autoConnect: false
// }); //顺带解决本地的跨域

const socket = io("http://localhost:8086", {
  transports: ["websocket", "xhr-polling", "jsonp-polling"],
  autoConnect: false
}); //顺带解决本地的跨域


export default {
  data() {
    return {
      token: "",
      loginStatus: false,
      loading: true,
      user: "",
      pwd: "",
      user_ava: "",
      defaultAva, //默认头像
      bottomNowIndex: null, //当前正在操作的好友 在数组中的位置
      message: "", //发送框内的信息
      /**
       * 当前状态下选中的状态 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       */
      active_type: "chat",
      active_chat: "聊天广场", //当前聊天框所属
      modal_active_user: null, // 加好友弹窗暂存的被添加者
      active_new_friend: null, //当前正在操作的好友请求 数组中的位置
      pannel_active: 0,
      /**
       * 各个列表~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       */
      messages: [], //当前聊天框聊天信息
      stickList: [], //置顶的聊天会话
      messageList: [
        {
          user_name: "聊天广场",
          message: "",
          ava:
            "https://pic2.imgdb.cn/item/642533b2a682492fccf6df9a.jpg",
          is_read: 1,
          message_list: []
        }
      ], //消息栏
      friendList: [], //好友列表
      newFriendList: [], //新的好友请求列表
      /**
       * 编辑器实例~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       */
      editor: undefined
    };
  },
  mounted() {
    //处理连接
    socket.on("connect", () => {
      this.$toast.success("聊天室连接正常");
    });
    //处理失连
    socket.on("disconnect", () => {
      this.$toast.error("失去连接");
      this.loginStatus = false;
    });
    //检查是否已经登录过
    this.checkIfLogin();
    //处理广播
    socket.on("sayback", data => {
      let index = this.findIndexByUsername("聊天广场");
      if (this.active_chat === "聊天广场") {
        this.messageList[index].is_read = 1;
        this.messageList[index].message = data.message;
        this.messageList[index].message_list.push(data);
        this.messages.push(data);
      } else {
        this.messageList[index].message_list.push(data);
        this.messageList[index].is_read = 0;
      }
    });

    //接收点对点聊天消息
    socket.on("chatBack", data => {
      this.handleChatMessage(data);
    });

    //处理自己发出去的消息
    socket.on("chatBackSelf", data => {
      let index = this.findIndexByUsername(this.active_chat);
      this.messages.push(data);
      this.messageList[index].message_list.push(data);
      this.srcollToBottom();
      this.syncToLocal();
    });

    //聊天广场 处理自己的消息
    socket.on("self", data => {
      this.messages.push(data);
      this.messageList[0].message_list.push(data);
    });

    //检查离线消息
    socket.on("offLineMessages", data => {
      data.forEach(item => {
        console.log(item)
        this.handleChatMessage(item);
      });
      // socket.emit("offLineMessagesReceived", { user: this.user });
    });
  },
  beforeDestroy() {
    socket.close();
  },
  methods: {
    initData() {
      //用户头像
      this.user_ava = this.avatarUrl
      //消息记录
      localforage.getItem("chatHistory_" + this.user, (err, value) => {
        err && console.error(err);
        this.messageList = value || this.messageList;
      });
    },
    //聊天广场
    submitMessage(e) {
      e && e.preventDefault();
      if (this.message == "") return;
      if (this.active_chat == "聊天广场") {
        //群发
        socket.emit("say", {
          message: this.message,
          user: this.user,
          user_ava: this.user_ava,
          type: 1
        });
      } else {
        //点对点聊天
        this.chat();
      }
      this.message = "";
      this.editor.txt.html("");
    },
    /**
     * @params - to 发送对象
     */
    chat() {
      socket.emit("chat", {
        message: this.message,
        user: this.user,
        user_ava: this.user_ava,
        to: this.active_chat,
        type: 2
      });
    },
    //检查是否登录
    checkIfLogin() {
        if(localStorage.getItem('jwt')) {
            this.token = localStorage.getItem('jwt');
            socket.open()
            this.user = this.username
            console.log('name',this.username);
            this.user_ava = this.avatarUrl;
            socket.emit("newUser", { user: this.username });
            this.initData();
            this.loginStatus = true;
            this.initEditor();
          }
      // localStorage.getItem("jwt", (err, value) => {
      //   if (!err) {
      //     this.token = value;
      //     console.log('token',value);
      //       if (this.token) {
      //         socket.open();
      //         this.user = res.data.data.user_name;
      //         this.user_ava = res.data.data.user_ava;
      //         localforage.setItem("user_ava", res.data.data.user_ava);
      //         socket.emit("newUser", { user: res.data.data.user_name });
      //         this.initData();
      //         this.loginStatus = true;
      //         this.initEditor();
      //       }
      //   } else {
      //     this.loading = false;
      //   }
      // });
    },

    //点击消息栏某个消息
    focusMessageItem(user_name, index) {
      this.active_chat = user_name;
      this.message = "";
      this.messageList[index].is_read = 1;
      let jsonString = JSON.stringify(this.messageList[index].message_list);
      this.messages = JSON.parse(jsonString);
      this.srcollToBottom();
      this.syncToLocal();
    },

    changeActiveType(type) {
      this.active_type = type;
      if (type == "friend") {
        this.getFriendList();
      }
    },

    openModal(user_name) {
      this.modal_active_user = user_name;
      this.addFriendModal = true;
    },

    closeSimpleDialog() {
      this.modal_active_user = null;
      this.addFriendModal = false;
    },

    //打开用户信息面板
    openUserInfoPanel() {
      this.personnalInfoModal = true;
    },
    //关闭用户信息面板
    closeUserInfoPanel() {
      this.personnalInfoModal = false;
    },

    //请求添加好友
    sendAddFriendTask() {
      if (this.checkIfFriend(this.modal_active_user)) {
        socket.emit("addFriendTo", {
          from: {
            user_name: this.user,
            user_ava: this.user_ava
          },
          to: this.modal_active_user
        });
      }
    },

    //获取好友列表
    getFriendList() {
      localforage
        .getItem("token")
        .then(token => {
          return getFriendList(this.user, token);
        })
        .then(res => {
          if (res.data.errcode == 0) {
            this.friendList = res.data.data.user_friends;
          }
        });
    },

    closeBottomSheet(value) {
      this.bottomSheetOpen = false;
    },

    openBotttomSheet(index) {
      this.bottomNowIndex = index;
      this.bottomSheetOpen = true;
    },

    selectBottomSheet(type) {
      switch (type) {
        case "chat":
          this.active_type = "chat";
          this.message = "";
          //观察是否已经存在活动的对话列表
          for (let i = 0; i < this.messageList.length; i++) {
            if (
              this.messageList[i].user_name ==
              this.friendList[this.bottomNowIndex].user_name
            ) {
              //如果存在了 切换到当前这个人
              this.focusMessageItem(this.messageList[i].user_name, i);
              return;
            }
          }
          //如果没有 先新增 在切换到这个人
          this.messageList.push({
            user_name: this.friendList[this.bottomNowIndex].user_name,
            message: "",
            ava: this.friendList[this.bottomNowIndex].user_ava,
            is_read: 1,
            message_list: []
          });
          this.focusMessageItem(
            this.messageList[this.messageList.length - 1].user_name,
            this.messageList.length - 1
          );
          break;
        case "delete":
          break;
      }
    },

    /**
     * 找到对应账号的人在数组中的位置
     */

    findIndexByUsername(name) {
      let len = this.messageList.length;
      for (let i = 0; i < len; i++) {
        if (this.messageList[i].user_name == name) {
          return i;
        }
      }
      return -1;
    },

    /**
     * 同步到本地历史记录
     */
    syncToLocal() {
      localforage.setItem("chatHistory_" + this.user, this.messageList);
    },

    handleChatMessage(data) {
      let index = this.findIndexByUsername(data.user);
      if (index == -1) {
        this.messageList.push({
          user_name: data.user,
          message: data.message,
          ava: data.ava,
          is_read: 0,
          message_list: [data]
        });
      } else {
        //创建一个未读消息
        this.messageList[index].message = data.message;
        this.messageList[index].message_list.push(data);
        this.messageList[index].is_read = 0;
        if (this.active_chat == data.user) {
          //如果是当前聊天
          this.messages.push(data);
          this.messageList[index].is_read = 1;
        }
      }
      this.srcollToBottom();
      this.syncToLocal();
    },
    srcollToBottom() {
      setTimeout(() => {
        let area = document.getElementsByClassName("message_show")[0];
        area.scrollTop = area.scrollHeight;
      }, 100);
    },
    addFriend() {
      this.$prompt("请输入要添加的账号", "提示").then(({ result, value }) => {
        if (result) {
          if (this.checkIfFriend(value)) {
            socket.emit("addFriendTo", {
              from: {
                user_name: this.user,
                user_ava: this.user_ava
              },
              to: value
            });
            this.$toast.success("请求已发送");
          }
        } else {
          this.$toast.message("取消操作");
        }
      });
    },
    //退出登录
    loginOut() {
      localforage.removeItem("token").then(res => {
        socket.close();
        this.$toast.success("退出登录");
        this.loginStatus = false;
        this.personnalInfoModal = false;
      });
    },
    //初始化编辑器
    initEditor() {
      if (!this.editor) {
        var ed = new Editor(this.$refs.editor);
        console.log(ed);
        ed.menus = [
          "bold", // 粗体
          "fontSize", // 字号
          "fontName", // 字体
          "italic", // 斜体
          "underline", // 下划线
          "strikeThrough", // 删除线
          "foreColor", // 文字颜色
          "backColor", // 背景颜色
          "emoticon", // 表情
          "undo", // 撤销
          "redo" // 重复
        ];
        ed.zIndex = 1;
        let _this = this;
        ed.onchange = function(html) {
          // html 即变化之后的内容
          _this.message = html;
        };
        ed.create();
        this.editor = ed;
      }
    },
    handleEditorKeyPress(e){
      if(e.key=='Enter'&&e.ctrlKey==true){
        this.submitMessage()
      }
    }
  },
  computed: {
    ...mapState([
      "authToken","username","avatarUrl"
      ]),
  },
  
};
</script>
<style  scoped>
@import "../assets/css/home.css";
html,
body {
  width: 100%;
  height: 100%;
}
</style>