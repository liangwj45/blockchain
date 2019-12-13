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
        <el-form :model="userForm" :rules="rules" ref="userForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="账户" prop="address" style="width: 546px;">
                <el-input v-model="userForm.address" placeholder="请输入公钥信息或公钥地址"></el-input>
            </el-form-item>
            <el-form-item label="数额" prop="amount" style="width: 546px;">
                <el-input v-model="userForm.amount" placeholder="请输入添加的资产数额"></el-input>
            </el-form-item>
        </el-form>
        <div class="dialog-footer">
            <el-button @click="modelClose">取 消</el-button>
            <el-button type="primary" @click="submit('userForm')" :loading="loading">确 定</el-button>
        </div>
    </div>
</template>

<script>
import { addAsset, bindUser } from "@/util/api";
import errcode from "@/util/errcode";

export default {
    name: "addDebt",
    data: function() {
        return {
            loading: false,
            pubKey: false,
            rivKey: true,
            userForm: {
                address: "",
                amount: "",
            },
            timeGranularity: "RIV",
            rules: {
                name: [
                    {
                        required: true,
                        message: "请输入用户名称",
                        trigger: "blur"
                    },
                    {
                        min: 1,
                        max: 12,
                        message: "长度在 1 到 12 个字符",
                        trigger: "blur"
                    }
                ],
                publicKey: [
                    {
                        required: true,
                        message: "请输入公钥信息",
                        trigger: "blur"
                    }
                ]
            },
            groupId: localStorage.getItem("groupId")
        };
    },
    methods: {
        changeKey: function() {
            let type = this.timeGranularity
            this.userForm = {
                name: "",
                explain: "",
                publicKey: ""
            };
            switch (type) {
                case "PUB":
                    this.pubKey = true;
                    this.rivKey = false;
                    break;

                case "RIV":
                    this.pubKey = false;
                    this.rivKey = true;
                    break;
            }
        },
        modelClose: function() {
            this.userForm = Object.assign({
                name: "",
                publicKey: "",
                explain: ""
            });
            this.pubKey = true;
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
                            this.addAsset_();
                        })
                        .catch(() => {
                            this.modelClose();
                        });
                } else {
                    return false;
                }
            });
        },
        addAsset_: function() {
            let reqData = {
                address: this.userForm.address,
                amount: this.userForm.amount
            };
            addAsset(reqData)
                .then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.$emit("success");
                        this.$message({
                            type: "success",
                            message: "添加账单成功"
                        });
                        this.$emit("creatUserClose");
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
                    this.$message({
                        type: "error",
                        message: "添加账单失败！"
                    });
                    this.modelClose();
                });
        },
        getBindUser() {
            let reqData = {
                userName: this.userForm.name,
                publicKey: this.userForm.publicKey,
                groupId: this.groupId,
                description: this.userForm.explain || ""
            };
            bindUser(reqData)
                .then(res => {
                    this.loading = false;
                    if (res.data.code == 0) {
                        this.$message({
                            type: "success",
                            message: "添加用户成功"
                        });
                        this.$emit("bindUserClose");
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
                        message: "添加用户失败！"
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
.radio-key {
    cursor: context-menu;
    font-size: 14px;
}
.base-span-key {
    margin-left: 8px;
    color: #00122c;
}
.pub-key {
    margin-left: 30px;
}
.riv-key {
    margin-left: 50px;
}

.divide-line {
    border: 1px solid #e7ebf0;
    margin-left: 30px;
    width: 514px;
    margin-top: 15px;
    margin-bottom: 25px;
}
</style>
