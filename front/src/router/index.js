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
import Router from "vue-router";
import { getCookie } from "@/util/util";

const main = resolve => require(["@/views/index/main"], resolve);
const publicKeyManagement = resolve =>
  require(["@/views/publicKeyManagement/index"], resolve);
const receiptManagement = resolve =>
  require(["@/views/receiptManagement/index"], resolve);
const deptManagement = resolve =>
  require(["@/views/deptManagement/index"], resolve);
const accountManagement = resolve =>
  require(["@/views/accountManagement/index"], resolve);

Vue.use(Router);
const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "login",
    component: resolve => require(["@/views/login/login"], resolve)
  },
  {
    path: "/",
    component: main,
    name: "公钥管理",
    leaf: true,
    menuShow: true,
    iconCls: "wbs-icon-lock sidebar-icon",
    children: [
      {
        path: "/publicKeyManagement",
        component: publicKeyManagement,
        name: "公钥管理",
        menuShow: true,
        meta: { requireAuth: true }
      }
    ]
  },
  {
    path: "/",
    component: main,
    name: "收据管理",
    leaf: true,
    menuShow: true,
    iconCls: "wbs-icon-regulatory sidebar-icon",
    children: [
      {
        path: "/receiptManagement",
        component: receiptManagement,
        name: "收据管理",
        menuShow: true,
        meta: { requireAuth: true }
      }
    ]
  },
  {
    path: "/",
    component: main,
    name: "账单管理",
    leaf: true,
    menuShow: true,
    iconCls: "wbs-icon-wenjian sidebar-icon",
    children: [
      {
        path: "/deptManagement",
        component: deptManagement,
        name: "账单管理",
        menuShow: true,
        meta: { requireAuth: true }
      }
    ]
  },
  {
    path: "/",
    component: main,
    name: "账户管理",
    leaf: true,
    menuShow: true,
    iconCls: "wbs-icon-xitongguanli sidebar-icon",
    children: [
      {
        path: "/accountManagement",
        component: accountManagement,
        name: "账户管理",
        menuShow: true,
        meta: { requireAuth: true }
      }
    ]
  }
];

const router = new Router({
  routes
});

router.onError(error => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.go(0);
    router.replace(targetPath);
  }
});

export default router;
