<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- 表单区 -->
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-yonghu"
            placeholder="用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="密码"
            v-model="loginForm.password"
            type="password"
            prefix-icon="iconfont icon-password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="submitLogin">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 2, max: 5, message: "长度在 2 到 5 个字符", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    // 登录表单
    submitLogin() {
      this.$refs.loginForm.validate(async (res) => {
        if (!res) return;
        const { data } = await this.$http.post("login", this.loginForm);
        if (data.meta.status != 200)
          return this.$message.error({ message: data.meta.msg });
        this.$message.success({ message: data.meta.msg });
        window.sessionStorage.setItem("token", data.data.token);
        // 路由跳转
        this.$router.push("/home");
      });
    },
    resetForm() {
      this.$refs.loginForm.resetFields();
    },
  },
};
</script>

<style scoped lang="less">
.login_container {
  height: 100vh;
  background: #2b4b6b;
  position: relative;

  .login_box {
    width: 450px;
    height: 300px;
    border-radius: 5px;
    background: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }
}
.avatar_box {
  position: absolute;
  height: 130px;
  width: 130px;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #eee;
  overflow: hidden;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.login_form {
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>

