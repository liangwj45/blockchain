/* * Copyright 2014-2019 the original author or authors. * * Licensed under the
Apache License, Version 2.0 (the "License"); * you may not use this file except
in compliance with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <div class="rivate-key-management-wrapper">
    <v-contentHead :headTitle="'公钥查看'"></v-contentHead>
    <div class="module-wrapper">
      <div class="search-part">
        <div class="search-part-left" v-if="!disabled">
          <el-button
            type="primary"
            class="search-part-left-btn"
            @click="$store.dispatch('switch_creat_user_dialog')"
          >添加公钥</el-button>
        </div>
        <div class="search-part-right">
          <el-input placeholder="请输入公钥地址" v-model="userForm.publicKey" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </div>
      </div>
      <div class="search-table">
        <el-table :data="publicKeyList" tooltip-effect="dark" v-loading="loading">
          <el-table-column
            v-for="head in publicKeyHead"
            :label="head.name"
            :key="head.enName"
            show-overflow-tooltip
            :width="tdWidth[head.enName] || ''"
            align="center"
          >
            <template slot-scope="scope">
              <template v-if="head.enName != 'operate'">
                <span v-if="head.enName === 'address'">
                  <i
                    class="wbs-icon-copy font-12 copy-public-key"
                    @click="copyPubilcKey(scope.row[head.enName])"
                    title="复制公钥"
                  ></i>
                  {{ scope.row[head.enName] }}
                </span>
              </template>
              <template v-else>
                <el-button
                  :disabled="disabled"
                  type="text"
                  size="small"
                  :class="{ grayColor: disabled }"
                  @click="deleteKey(scope.row)"
                >删除</el-button>
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
      title="添加公钥"
      width="621px"
      :append-to-body="true"
      class="dialog-wrapper"
      v-if="$store.state.creatUserVisible"
      center
    >
      <v-addPublicKey @addPublicKeyClose="addPublicKeyClose" ref="addPublicKey"></v-addPublicKey>
    </el-dialog>
  </div>
</template>

<script>
import contentHead from "@/components/contentHead";
import addPublicKey from "./components/addPublicKey";
import { getPublicKey, deletePublicKey } from "@/util/api";
import errcode from "@/util/errcode";
export default {
  name: "publicKeyManagement",
  components: {
    "v-contentHead": contentHead,
    "v-addPublicKey": addPublicKey
  },
  data() {
    return {
      userName: this.$route.query.userName || "",
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      publicKeyList: [],
      publicKeyHead: [
        {
          enName: "address",
          name: "用户公钥地址信息"
        },
        {
          enName: "operate",
          name: "操作"
        }
      ],
      tdWidth: {
        publicKey: 450
      },
      userForm: {
        publicKey: ""
      },
      disabled: false
    };
  },
  mounted() {
    this.getPublicKeyList();
  },
  methods: {
    getPublicKeyList() {
      this.loading = true;
      let reqData = {
        username: localStorage.getItem("username").replace(/^\s+|\s+$/g, "")
      };
      getPublicKey(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            let data = res.data.data || [];
            this.publicKeyList = [];
            for (let i = 0; i < data.length; i++) {
              this.publicKeyList.push({ address: data[i] });
            }
            this.total = res.data.totalCount;
          } else {
            this.$message({
              type: "error",
              message: errcode.errCode[res.data.code].cn
            });
          }
        })
        .catch(err => {
          this.loading = false;
          // this.$message({
          //   type: "error",
          //   message: "系统错误！"
          // });
        });
    },
    handleSizeChange: function(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getPublicKeyList();
    },
    handleCurrentChange: function(val) {
      this.currentPage = val;
      this.getPublicKeyList();
    },
    addPublicKeyClose() {
      this.getPublicKeyList();
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
    deleteKey(params) {
      this.loading = true;
      let reqData = {
        username: localStorage.getItem("username"),
        publicKey: params.address
      };
      deletePublicKey(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code == 0) {
            this.getPublicKeyList();
            this.$message({
              type: "success",
              message: "删除公钥成功"
            });
          } else {
            this.$message({
              type: "error",
              message: "删除公钥失败"
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message({
            type: "error",
            message: "系统错误"
          });
        });
    },
    search() {},
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
