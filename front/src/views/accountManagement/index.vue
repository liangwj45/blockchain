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
<template>
  <div class="rivate-key-management-wrapper">
    <v-contentHead :headTitle="'账户查看'"></v-contentHead>
    <div class="module-wrapper">
      <div class="search-part">
        <div class="search-part-left" v-if="!disabled">
          <el-button
            type="primary"
            class="search-part-left-btn"
            @click="$store.dispatch('switch_creat_user_dialog')"
          >添加资产</el-button>
        </div>
        <div class="search-part-right">
          <el-input placeholder="请输入公钥地址" v-model="userForm.publicKey" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </div>
      </div>
      <div class="search-table">
        <el-table :data="receiptList" tooltip-effect="dark" v-loading="loading">
          <el-table-column
            v-for="head in receiptHead"
            :label="head.name"
            :key="head.enName"
            show-overflow-tooltip
            :width="tdWidth[head.enName] || ''"
            align="center"
          >
            <template slot-scope="scope">
              <template v-if="head.enName!='operate'">
                <span v-if="head.enName ==='address'">
                  <i
                    class="wbs-icon-copy font-12 copy-public-key"
                    @click="copyPubilcKey(scope.row[head.enName])"
                    title="复制公钥"
                  ></i>
                  {{scope.row[head.enName]}}
                </span>
                <span v-else>{{scope.row[head.enName]}}</span>
              </template>
              <template v-else>
                <el-button
                  :disabled="disabled"
                  type="text"
                  size="small"
                  :class="{'grayColor': disabled}"
                  @click="modifyDescription(scope.row)"
                >修改</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>
    <el-dialog
      :visible.sync="$store.state.creatUserVisible"
      title="添加资产"
      width="621px"
      :append-to-body="true"
      class="dialog-wrapper"
      v-if="$store.state.creatUserVisible"
      center
    >
      <v-creatUser @creatUserClose="creatUserClose" @bindUserClose="bindUserClose" ref="creatUser"></v-creatUser>
    </el-dialog>
  </div>
</template>


<script>
import contentHead from "@/components/contentHead";
import { getAssets } from "@/util/api";
import creatUser from "./components/addAsset";
import errcode from "@/util/errcode";
export default {
  name: "receiptManagement",
  components: {
    "v-contentHead": contentHead,
    "v-creatUser": creatUser
  },
  data() {
    return {
      userName: this.$route.query.userName || "",
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      receiptList: [],
      receiptHead: [
        {
          enName: "address",
          name: "用户公钥地址信息"
        },
        {
          enName: "amount",
          name: "账户余额"
        }
      ],
      tdWidth: {
        receipt: 450
      },
      userForm: {
        publicKey: ""
      },
      disabled: false
    };
  },
  mounted() {
    this.getUserInfoData();
  },
  methods: {
    getUserInfoData() {
      this.loading = true;
      let reqData = {
        username: localStorage.getItem("username")
      };
      getAssets(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            this.receiptList = res.data.data || [];
            this.total = res.data.totalCount;
          }
        })
        .catch(err => {
          this.loading = false;
          this.$message({
            type: "error",
            message: "系统错误！"
          });
        });
    },
    handleSizeChange: function(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getUserInfoData();
    },
    handleCurrentChange: function(val) {
      this.currentPage = val;
      this.getUserInfoData();
    },
    creatUserInfo() {},
    creatUserClose() {
      this.getUserInfoData();
    },
    bindUserClose() {
      this.getUserInfoData();
    },
    handleClose: function() {
      this.$refs.creatUser.modelClose();
    },
    modifyDescription(params) {
      this.$prompt("请输入用户描述", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.userDescriptionInfo(value, params);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消"
          });
        });
    },
    copyPubilcKey(val) {
      if (!val) {
        this.$message({
          type: "fail",
          showClose: true,
          message: "key为空，不复制。",
          duration: 2000
        });
      } else {
        this.$copyText(val).then(e => {
          this.$message({
            type: "success",
            showClose: true,
            message: "复制成功",
            duration: 2000
          });
        });
      }
    }
  }
};
</script>
<style scoped>
@import "./index.css";
</style>
