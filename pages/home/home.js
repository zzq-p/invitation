const app = getApp();
const config = require('../../config.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    // 布局
    statusBarHeight: 20,
    navBarHeight: 44,
    // 文案
    schoolName: config.schoolName,
    collegeName: config.collegeName,
    grade: config.grade,
    ceremonyName: config.ceremonyName,
    timeText: config.ceremonyTimeText,
    venue: config.venue,
    address: config.address,
    schedule: config.schedule,
    traffic: config.traffic,
    tips: config.tips,
    // 音乐
    musicEnabled: !!config.bgmSrc,
    musicPlaying: false,
    // 倒计时
    started: false,
    cd: { days: '00', hours: '00', mins: '00', secs: '00' },
    // 滚动渐入
    revealStates: new Array(12).fill(false),
    // 出席信息
    rsvp: null
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight
    });
    this.tickCountdown();
    this.timer = setInterval(() => this.tickCountdown(), 1000);
  },

  onReady() {
    // 滚动渐入
    this.observer = wx.createIntersectionObserver(this, {
      observeAll: true,
      thresholds: [0.1]
    });
    this.observer.relativeToViewport({ bottom: -30 }).observe('.reveal', (res) => {
      if (res.intersectionRatio > 0 && res.dataset && res.dataset.idx !== undefined) {
        const idx = res.dataset.idx;
        const key = `revealStates[${idx}]`;
        this.setData({ [key]: true });
      }
    });
  },

  onShow() {
    const rsvp = storage.getRsvp();
    if (rsvp) {
      const ROLE_LABEL = {
        teacher: '教师',
        student: '2027届毕业生',
        alumni: '往届校友',
        guest: '家长及来宾'
      };
      this.setData({
        rsvp: Object.assign({}, rsvp, { roleLabel: ROLE_LABEL[rsvp.role] || rsvp.role })
      });
    }
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
    if (this.observer) this.observer.disconnect();
  },

  /* 返回封面 */
  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/cover/cover' })
    });
  },

  goRsvp() {
    wx.navigateTo({ url: '/pages/rsvp/rsvp' });
  },

  goWishes() {
    wx.navigateTo({ url: '/pages/wishes/wishes' });
  },

  toggleMusic() {
    const playing = app.toggleMusic();
    this.setData({ musicPlaying: playing });
  },

  /* 倒计时 */
  tickCountdown() {
    const target = new Date(config.ceremonyDate.replace(' ', 'T')).getTime();
    let diff = target - Date.now();
    if (isNaN(diff)) return;
    if (diff <= 0) {
      if (!this.data.started) this.setData({ started: true });
      return;
    }
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    this.setData({
      started: false,
      cd: { days: pad(days), hours: pad(hours), mins: pad(mins), secs: pad(secs) }
    });
  }
});
