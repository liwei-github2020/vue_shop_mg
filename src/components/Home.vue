<template>
  <div>
    <el-button @click="loginOut">登出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped lang="less">
</style>
