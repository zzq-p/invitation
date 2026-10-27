const config = require('./config.js');

App({
  globalData: {
    // 状态栏与胶囊按钮尺寸（自定义导航栏用）
    statusBarHeight: 20,
    navBarHeight: 44,
    menuRight: 0,
    // 背景音乐
    musicPlaying: false,
    audioCtx: null
  },

  onLaunch() {
    this.initLayout();
    this.initMusic();
  },

  /** 计算自定义导航栏布局 */
  initLayout() {
    try {
      const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      const menu = wx.getMenuButtonRect ? wx.getMenuButtonRect() : wx.getMenuButtonBoundingClientRect();
      this.globalData.statusBarHeight = winInfo.statusBarHeight || 20;
      if (menu) {
        // 导航栏高度 = 胶囊上下边距对称 + 胶囊高度
        this.globalData.navBarHeight =
          (menu.top - winInfo.statusBarHeight) * 2 + menu.height;
        this.globalData.menuRight = winInfo.windowWidth - menu.left;
      }
    } catch (e) {
      this.globalData.statusBarHeight = 20;
      this.globalData.navBarHeight = 44;
    }
  },

  /** 初始化全局背景音乐（config.bgmSrc 为空时不启用） */
  initMusic() {
    if (!config.bgmSrc) return;
    const ctx = wx.createInnerAudioContext();
    ctx.src = config.bgmSrc;
    ctx.loop = true;
    ctx.obeyMuteSwitch = false;
    ctx.onError(() => {
      this.globalData.musicPlaying = false;
    });
    this.globalData.audioCtx = ctx;
  },

  /** 切换背景音乐，返回切换后的播放状态 */
  toggleMusic() {
    const ctx = this.globalData.audioCtx;
    if (!ctx) return false;
    if (this.globalData.musicPlaying) {
      ctx.pause();
      this.globalData.musicPlaying = false;
    } else {
      ctx.play();
      this.globalData.musicPlaying = true;
    }
    return this.globalData.musicPlaying;
  }
});
