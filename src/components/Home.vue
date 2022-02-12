<template>
  <el-container class="home-container">
    <el-header>
      <div class="header-title">
        <img src="../assets/logo.png" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">登出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleMenu">|||</div>
        <el-menu
          :collapse="isCollapse"
          background-color="#373d41"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          router
          :collapse-transition="false"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconlist[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              @click="savePath(subItem.path)"
              :index="subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <i class="el-icon-menu"></i>
              <span slot="title">{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconlist: {
        125: "iconfont icon-yonghu",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju-xianxing",
        145: "iconfont icon-wxbbaobiao",
      },
      isCollapse: false,
      activePath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("path");
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    toggleMenu() {
      this.isCollapse = !this.isCollapse;
    },
    savePath(e) {
      this.activePath = e;
      window.sessionStorage.setItem("path", e);
    },
  },
};
</script>

<style scoped lang="less">
.home-container {
  height: 100vh;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ccc;
  background-color: #373d41;

  .header-title {
    display: flex;
    font-size: 36px;
    span {
      padding-left: 20px;
    }
    img {
      height: 55px;
      width: 55px;
      padding: 2px;
      border-radius: 50%;
      background: #fff;
    }
  }
}
.el-aside {
  background-color: #373d41;

  .toggle-button {
    background-color: #4a5064;
    text-align: center;
    color: #ccc;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

  .el-menu {
    border-right: none;
  }
}

.iconfont {
  margin-right: 10px;
}
</style>
