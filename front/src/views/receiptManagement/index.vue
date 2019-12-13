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
    <v-contentHead :headTitle="'收据查看'"></v-contentHead>
    <div class="module-wrapper">
      <div class="search-part"></div>
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
              <template v-if="head.enName != 'operate'">
                <span v-if="head.enName ==='creditor' || head.enName ==='debtor'">
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
                  :class="{ grayColor: disabled }"
                  @click="$store.dispatch('switch_creat_finance_dialog')"
                >融资</el-button>
                <el-button
                  :disabled="disabled"
                  type="text"
                  size="small"
                  :class="{ grayColor: disabled }"
                  @click="$store.dispatch('switch_creat_transfer_dialog')"
                >转让</el-button>
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
      :visible.sync="$store.state.transferVisible"
      title="转让"
      width="621px"
      :append-to-body="true"
      class="dialog-wrapper"
      v-if="$store.state.transferVisible"
      center
    >
      <v-transfer @addPublicKeyClose="addPublicKeyClose" ref="addPublicKey"></v-transfer>
    </el-dialog>
    <el-dialog
      :visible.sync="$store.state.financeVisible"
      title="融资"
      width="621px"
      :append-to-body="true"
      class="dialog-wrapper"
      v-if="$store.state.financeVisible"
      center
    >
      <v-finance @addPublicKeyClose="addPublicKeyClose" ref="addPublicKey"></v-finance>
    </el-dialog>
  </div>
</template>

<script>
import contentHead from "@/components/contentHead";
import { getReceipt } from "@/util/api";
import transfer from "./components/transfer";
import finance from "./components/finance";
import errcode from "@/util/errcode";
export default {
  name: "receiptManagement",
  components: {
    "v-contentHead": contentHead,
    "v-transfer": transfer,
    "v-finance": finance
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
      tdWidth: {
        receipt: 450
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
      getReceipt(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            this.receiptList = res.data.data || [];
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
    addPublicKeyClose() {
      this.getUserInfoData();
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
    finance() {},
    transfer() {},
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
