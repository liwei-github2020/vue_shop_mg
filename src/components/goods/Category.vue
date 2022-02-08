<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row class="button">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <tree-table
        class="tree-table"
        border
        show-index
        :show-row-hover="false"
        :expand-type="false"
        :data="catelist"
        :selection-type="false"
        :columns="columns"
      >
        <!-- 是否选中模板列 -->
        <template slot="isok" scope="scope">
          <i
            class="el-icon-error"
            v-if="scope.row.cat_delete == false"
            style="color: red"
          ></i>
          <i class="el-icon-success" v-else style="color: lightgreen"></i>
        </template>
        <template slot="order" scope="scope">
          <el-tag v-if="scope.row.cat_level == 0"> 一级 </el-tag>
          <el-tag type="success" v-if="scope.row.cat_level == 1"> 二级 </el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level == 2"> 三级 </el-tag>
        </template>
        <template slot="opt" scope="scope">
          <el-button
            @click="showEditCate(scope.row)"
            type="primary"
            icon="el-icon-edit"
            size="mini"
            >编辑</el-button
          >
          <el-button
            @click="deleteCate(scope.row)"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="提示"
      :visible.sync="setAddCateDialogVisiable"
      width="50%"
      @close="addCateClose"
    >
      <el-form
        ref="addCateRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            :props="cascaderProps"
            :options="parentCateList"
            v-model="selectKeys"
            @change="parentCateChange"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setAddCateDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="类名修改"
      :visible.sync="setEditCateDialogVisiable"
      width="50%"
    >
      <el-form ref="editForm" :model="editCateList" label-width="80px">
        <el-form-item label="分类名称:">
          <el-input v-model="editCateList.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setEditCateDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="submitCatename">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 设置添加分类dialog显示
      setAddCateDialogVisiable: false,
      // 分类数据总条数
      total: 0,
      catelist: [],

      // 树形表格配置项
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否选中",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 添加分类表单对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      // 添加分类表单验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // cascader配置项
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger: "hover",
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器选中的数据ID
      selectKeys: [],
      // 控制编辑分类对话框
      setEditCateDialogVisiable: false,
      editCateList: {},
      editCateId: "",
    };
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 分页处理页面size大小改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCatelist();
    },
    //监听页码值改变
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum;
      this.getCatelist();
    },
    // 展示添加分类对话框
    showAddCateDialog() {
      this.getParentCate();
      this.setAddCateDialogVisiable = true;
    },
    // 获取父级分类
    async getParentCate() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.parentCateList = res.data;
    },
    // 监听添加分类 父级分类表单的改变，并处理添加分类的表单
    parentCateChange() {
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        this.addCateForm.cat_level = this.selectKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status != 201) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getCatelist();
        this.setAddCateDialogVisiable = false;
      });
    },
    // 监听对话框关闭并重置表单
    addCateClose() {
      this.$refs.addCateRef.resetFields();
    },
    //删除分类
    async deleteCate(cate) {
      const result = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result == "confirm") {
        const { data: res } = await this.$http.delete(
          "categories/" + cate.cat_id
        );
        if (res.meta.status != 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getCatelist();
      } else {
        this.$message.info("取消了删除");
      }
    },
    // 编辑分类
    async showEditCate(cate) {
      this.editCateId = cate.cat_id;
      const { data: res } = await this.$http.get("categories/" + cate.cat_id);
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.editCateList = res.data;
      this.setEditCateDialogVisiable = true;
    },
    // 编辑提交分类名称
    async submitCatename() {
      const { data: res } = await this.$http.put(
        "categories/" + this.editCateId,
        {
          cat_name: this.editCateList.cat_name,
        }
      );
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
      this.getCatelist();
      this.setEditCateDialogVisiable = false;
    },
  },
  created() {
    this.getCatelist();
  },
};
</script>

<style scoped lang="less">
.button {
  margin-bottom: 10px;
}
.tree-table {
  font-size: 14px;
}
.el-cascader {
  width: 100%;
}
</style>
