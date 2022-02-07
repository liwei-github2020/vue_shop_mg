<template>
  <div class="container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row class="button">
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleslist" stripe border>
        <!-- 角色权限下拉列表 -->
        <el-table-column type="expand" label="">
          <template slot-scope="scope">
            <!--一级权限 -->
            <el-row
              :class="['bg-line', i1 == 0 ? 'bg-top-line-none' : '']"
              v-for="(item, i1) in scope.row.children"
              :key="item.id"
              class="vcenter"
            >
              <el-col :span="5">
                <el-tag closable @close="deleteRight(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[
                    'bg-line',
                    i2 == 0 ? 'bg-top-line-none' : '',
                    'vcenter',
                  ]"
                  v-for="(item2, i2) in item.children"
                  :key="item2.id"
                >
                  <el-col :span="8">
                    <el-tag
                      closable
                      @close="deleteRight(scope.row, item2.id)"
                      type="warning"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="16">
                    <el-tag
                      closable
                      type="success"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="deleteRight(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              >编辑</el-button
            >

            <el-button
              @click="deleteUser(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              >删除</el-button
            >

            <el-button
              @click="showRightDialog(scope.row)"
              type="warning"
              icon="el-icon-setting"
              size="mini"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="提示" :visible.sync="setDiologVisiable" width="50%">
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :default-checked-keys="defKeys"
        default-expand-all
        show-checkbox
        node-key="id"
        :props="treeProps"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDiologVisiable = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleslist: [],
      roleId: "",
      // 控制分配权限对话框
      setDiologVisiable: false,
      // 权限列表
      rightsList: [],
      // 树形控件配置内容
      treeProps: { children: "children", label: "authName" },
      // 默认选中的三级权限的id
      defKeys: [],
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) {
        return this.$messge.error(res.meta.msg);
      }
      this.roleslist = res.data;
    },
    // 移除权限
    async deleteRight(role, rightId) {
      const result = await this.$confirm(
        "此操作将删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result != "confirm") {
        return this.$message.error("取消了删除");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      role.children = res.data;
    },
    // 展示分配权限对话框，并获取权限列表
    async showRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.rightsList = res.data;
      // 调用前清空
      this.defKeys = [];
      this.getLeafkeys(role, this.defKeys);
      this.setDiologVisiable = true;
    },
    //递归获取三级权限的Id
    getLeafkeys(node, arr) {
      if (!node.children) return arr.push(node.id);
      node.children.forEach((item) => {
        this.getLeafkeys(item, arr);
      });
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idstr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idstr,
        }
      );
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.getRolesList();
      this.setDiologVisiable = false;
      this.$message.success(res.meta.msg);
    },
  },
};
</script>

<style scoped lang="less">
.box-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
  font-size: 12px;
}
.button {
  margin-bottom: 10px;
}
.el-tag {
  margin: 8px;
}
.bg-line {
  border-top: 1px solid #eee;
}
.bg-top-line-none {
  border-top: none;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
