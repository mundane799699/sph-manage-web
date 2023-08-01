import mockRequest from "@/utils/mockRequest";

const state = {
  list: {},
};
const mutations = {
  GET_DATA(state, list) {
    state.list = list;
  },
};
const actions = {
  async getData({ commit }) {
    let result = await mockRequest.get("/home/list");
    if (result.code === 20000) {
      commit("GET_DATA", result.data);
    }
  },
};
const getters = {};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
