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
    <v-contentHead :headTitle="'欠据查看'"></v-contentHead>
    <div class="module-wrapper">
      <div class="search-part">
        <div class="search-part-left" v-if="!disabled">
          <el-button
            type="primary"
            class="search-part-left-btn"
            @click="$store.dispatch('switch_creat_user_dialog')"
          >添加账单</el-button>
        </div>
        <div class="search-part-right">
          <el-input placeholder="请输入债权人公钥地址" v-model="userForm.publicKey" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </div>
      </div>
      <div class="search-table">
        <el-table :data="deptList" tooltip-effect="dark" v-loading="loading">
          <el-table-column
            v-for="head in deptHead"
            :label="head.name"
            :key="head.enName"
            show-overflow-tooltip
            :width="tdWidth[head.enName] || ''"
            align="center"
          >
            <template slot-scope="scope">
              <template v-if="head.enName != 'operate'">
                <span v-if="head.enName ==='creditor' || head.enName ==='debtor'">
                  <i
                    class="wbs-icon-copy font-12 copy-public-key"
                    @click="copyPubilcKey(scope.row[head.enName])"
                    title="复制公钥"
                  ></i>
                  {{scope.row[head.enName]}}
                </span>
                <span v-else>{{ scope.row[head.enName] }}</span>
              </template>
              <template v-else>
                <el-button
                  :disabled="disabled"
                  type="text"
                  size="small"
                  :class="{ grayColor: disabled }"
                  @click="payBack(scope.row)"
                >还款</el-button>
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
      title="添加账单"
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
import creatUser from "./components/addDept";
import { getDept, payback } from "@/util/api";
import errcode from "@/util/errcode";
export default {
  name: "deptManagement",
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
      deptList: [],
      deptHead: [
        {
          enName: "creditor",
          name: "债权人"
        },
        {
          enName: "debtor",
          name: "债务人"
        },
        {
          enName: "amount",
          name: "欠款数额"
        },
        {
          enName: "date",
          name: "还款日期"
        },
        {
          enName: "operate",
          name: "操作"
        }
      ],
      userForm: {
        publicKey: ""
      },
      tdWidth: {
        dept: 450
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
      getDept(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            this.deptList = res.data.data || [];
            this.total = res.data.totalCount;
          }
        })
        .catch(err => {
          console.log(err);
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
    payBack(params) {
      this.loading = true;
      let reqData = {
        debtor: params.debtor,
        creditor: params.creditor
      };
      payback(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            this.getUserInfoData();
          } else {
            console.log(err);
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
