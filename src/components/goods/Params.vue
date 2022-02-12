<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-alert
            :closable="false"
            show-icon
            title="注意：只允许为第三级分类设置相关参数"
            type="warning"
          >
          </el-alert>
        </el-col>
      </el-row>
      <!-- 分类参数级联选择框 -->
      <el-row class="selectCate">
        选择商品分类：
        <el-cascader
          :props="cascaderProps"
          :options="catelist"
          v-model="selectKeys"
          @change="handelCateChange"
          clearable
        >
        </el-cascader>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            class="button-bottom"
            @click="showParams"
            :disabled="isDisableButton"
            type="primary"
            size="mini"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsList" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  @close="deleteTag(index, scope.row)"
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ 添加标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="showEditDialog(scope.row)"
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  >编辑</el-button
                >
                <el-button
                  @click="deleteParams(scope.row)"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            class="button-bottom"
            @click="showParams"
            :disabled="isDisableButton"
            type="primary"
            size="mini"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyParamsList" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  @close="deleteTag(index, scope.row)"
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ 添加标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="showEditDialog(scope.row)"
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  >编辑</el-button
                >
                <el-button
                  @click="deleteParams(scope.row)"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="setParamsVisiable"
      width="50%"
      @close="addDiologClose"
    >
      <el-form
        :model="addForm"
        status-icon
        :rules="addParamsRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setParamsVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog title="重命名参数" :visible.sync="setEditVisiable" width="50%">
      <el-form
        :model="editForm"
        status-icon
        :rules="editRules"
        ref="editRef"
        label-width="100px"
      >
        <el-form-item label="参数名" prop="attr_name">
          <el-input v-model="editForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setEditVisiable = false">取 消</el-button>
        <el-button type="primary" @click="renameParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类参数列表
      catelist: [],
      // 级联选择框参数配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        // checkStrictly: true,
        expandTrigger: "hover",
      },
      // 选中的分类的id
      selectKeys: [],
      activeName: "many",
      // 获取的参数列表
      manyParamsList: [],
      onlyParamsList: [],
      // 设置参数对话框
      setParamsVisiable: false,
      addForm: {
        attr_name: "",
      },
      addParamsRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      // 设置编辑对话框
      setEditVisiable: false,
      editForm: {},
      editRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 获取分类列表
    async getCatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.catelist = res.data;
    },
    // 处理选择的分类id，并发起请求
    handelCateChange() {
      this.getParemsList();
    },
    // 处理静态 动态参数 按钮的点击，获取对应列表
    handleTabsClick() {
      this.getParemsList();
    },
    // 获取参数数据方法
    async getParemsList() {
      if (this.selectKeys.length != 3) {
        this.selectKeys = [];
        this.onlyParamsList = [];
        this.manyParamsList = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // tag配置
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      if (this.activeName === "many") {
        this.manyParamsList = res.data;
      }
      this.onlyParamsList = res.data;
    },
    showParams() {
      this.setParamsVisiable = true;
    },
    addDiologClose() {
      this.$refs.addFormRef.resetFields();
    },
    async addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getParemsList();
        this.setParamsVisiable = false;
      });
    },
    // 参数编辑命名
    async showEditDialog({ attr_id }) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status != 200) return this.message.error(res.meta.msg);
      this.editForm = res.data;
      this.setEditVisiable = true;
    },
    renameParams() {
      this.$refs.editRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getParemsList();
        this.setEditVisiable = false;
      });
    },
    async deleteParams({ attr_id }) {
      const result = await this.$confirm(
        "此操作删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result != "confirm") return;
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status != 200) return this.message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
      this.getParemsList();
    },
    // tag
    showInput(i) {
      i.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm(i) {
      if (i.inputValue.trim().length === 0) {
        i.inputValue = "";
        i.inputVisible = false;
        return;
      }
      i.attr_vals.push(i.inputValue.trim());
      i.inputValue = "";
      i.inputVisible = false;
      // 提交到后台
      this.submitParamsTag(i);
    },
    // 删除参数标签
    deleteTag(index, row) {
      row.attr_vals.splice(index, 1);
      this.submitParamsTag(row);
    },
    async submitParamsTag(i) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${i.attr_id}`,
        {
          attr_name: i.attr_name,
          attr_sel: i.attr_sel,
          attr_vals: i.attr_vals.join(" "),
        }
      );
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.$message.success("修改成功");
    },
  },
  computed: {
    isDisableButton() {
      if (this.selectKeys.length != 3) return true;
      return false;
    },
    cateId() {
      if (this.selectKeys.length == 3) {
        return this.selectKeys[2];
      }
      return null;
    },
    dialogTitle() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
  created() {
    this.getCatelist();
  },
};
</script>

<style scoped lang="less">
.selectCate {
  margin: 10px 0;
}
.button-bottom {
  margin-bottom: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 90px;
}
</style>
