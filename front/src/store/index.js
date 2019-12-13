/*
 * Copyright 2014-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
  creatUserVisible: false, //creat account
  financeVisible: false, //creat account
  transferVisible: false, //creat account
  isLogin: 0,
  loading: false
};
export default new Vuex.Store({
  state,
  getters: {
    not_show(state) {
      return !state.creatUserVisible;
    }
  },
  mutations: {
    switch_creat_user_dialog(state) {
      state.creatUserVisible = !state.creatUserVisible;
    },
    switch_creat_finance_dialog(state) {
      state.financeVisible = !state.financeVisible;
    },
    switch_creat_transfer_dialog(state) {
      state.transferVisible = !state.transferVisible;
    },
    changeLogin(state, status) {
      state.isLogin = status;
    },
    showLoading(state) {
      state.loading = true;
    },
    hideLoading(state) {
      state.loading = false;
    }
  },
  actions: {
    switch_creat_user_dialog(context) {
      context.commit("switch_creat_user_dialog");
    },
    switch_creat_finance_dialog(context) {
      context.commit("switch_creat_finance_dialog");
    },
    switch_creat_transfer_dialog(context) {
      context.commit("switch_creat_transfer_dialog");
    },
    loginAction({ commit }) {
      commit("changeLogin", 1);
    }
  }
});
