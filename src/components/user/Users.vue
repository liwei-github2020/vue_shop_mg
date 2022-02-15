<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20" class="search-box">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
          >
            <el-button @click="searchUser" slot="append" icon="el-icon-search">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">
            添加用户
          </el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label=""></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="showEditDialog(scope.row.id)"
                type="primary"
                icon="el-icon-edit"
                size="mini"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="deleteUser(scope.row.id)"
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="showRoleDialog(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog
        @close="closeAddForm"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
      >
        <el-form
          label-width="70px"
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adduser"> 确 定 </el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息 -->
      <el-dialog title="修改用户" :visible.sync="editVisiable" width="50%">
        <el-form :model="editForm" ref="editFormRef" :rules="editFormRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editVisiable = false">取 消</el-button>
          <el-button type="primary" @click="editFormSubmit"> 确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisiable"
        width="50%"
      >
        <div>
          <p>当前的用户：{{ roleInfo.username }}</p>
          <p>当前的角色：{{ roleInfo.role_name }}</p>
          <p>
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo"> 确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    let checkEmail = (rule, value, cb) => {
      const regEmail =
        /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("邮箱不合法"));
    };
    let checkMobile = (rule, value, cb) => {
      const regEmail =
        /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("手机号不合法"));
    };
    return {
      // 用户参数列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      // 添加用户表单
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加用户表单验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "长度在 3 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },
      userList: [],
      total: 0,
      // 对话框显隐控制
      addDialogVisible: false,
      editVisiable: false,
      setRoleDialogVisiable: false,
      //存储修改用户的数据表单
      editForm: {},
      // 需被分配角色的信息
      roleInfo: {},
      // 所有的角色
      rolesList: [],
      // 选中角色的id
      selectRoleId: "",
    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get("/users", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    // 监听页码值改变
    handleCurrentChange(newChange) {
      this.queryInfo.pagenum = newChange;
      this.getUsersList();
    },
    searchUser() {
      this.getUsersList();
    },
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    // 重置添加用户表单
    closeAddForm() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户
    adduser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.addDialogVisible = false;
        this.getUsersList();
      });
    },
    // 展示修改对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200) {
        this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.editForm = res.data;
      this.editVisiable = !this.editVisiable;
    },
    // 修改对话框提交
    editFormSubmit() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          this.editForm
        );
        if (res.meta.status != 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getUsersList();
        this.editVisiable = false;
      });
    },
    // 删除用户
    async deleteUser(id) {
      const result = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result != "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status != 200) {
        this.$message.error("删除失败");
      }
      this.$message.success(res.meta.msg);
      this.getUsersList();
    },
    //角色分配对话框
    async showRoleDialog(userInfo) {
      this.roleInfo = userInfo;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.rolesList = res.data;
      this.setRoleDialogVisiable = true;
    },
    async saveRoleInfo() {
      if (!this.selectRoleId) return this.$message.error("未分配角色");
      const { data: res } = await this.$http.put(
        `users/${this.roleInfo.id}/role`,
        { rid: this.selectRoleId }
      );
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
      this.getUsersList();
      // 关闭前将数据清空
      this.roleInfo = {};
      this.selectRoleId = "";
      this.setRoleDialogVisiable = false;
    },
  },
};
</script>

<style scoped lang="less">
.search-box {
  margin-bottom: 10px;
}
</style>
