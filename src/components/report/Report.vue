<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div style="width: 100%; height: 500px" id="chart" ref="chartRef"></div>
    </el-card>
  </div>
</template>

<script>
// import * as echarts from "echarts";//全部引入
// 按需引入
import * as echarts from "echarts/core";
import { GridComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { TitleComponent } from "echarts/components";
import { TooltipComponent } from "echarts/components";
import { LegendComponent } from "echarts/components";

echarts.use([
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
]);

export default {
  data() {
    return {
      // 需合并的对象
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  }, //图表实例
  mounted() {
    this.myinit();
  },
  methods: {
    async myinit() {
      //2.初始化
      let chart = echarts.init(this.$refs.chartRef);
      const { data: res } = await this.$http.get("reports/type/1");
      if (res.meta.status !== 200) return this.$message("获取折线图数据失败!");
      //3.配置数据
      const mergeObj = Object.assign({}, this.options, res.data);
      // 4.传入数据
      chart.setOption(mergeObj);
      window.addEventListener("resize", () => {
        chart.resize(); //页面大小变化后Echarts也更改大小
      });
    },
  },
};
</script>

<style scoped lang="less">
.el-card {
  height: 100%;
  width: 100%;
}
</style>
