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
  <div class="key-dialog">
    <div class="divide-line"></div>
    <el-form
      :model="userForm"
      :rules="rules"
      ref="userForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="公钥信息" prop="publicKey" style="width: 546px;">
        <el-input v-model="userForm.publicKey" placeholder="请输入公钥信息或公钥地址"></el-input>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="modelClose">取 消</el-button>
      <el-button type="primary" @click="submit('userForm')" :loading="loading">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { addPublicKey } from "@/util/api";
import errcode from "@/util/errcode";

export default {
  name: "AddPublicKey",
  data: function() {
    return {
      loading: false,
      userForm: {
        publicKey: ""
      },
      rules: {
        publicKey: [
          {
            required: true,
            message: "请输入公钥信息",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    modelClose: function() {
      this.userForm = Object.assign({
        publicKey: ""
      });
      this.loading = false;
      this.$store.state.creatUserVisible = false;
    },
    submit: function(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm("确认提交？", {
            center: true
          })
            .then(() => {
              this.loading = true;
              this.addKey();
            })
            .catch(() => {
              this.modelClose();
            });
        } else {
          return false;
        }
      });
    },
    addKey() {
      let reqData = {
        username: localStorage.getItem("username"),
        publicKey: this.userForm.publicKey
      };
      addPublicKey(reqData)
        .then(res => {
          this.loading = false;
          if (res.data.code == 0) {
            this.$message({
              type: "success",
              message: "添加公钥成功"
            });
            this.$emit("addPublicKeyClose");
            this.modelClose();
          } else {
            this.modelClose();
            this.$message({
              type: "error",
              message: errcode.errCode[res.data.code].cn
            });
          }
        })
        .catch(err => {
          this.modelClose();
          this.$message({
            type: "error",
            message: "添加公钥失败！"
          });
        });
    }
  }
};
</script>

<style scoped>
.key-dialog {
  margin-top: 10px;
}
.dialog-footer {
  text-align: right;
  margin-right: -5px;
  padding-bottom: 20px;
}
.divide-line {
  border: 1px solid #e7ebf0;
  margin-left: 30px;
  width: 514px;
  margin-top: 15px;
  margin-bottom: 25px;
}
</style>
