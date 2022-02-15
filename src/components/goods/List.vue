<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20" class="search-box">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getGoodsList()"
            clearable
          >
            <el-button
              @click="getGoodsList"
              slot="append"
              icon="el-icon-search"
            >
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGood"> 添加商品 </el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsInfoList" stripe border style="width: 100%">
        <el-table-column type="index" label="@"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价值" width="100px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="170px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              >编辑</el-button
            >
            <el-button
              @click="deleteGoods(scope.row)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: { query: "", pagenum: 1, pagesize: 10 },
      // 商品信息列表
      goodsInfoList: [],
      total: 0,
      addGoodsDialogVisible: false,
    };
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) {
        this.$message.error(res.meta.status);
      }
      this.goodsInfoList = res.data.goods;
      this.total = res.data.total;
      // console.log(res);
    },
    searchGoods() {},

    // 分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum;
      this.getGoodsList();
    },
    // 删除商品数据
    async deleteGoods({ goods_id }) {
      const result = await this.$confirm(
        "此操作将删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result == "confirm") {
        const { data: res } = await this.$http.delete(`goods/${goods_id}`);

        if (res.meta.status != 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getGoodsList();
      } else {
        this.$message.info("取消了删除");
      }
    },
    // 添加商品按钮跳转
    addGood() {
      this.$router.push("goodAdd");
    },
  },
  created() {
    this.getGoodsList();
  },
};
</script>

<style scoped lang="less">
.search-box {
  margin-bottom: 10px;
}
</style>
