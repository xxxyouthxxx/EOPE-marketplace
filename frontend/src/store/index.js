import { createStore } from "vuex";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";
import router from "@/router/index.js";
import Web3 from "web3";
// import getWeb3 from "../utils/getWeb3;";
const SERVER_URL = process.env.VUE_APP_SERVER_URL;
// const SERVER_URL = http://localhost:8081;

const GANACHE_SERVER_URL = "http://20.196.209.2:8545";

let web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_SERVER_URL));
// 下面的 createStore 是用于创建一个 store 对象，这个对象是用于存储数据的
export default createStore({
  plugins: [createPersistedState()],  // localStorage的存储，createPersistedState()是一个插件,用于将vuex中的数据存储到localStorage中
  // state 内部存储的是数据，类似于组件中的 data
  state: {
    authToken: localStorage.getItem("jwt"), // 从localStorage中获取token
    username: null,   // 用户名
    myAddress: null,  // 用户地址
    userId: null,     // 用户id
    password: null,   // 用户密码
    ExhibitionsCards: [ // 展览卡片
      {
        id: 1,
        dateDay: 1,
        dateMonth: "April",
        cardImage: "https://cdn.pixabay.com/photo/2020/06/18/09/10/city-5312660__340.jpg",
        title: "Let's Go To Mars!",
        content:
          "Curabitur aliquet quam id dui posuere blandit. Pellentesque in ipsum id orci porta dapibus. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Vivamus suscipit tortor eget felis porttitor volutpat.<br/>Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Sed porttitor lectus nibh.<br/>Proin eget tortor risus. Donec rutrum congue leo eget malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.",
        creators: "Curabitur aliquet quam id dui posuere blandit. Donec rutrum congue leo eget malesuada.",
        curators: "Sunghyun",
        image: [
          "https://w.namu.la/s/2405a2a9d1d8f5f6ab689cb37ed1806ba4a8a0107b23242252f23f1e526c0ead19f9c2a1263a266538519a1a6de9c2becb62f7d20d8e4f7745a28b137c98a4d9dddb882ebbaeac0b4ca27300e9d4b81b512e46e34a0f309d6e14342cf9b49cb7",
          "https://imgnn.seoul.co.kr/img/upload/2016/10/11/SSI_20161011144833_V.jpg",
        ],
      },
      {
        id: 2,
        dateDay: 8,
        dateMonth: "Februrary",
        cardImage: "https://images.prismic.io/superrare/6d3a6dcc-f22d-4bad-ae66-7c16dc5d0c7f_LunaIkuta-SuperRare.png?auto=compress,format",
        title: "Vogue Singapore x Luna Ikuta",
        creators: "Praesent sapien massa, convallis a pellentesque nec.",
        curators: "Sunghyun",
        content:
          "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.",
        image: ["https://img.vogue.co.kr/vogue/2020/08/style_5f45be6804e86-1040x1400.jpg", "https://img.vogue.co.kr/vogue/2020/08/style_5f45bea99dec2-1049x1400.jpg"],
      },
      {
        id: 3,
        dateDay: 5,
        dateMonth: "February",
        cardImage: "https://cdn.pixabay.com/photo/2022/03/01/02/51/galaxy-7040416__480.png",
        title: "For Ukraine Artist Support the Cause",
        creators: "Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. ",
        curators: "Sunghyun",
        content:
          "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish.",
        image: ["https://t1.daumcdn.net/cfile/tistory/0153AF4F517F395F14", "http://kunsang1001.cafe24.com/main_images_set/x9788926387696.jpg"],
      },
      {
        id: 4,
        dateDay: 14,
        dateMonth: "January",
        cardImage: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Picasso_-_P%C3%AAche_de_nuit_%C3%A0_Antibes_%28Q110152500%29.jpg",
        title: "Are you okay?",
        creators: "Vestibulum ante ipsum, luctus et ultrices ",
        curators: "Sunghyun",
        content:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. ",
        image: ["https://t1.daumcdn.net/cfile/tistory/9975434D5BD3F11520", "https://newsimg.hankookilbo.com/cms/articlerelease/2021/06/29/078107fe-18fa-4b42-9234-acd3e35ed68d.jpg"],
      },
    ],
  },
  // mutations内存放的是方法，方法的第一个参数是state，第二个参数是传递过来的参数，
  // 这里的参数是token，也就是我们登录成功后返回的token，
  // 我们将token存储到state中，同时也存储到localStorage中，
  // 这样我们就可以在页面刷新的时候从localStorage中获取token，
  // 然后将token赋值给state，这样我们就不用每次都登录了。
  mutations: {
    SET_TOKEN: function (state, token) {
      state.authToken = token;
      localStorage.setItem("jwt", token);
    },
    REMOVE_TOKEN: function (state) {
      localStorage.removeItem("jwt");
      state.authToken = "";
    },
    REMOVE_ADDRESS: function (state) {
      state.myAddress = "";
    },
    REMOVE_USERNAME: function (state) {
      state.username = "";
    },
    REMOVE_ID: function (state) {
      state.userId = "";
    },
    SET_USERNAME: function (state, credentials) {
      state.username = credentials.memberId;
    },
    // return newAddress.address;

    SET_ADDRESS: function (state, newAddress) {
      state.myAddress = newAddress;
      console.log(state.myAddress, typeof state.myAddress);
      // return newAddress.address;
    },
    SET_ID: function (state, newId) {
      state.userId = newId;
    },
    // EXHIBITION_CARDS: function (state, cards) {
    //   state.ExhibitionsCards = cards;
    // },
  },
  // actions内存放的是方法
  actions: {
    // 这里的方法是登录的方法，第一个参数是context，我们可以通过context.state获取stat
    login: function ({ commit }, credentials) {
      console.log(credentials, "证书");
      // 调用axios的post方法
      axios({
        method: "post",  // 请求方法
        url: `${SERVER_URL}/api/members/login`,  // 这里是我们的接口地址
        data: {
          // 这里是我们要传递的参数
          memberId: credentials.memberId,
          memberPassword: credentials.memberPassword,
        },
      })
        .then((res) => {  // 这里是我们请求成功后返回的数据
          console.log(res, "我在这里"); // 我们可以在控制台打印一下，看看我们返回的数据
          if (res.data.memberAddress) {  // 如果返回的数据中有token，那么就将token存储到localStorage中
            commit("SET_TOKEN", res.headers.authorization); 
            commit("SET_USERNAME", credentials); 
            commit("SET_ADDRESS", res.data.memberAddress); 
            commit("SET_ID", res.data.memberSeq);
            router.push({ name: "Home" });
          } else { // 否则通过dispatch调用wallet获取token
            this.dispatch("wallet");
            commit("SET_TOKEN", res.headers.authorization);
            commit("SET_USERNAME", credentials);
            commit("SET_ID", res.data.memberSeq);
            router.push({ name: "Home" });
          }
        })
        .catch(() => {
          alert("登录信息不匹配。");
        });
    },
    // logout用于退出登录，我们将token从localStorage中移除，同时将state中的token置为空
    logout: function ({ commit }) {
      commit("REMOVE_TOKEN");
      commit("REMOVE_ADDRESS");
      commit("REMOVE_USERNAME");
      commit("REMOVE_ID");
      router.push({ name: "Home" });
      // router.push({ name: "Login" });
    },
    // 通过调用axios发送POST请求，向服务器发送一个包含用户注册信息的FormData对象，并使用Content-Type头部指定了媒体类型为multipart/form-data。
    // 在请求成功时，通过dispatch方法调用了Vuex中的login action，将用户的注册信息传递给login方法进行登录验证。
    // 如果请求失败，则弹出一个提示框，提示用户注册失败的原因。
    // 在具体实现中，credentials对象包含了用户注册时填写的信息，包括会员ID、会员密码、会员个人简介和用户上传的头像文件等。
    // FormData对象用于处理多部分数据，可以让我们方便地向服务器传递包含文件上传的表单数据。
    // axios将该对象作为data属性的值传递给POST请求，发送给服务器进行处理。
    signup: function ({ commit }, credentials) {
      let data = new FormData();
      data.append("memberId", credentials.memberId);
      data.append("memberPassword", credentials.memberPassword);
      data.append("memberBio", credentials.memberBio);
      data.append("profileImage", credentials.file);
      // console.log(credentials, "credentials");
      axios({
        method: "post",
        url: `${SERVER_URL}/api/members/register`,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: data,
      })
        .then((res) => {
          console.log("账户创建成功");
          this.dispatch("login", credentials);
        })
        .catch(() => {
          alert("密码不匹配或您已经注册。");
        });
    },
    // 修改钱包地址
    myAddress: function ({ commit }, credentials) {
      let address = credentials;
      axios({
        method: "PUT",
        url: `${SERVER_URL}/api/members/wallet`,
        data: {
          wallet: address,
        },
        headers: {
          Authorization: this.state.authToken,
        },
      })
        .then((res) => {
          console.log("成功");
        })
        .catch(() => {
          alert("失败");
        });
      commit("SET_ADDRESS", address);
    },
    async wallet({ commit }) {
      console.log("실행은?");
      let newAddress = await web3.eth.accounts.create();
      let myAddress = await commit("SET_ADDRESS", newAddress.address);
      alert("Warning: keep your private key safely \n Private key : " + newAddress.privateKey);
      // let getbalance = await web3.eth.getBalance(newAddress.address);
      // await console.log(getbalance, "계좌 조회");
      // await console.log(newAddress.address, "잘가나용?");
      await console.log(newAddress, "계좌정보");
      await console.log(this.state.authToken, "토큰은요?");
      await axios({
        method: "PUT",
        url: `${SERVER_URL}/api/members/wallet`,
        data: {
          wallet: newAddress.address,
        },
        headers: {
          Authorization: this.state.authToken,
        },
      })
        .then((res) => {
          console.log("성공");
        })
        .catch(() => {
          alert("실패");
        });
    },
  },
  // getter属性，用于获取当前用户的登录状态、请求头部信息和用户名信息。
  getters: {
    // 判断用户的authToken属性是否存在，若存在则返回true，说明用户已登录，反之则返回false。
    isLogin: function (state) {
      return state.authToken ? true : false;
    },
    // 返回一个包含Authorization信息的对象，用于在axios请求头部中传递用户的token信息
    config: function (state) {
      return {
        Authorization: `JWT ${state.authToken}`,
      };
    },
    // 返回当前用户的用户名信息，方便在应用中进行调用。
    myUsername: function (state) {
      return state.username;
    },
  },
});
