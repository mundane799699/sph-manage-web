import { login, logout, getInfo } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { resetRouter, asyncRoutes, anyRoutes, constantRoutes } from "@/router";
import router from "@/router";
import cloneDeep from "lodash/cloneDeep";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: "",
    routes: [],
    roles: [],
    buttons: [],
    resultAsyncRoutes: [],
    // 最终需要展示的全部路由
    resultAllRoutes: [],
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  // 存储用户信息
  SET_USER_INFO: (state, userInfo) => {
    state.name = userInfo.name;
    state.avatar = userInfo.avatar;
    state.routes = userInfo.routes;
    state.buttons = userInfo.buttons;
    state.roles = userInfo.roles;
  },
  // 最终计算出来的异步路由
  SET_RESULT_ASYNC_ROUTES: (state, resultAsyncRoutes) => {
    state.resultAsyncRoutes = resultAsyncRoutes;
    state.resultAllRoutes = constantRoutes.concat(
      state.resultAsyncRoutes,
      anyRoutes
    );
    console.log("resultAllRoutes = ", state.resultAllRoutes);
    // 给路由器添加新的路由
    router.addRoutes(state.resultAllRoutes);
  },
};

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { username, password } = userInfo;
    let result = await login({ username: username.trim(), password: password });
    if (result.code === 20000) {
      const { data } = result;
      commit("SET_TOKEN", data.token);
      setToken(data.token);
      return "ok";
    } else {
      return Promise.reject(new Error("failed"));
    }
  },

  // get user info
  getInfo({ commit, state }) {
    console.log("getInfo");
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          const { data } = response;

          if (!data) {
            return reject("Verification failed, please Login again.");
          }
          commit("SET_USER_INFO", data);
          console.log("userInfo = ", data);
          commit(
            "SET_RESULT_ASYNC_ROUTES",
            computeAsyncRoutes(cloneDeep(asyncRoutes), data.routes)
          );
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  },
};

const computeAsyncRoutes = (asyncRoutes, routes) => {
  return asyncRoutes.filter((item) => {
    if (routes.includes(item.name)) {
      if (item.children && item.children.length) {
        item.children = computeAsyncRoutes(item.children, routes);
      }
      return true;
    }
  });
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
