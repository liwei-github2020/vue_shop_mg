<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            class="search-box"
            placeholder="搜索订单"
            v-model="queryInfo.query"
          >
            <el-button
              @click="serchOrder"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderslist" stripe border style="width: 100%">
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" align="center">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status == 1" type="success">是</el-tag>
            <el-tag v-else type="warning">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" align="center">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180"
          ><template slot-scope="scope">
            <el-button
              @click="showAddressDialog(scope.row)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              >编辑</el-button
            >
            <el-button
              @click="logisticsDialog(scope.row)"
              type="success"
              icon="el-icon-map-location"
              size="mini"
              >物流</el-button
            >
          </template></el-table-column
        >
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      @close="clearAddress"
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        label-width="100px"
        ref="addressFormRef"
      >
        <el-form-item label="省市/区:" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityOptions"
            :props="{ expandTrigger: 'hover' }"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址:" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="物流信息" :visible.sync="logisticsVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logisticsInfo"
          :key="index"
          :timestamp="activity.ftime"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logisticsVisible = false">取 消</el-button>
        <el-button type="primary" @click="logisticsVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityOptions from "./city/city_data2017_element";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 订单列表
      orderslist: [],
      total: 0,
      // 地址编辑
      addressVisible: false,
      cityOptions: cityOptions,
      addressForm: {
        address1: [],
        address2: "",
      },
      addressRules: {
        address1: [{ required: true, message: "请选择地址", trigger: "blur" }],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      // 物流
      logisticsVisible: false,
      logisticsInfo: [],
    };
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.orderslist = res.data.goods;
      this.total = res.data.total;
    },
    serchOrder() {
      this.getOrdersList();
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrdersList();
    },
    // 地址编辑
    showAddressDialog() {
      this.addressVisible = true;
    },

    // 物流
    async logisticsDialog() {
      this.logisticsVisible = true;
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      this.logisticsInfo = res.data;
    },
    clearAddress() {
      this.$refs.addressFormRef.resetFields();
    },
  },
  created() {
    this.getOrdersList();
  },
};
</script>

<style scoped lang="less">
.search-box {
  margin-bottom: 10px;
}
</style>
