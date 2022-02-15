<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
        title="商品添加信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addGoodsInfo"
        :rules="addGoodsRule"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabsLeave"
          @tab-click="changeTab"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input
                v-model="addGoodsInfo.goods_name"
                placeholder="商品名称不能是纯数字"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品价格"
              prop="goods_price"
              placeholder="价格不能为0"
            >
              <el-input
                type="number"
                v-model="addGoodsInfo.goods_price"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                type="number"
                v-model="addGoodsInfo.goods_weight"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                type="number"
                v-model="addGoodsInfo.goods_number"
                placeholder="数量不能为0"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="selectKeys"
                :options="cate"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyParamsList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="i2"
                  v-for="(i2, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParamsList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3"
            ><el-upload
              :action="uploadURL"
              :headers="uploadHeader"
              :on-success="uploadSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsInfo.goods_introduce">
            </quill-editor>
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="预览" :visible.sync="imgPreviewdialogVisible" width="50%">
      <img :src="previewURL" class="previewimg" />
    </el-dialog>
  </div>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillEditor } from "vue-quill-editor";

export default {
  components: {
    quillEditor,
  },
  data() {
    return {
      activeIndex: "0",
      addGoodsInfo: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addGoodsRule: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      cate: [],
      selectKeys: [],
      // 动态参数，静态属性列表
      manyParamsList: [],
      onlyParamsList: [],
      // 图片上传
      uploadURL: "https://lianghj.top:8888/api/private/v1/upload",
      uploadHeader: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      picList: [],
      // 图片预览框
      previewURL: "",
      imgPreviewdialogVisible: false,
    };
  },
  methods: {
    async getcate() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.cate = res.data;
    },
    // tabs处理函数
    handleChange() {
      if (this.selectKeys.length !== 3) this.selectKeys = [];
    },
    beforeTabsLeave(newTab, oldTab) {
      if (oldTab == "0" && this.selectKeys.length < 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
      return true;
    },
    async changeTab() {
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.selectKeys[2]}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status != 200) return this.$message.error(res.meta.msg);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [];
        });

        this.manyParamsList = res.data;
      }

      if (this.activeIndex == "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.selectKeys[2]}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status != 200) return this.$message.error(res.meta.msg);

        this.onlyParamsList = res.data;
      }
    },
    // 图片上传处理
    handlePreview({ response }) {
      this.previewURL = response.data.url;
      this.imgPreviewdialogVisible = true;
    },
    handleRemove({ response }) {
      const { data } = response;
      this.addGoodsInfo.pics = this.addGoodsInfo.pics.filter((i) => {
        if (i.pic === data.tmp_path) return false;
        return true;
      });
    },
    uploadSuccess(res) {
      const obj = { pic: res.data.tmp_path };
      this.addGoodsInfo.pics.push(obj);
    },
    // 提交商品
    addGood() {
      this.addGoodsInfo.goods_cat = this.selectKeys.join(",");
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请填写必要的表单项！");
        // 合并参数列表
        this.manyParamsList.forEach((item) => {
          const obj = { attr_id: item.attr_id, attr_vals: item.attr_vals };
          this.addGoodsInfo.attrs.push(obj);
        });
        this.onlyParamsList.forEach((item) => {
          const obj = { attr_id: item.attr_id, attr_vals: item.attr_vals };
          this.addGoodsInfo.attrs.push(obj);
        });

        const { data: res } = await this.$http.post("goods", this.addGoodsInfo);
        if (res.meta.status != 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.$refs.addFormRef.resetFields();
      });
    },
  },
  created() {
    this.getcate();
  },
};
</script>

<style scoped lang="less">
.el-checkbox {
  margin: 0 5px 0 0;
}
.previewimg {
  width: 100%;
}
</style>
